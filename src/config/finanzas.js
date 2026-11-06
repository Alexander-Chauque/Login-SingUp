// Caja y gastos en Firestore. Solo puede haber una caja abierta a la vez.
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  Timestamp,
  where,
} from "firebase/firestore";

import { db } from "./firebaseConfig";
import {
  auditar,
  conMensaje,
  fechaComoTexto,
  milisegundos,
  obtenerUsuarioActual,
  redondear,
} from "./firestore";
import { inicioDelPeriodo } from "./reportes";

const MAXIMO_OBSERVACIONES = 1000;

// Guarda el número de la última caja y cuál está abierta. La transacción lo protege.
const refControl = () => doc(db, "contadores", "cajas");

// Acepta la coma decimal que suele usarse en Argentina
function leerMonto(texto, { minimo = 0, mensaje }) {
  const limpio = String(texto ?? "").trim().replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(limpio) || Number(limpio) < minimo) throw new Error(mensaje);
  return Number(limpio);
}

function leerObservaciones(texto, nombre) {
  const limpio = (texto || "").trim();
  if (limpio.length > MAXIMO_OBSERVACIONES) {
    throw new Error(`Las observaciones de ${nombre} no pueden superar los ${MAXIMO_OBSERVACIONES} caracteres.`);
  }
  return limpio;
}

const saldoEsperado = (caja) => redondear(caja.saldo_inicial - caja.total_egresos);

function cajaParaPantalla(caja) {
  return {
    ...caja,
    fecha_apertura: fechaComoTexto(caja.fecha_apertura),
    fecha_arqueo: fechaComoTexto(caja.fecha_arqueo),
    fecha_cierre: fechaComoTexto(caja.fecha_cierre),
    saldo_calculado: saldoEsperado(caja),
  };
}

const gastoParaPantalla = (gasto) => ({ ...gasto, fecha_hora: fechaComoTexto(gasto.fecha_hora) });

// ---------- CAJA ----------

// Devuelve la caja abierta, o null si no hay ninguna
export function obtenerCajaAbierta() {
  return conMensaje(async () => {
    const resultado = await getDocs(query(collection(db, "cajas"), where("estado_caja", "==", "abierto")));
    return resultado.empty ? null : cajaParaPantalla(resultado.docs[0].data());
  });
}

export function listarCajas({ periodo = "todo", estado = "" } = {}) {
  return conMensaje(async () => {
    const inicio = inicioDelPeriodo(periodo);
    const resultado = await getDocs(collection(db, "cajas"));
    return resultado.docs
      .map((documento) => documento.data())
      .filter((caja) => milisegundos(caja.fecha_apertura) >= inicio && (!estado || caja.estado_caja === estado))
      .sort((a, b) => milisegundos(b.fecha_apertura) - milisegundos(a.fecha_apertura))
      .map(cajaParaPantalla);
  });
}

// La caja y sus gastos, del más reciente al más antiguo
export function obtenerCaja(id) {
  return conMensaje(async () => {
    const [documento, gastos] = await Promise.all([
      getDoc(doc(db, "cajas", id)),
      getDocs(query(collection(db, "gastos"), where("caja", "==", id))),
    ]);
    if (!documento.exists()) throw new Error("Esta caja ya no existe.");
    return {
      caja: cajaParaPantalla(documento.data()),
      gastos: gastos.docs
        .map((gasto) => gasto.data())
        .sort((a, b) => milisegundos(b.fecha_hora) - milisegundos(a.fecha_hora))
        .map(gastoParaPantalla),
    };
  });
}

export function abrirCaja({ saldoInicial, observaciones }) {
  return conMensaje(async () => {
    const saldo = leerMonto(saldoInicial, {
      mensaje: "El saldo inicial debe ser un número válido y no negativo.",
    });
    const texto = leerObservaciones(observaciones, "apertura");
    const usuario = await obtenerUsuarioActual();

    return runTransaction(db, async (transaccion) => {
      const control = await transaccion.get(refControl());
      const datos = control.exists() ? control.data() : { ultimo: 0, abierta: null };
      if (datos.abierta) {
        throw new Error(`No se puede abrir otra caja. La caja N.º ${datos.abierta} ya se encuentra abierta.`);
      }
      const id = String(datos.ultimo + 1);
      transaccion.set(doc(db, "cajas", id), {
        id_caja: id,
        estado_caja: "abierto",
        fecha_apertura: Timestamp.now(),
        empleado_apertura: usuario.id_empleado,
        empleado_apertura_nombre: usuario.nombre,
        saldo_inicial: saldo,
        total_egresos: 0,
        observaciones_apertura: texto,
        fecha_arqueo: null,
        empleado_arqueo_nombre: null,
        saldo_esperado: 0,
        saldo_contado: 0,
        diferencia_caja: 0,
        observaciones_arqueo: "",
        fecha_cierre: null,
        empleado_cierre_nombre: null,
        saldo_final: 0,
        observaciones_cierre: "",
      });
      transaccion.set(refControl(), { ultimo: datos.ultimo + 1, abierta: id });
      auditar(transaccion, usuario, {
        tabla: "Caja",
        accion: "CREAR",
        registro: id,
        actual: `Caja abierta. Saldo inicial: $${saldo}`,
      });
      return id;
    });
  });
}

// Compara lo que hay contado con lo que debería haber. Se puede repetir mientras esté abierta.
export function realizarArqueo(id, { saldoContado, observaciones }) {
  return conMensaje(async () => {
    const contado = leerMonto(saldoContado, {
      mensaje: "El saldo contado debe ser un número válido y no negativo.",
    });
    const texto = leerObservaciones(observaciones, "arqueo");
    const usuario = await obtenerUsuarioActual();

    await runTransaction(db, async (transaccion) => {
      const referencia = doc(db, "cajas", id);
      const documento = await transaccion.get(referencia);
      if (!documento.exists()) throw new Error("Esta caja ya no existe.");
      const caja = documento.data();
      if (caja.estado_caja !== "abierto") {
        throw new Error("No se puede realizar el arqueo de una caja cerrada.");
      }
      const esperado = saldoEsperado(caja);
      const diferencia = redondear(contado - esperado);
      transaccion.update(referencia, {
        saldo_esperado: esperado,
        saldo_contado: contado,
        diferencia_caja: diferencia,
        observaciones_arqueo: texto,
        empleado_arqueo_nombre: usuario.nombre,
        fecha_arqueo: Timestamp.now(),
      });
      auditar(transaccion, usuario, {
        tabla: "Caja",
        accion: "MODIFICAR",
        registro: id,
        actual: `Arqueo. Esperado: $${esperado}, contado: $${contado}, diferencia: $${diferencia}`,
      });
    });
  });
}

export function cerrarCaja(id, { observaciones }) {
  return conMensaje(async () => {
    const texto = leerObservaciones(observaciones, "cierre");
    const usuario = await obtenerUsuarioActual();

    await runTransaction(db, async (transaccion) => {
      const referencia = doc(db, "cajas", id);
      const [documento, control] = [await transaccion.get(referencia), await transaccion.get(refControl())];
      if (!documento.exists()) throw new Error("Esta caja ya no existe.");
      const caja = documento.data();
      if (caja.estado_caja !== "abierto") throw new Error("La caja ya está cerrada.");
      const final = saldoEsperado(caja);
      transaccion.update(referencia, {
        estado_caja: "cerrado",
        fecha_cierre: Timestamp.now(),
        empleado_cierre_nombre: usuario.nombre,
        saldo_final: final,
        observaciones_cierre: texto,
      });
      transaccion.set(refControl(), { ultimo: control.data().ultimo, abierta: null });
      auditar(transaccion, usuario, {
        tabla: "Caja",
        accion: "MODIFICAR",
        registro: id,
        anterior: "Estado: abierto",
        actual: `Estado: cerrado. Saldo final: $${final}`,
      });
    });
  });
}

// ---------- GASTOS ----------

export function listarGastos() {
  return conMensaje(async () => {
    const resultado = await getDocs(collection(db, "gastos"));
    return resultado.docs
      .map((documento) => documento.data())
      .sort((a, b) => milisegundos(b.fecha_hora) - milisegundos(a.fecha_hora))
      .map(gastoParaPantalla);
  });
}

export function obtenerGasto(id) {
  return conMensaje(async () => {
    const documento = await getDoc(doc(db, "gastos", id));
    if (!documento.exists()) throw new Error("Este gasto ya no existe.");
    return gastoParaPantalla(documento.data());
  });
}

function leerGasto(datos) {
  const descripcion = (datos.descripcion || "").trim();
  if (!descripcion) throw new Error("La descripción es obligatoria.");
  const monto = leerMonto(datos.monto, {
    minimo: 0.01,
    mensaje: "El monto debe ser un número válido mayor que cero.",
  });
  return { descripcion, monto };
}

// Se registra siempre en la caja abierta
export function crearGasto(datos) {
  return conMensaje(async () => {
    const { descripcion, monto } = leerGasto(datos);
    const usuario = await obtenerUsuarioActual();

    await runTransaction(db, async (transaccion) => {
      const control = await transaccion.get(refControl());
      const idCaja = control.exists() ? control.data().abierta : null;
      if (!idCaja) {
        throw new Error("No hay una caja abierta. Debes abrir una caja antes de registrar gastos.");
      }
      const refCaja = doc(db, "cajas", idCaja);
      const [caja, categoria] = [
        await transaccion.get(refCaja),
        datos.categoria ? await transaccion.get(doc(db, "categorias_gasto", datos.categoria)) : null,
      ];
      if (!categoria?.exists() || !categoria.data().estado_categoria_gasto) {
        throw new Error("Seleccioná una categoría de gasto activa.");
      }
      const nuevo = doc(collection(db, "gastos"));
      transaccion.set(nuevo, {
        id_gasto: nuevo.id,
        caja: idCaja,
        categoria: datos.categoria,
        categoria_nombre: categoria.data().nombre_categoria_gasto,
        descripcion,
        monto,
        fecha_hora: Timestamp.now(),
        empleado: usuario.id_empleado,
        empleado_nombre: usuario.nombre,
      });
      transaccion.update(refCaja, { total_egresos: redondear(caja.data().total_egresos + monto) });
      auditar(transaccion, usuario, {
        tabla: "Gasto",
        accion: "CREAR",
        registro: nuevo.id,
        actual: `${descripcion}: $${monto}. Caja N.º ${idCaja}`,
      });
    });
  });
}

export function editarGasto(id, datos) {
  return conMensaje(async () => {
    const { descripcion, monto } = leerGasto(datos);
    const usuario = await obtenerUsuarioActual();

    await runTransaction(db, async (transaccion) => {
      const referencia = doc(db, "gastos", id);
      const documento = await transaccion.get(referencia);
      if (!documento.exists()) throw new Error("Este gasto ya no existe.");
      const gasto = documento.data();
      const refCaja = doc(db, "cajas", gasto.caja);
      const [caja, categoria] = [
        await transaccion.get(refCaja),
        datos.categoria ? await transaccion.get(doc(db, "categorias_gasto", datos.categoria)) : null,
      ];
      if (caja.data().estado_caja !== "abierto") {
        throw new Error("No se pueden modificar gastos de una caja cerrada.");
      }
      // Se acepta una categoría inactiva solo si el gasto ya la usaba
      if (!categoria?.exists() || (!categoria.data().estado_categoria_gasto && datos.categoria !== gasto.categoria)) {
        throw new Error("Seleccioná una categoría válida.");
      }
      transaccion.update(referencia, {
        descripcion,
        monto,
        categoria: datos.categoria,
        categoria_nombre: categoria.data().nombre_categoria_gasto,
      });
      transaccion.update(refCaja, {
        total_egresos: redondear(caja.data().total_egresos - gasto.monto + monto),
      });
      auditar(transaccion, usuario, {
        tabla: "Gasto",
        accion: "MODIFICAR",
        registro: id,
        anterior: `${gasto.descripcion}: $${gasto.monto}`,
        actual: `${descripcion}: $${monto}`,
      });
    });
  });
}

export function eliminarGasto(id) {
  return conMensaje(async () => {
    const usuario = await obtenerUsuarioActual();
    await runTransaction(db, async (transaccion) => {
      const referencia = doc(db, "gastos", id);
      const documento = await transaccion.get(referencia);
      if (!documento.exists()) throw new Error("Este gasto ya no existe.");
      const gasto = documento.data();
      const refCaja = doc(db, "cajas", gasto.caja);
      const caja = await transaccion.get(refCaja);
      if (caja.data().estado_caja !== "abierto") {
        throw new Error("No se pueden eliminar gastos de una caja cerrada.");
      }
      transaccion.delete(referencia);
      transaccion.update(refCaja, { total_egresos: redondear(caja.data().total_egresos - gasto.monto) });
      auditar(transaccion, usuario, {
        tabla: "Gasto",
        accion: "ELIMINAR",
        registro: id,
        anterior: `${gasto.descripcion}: $${gasto.monto}`,
        actual: "Eliminado",
      });
    });
  });
}
