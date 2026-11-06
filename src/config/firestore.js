// Datos que la app guarda en Firestore. Las pantallas ya migradas piden los datos desde acá.
import {
  collection,
  doc,
  getDoc,
  getCountFromServer,
  getDocs,
  query,
  runTransaction,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

// Pasa los errores de Firestore a un mensaje listo para mostrar en pantalla
function mensajeDeError(error) {
  if (error?.code === "permission-denied") return "No tenés permiso para realizar esta acción.";
  if (error?.code === "unavailable") return "No hay conexión con Firebase. Revisá tu internet.";
  return error?.message || "No se pudo completar la operación.";
}

// Ejecuta una operación y, si falla, lanza un error con un mensaje claro
export async function conMensaje(operacion) {
  try {
    return await operacion();
  } catch (error) {
    throw new Error(mensajeDeError(error));
  }
}

// Ejemplo: "tomate perita" -> "Tomate Perita"
export const conMayusculas = (texto) =>
  texto
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(" ");

// Agrega el registro de auditoría a un lote o una transacción: se guarda junto con el cambio
export function auditar(escritor, usuario, { tabla, accion, registro, anterior = "", actual = "" }) {
  const referencia = doc(collection(db, "auditoria"));
  escritor.set(referencia, {
    id_log: referencia.id,
    tabla,
    accion,
    registro_id: String(registro),
    valores_anteriores: anterior,
    valores_actuales: `Desde la app. ${actual}`,
    fecha_hora: Timestamp.now(),
    empleado: usuario.id_empleado ?? null,
    empleado_nombre: usuario.nombre ?? "Sistema",
  });
}

// Devuelve los datos del empleado: nombre, usuario, teléfono, cargo, nivel y permisos
export function obtenerUsuarioActual() {
  return conMensaje(async () => {
    // El correo une la cuenta de Firebase con el empleado
    const correo = auth.currentUser.email.toLowerCase();
    const usuario = await getDoc(doc(db, "usuarios", correo));
    if (!usuario.exists() || usuario.data().activo === false) {
      throw new Error("Tu correo no corresponde a un empleado activo.");
    }
    return usuario.data();
  });
}

// Ejemplo: ["ingredientes:leer", "ingredientes:escribir"]
export async function obtenerPermisos() {
  const usuario = await obtenerUsuarioActual();
  return usuario.permisos;
}

// Cuenta documentos sin descargarlos
async function contar(coleccion, ...filtros) {
  const respuesta = await getCountFromServer(query(collection(db, coleccion), ...filtros));
  return respuesta.data().count;
}

// Los números de la pantalla de inicio
export function obtenerResumen() {
  return conMensaje(async () => {
    const [platos, bebidas, mesasTotales, mesasOcupadas, comandasPendientes] = await Promise.all([
      contar("platos", where("estado_plato", "==", true)),
      contar("bebidas", where("disponible_bebida", "==", true)),
      contar("mesas"),
      contar("mesas", where("estado_mesa", "==", false)),
      contar("comandas", where("estado_comanda", "in", ["pendiente", "en_preparacion"])),
    ]);
    return {
      productos: platos + bebidas,
      mesas_ocupadas: mesasOcupadas,
      mesas_totales: mesasTotales,
      comandas_pendientes: comandasPendientes,
    };
  });
}

export function listarIngredientes() {
  return conMensaje(async () => {
    const resultado = await getDocs(collection(db, "ingredientes"));
    return resultado.docs
      .map((documento) => documento.data())
      .sort((a, b) => a.nombre_ingrediente.localeCompare(b.nombre_ingrediente, "es"));
  });
}

// Busca los platos que usan un ingrediente. Reemplaza al JOIN de MySQL.
async function platosQueUsan(idIngrediente) {
  const consulta = query(
    collection(db, "platos"),
    where("ingredientes_ids", "array-contains", idIngrediente),
  );
  const resultado = await getDocs(consulta);
  return resultado.docs;
}

// Cada plato tiene una copia de sus ingredientes. Esta función actualiza esa copia.
function copiaActualizada(plato, idIngrediente, cambios) {
  return plato.ingredientes.map((ingrediente) =>
    ingrediente.id_ingrediente === idIngrediente ? { ...ingrediente, ...cambios } : ingrediente,
  );
}

// Firestore no revisa que un dato sea único: se comprueba acá antes de guardar
async function hayRepetido(nombre, unidad, idPropio) {
  const consulta = query(collection(db, "ingredientes"), where("unidad_medida", "==", unidad));
  const resultado = await getDocs(consulta);
  return resultado.docs.some(
    (documento) =>
      documento.id !== idPropio &&
      documento.data().nombre_ingrediente.toLowerCase() === nombre.toLowerCase(),
  );
}

// Crea un ingrediente, o lo modifica si recibe idExistente
export function guardarIngrediente(datos, idExistente) {
  return conMensaje(async () => {
    const nombre = conMayusculas(datos.nombre_ingrediente);
    if (await hayRepetido(nombre, datos.unidad_medida, idExistente)) {
      throw new Error("Ya existe un ingrediente con ese nombre y unidad.");
    }
    const campos = { ...datos, nombre_ingrediente: nombre };
    const usuario = await obtenerUsuarioActual();
    const descripcion = `Nombre: ${nombre}, Unidad: ${datos.unidad_medida}, Costo: ${datos.costo_unitario}`;
    // El lote guarda todos los cambios juntos: o se aplican todos, o ninguno
    const lote = writeBatch(db);

    if (idExistente) {
      lote.update(doc(db, "ingredientes", idExistente), campos);
      auditar(lote, usuario, { tabla: "Ingrediente", accion: "MODIFICAR", registro: idExistente, actual: descripcion });
      // El nombre y la unidad también están copiados dentro de los platos
      const platos = await platosQueUsan(idExistente);
      platos.forEach((plato) => {
        lote.update(plato.ref, {
          ingredientes: copiaActualizada(plato.data(), idExistente, {
            nombre_ingrediente: nombre,
            unidad_medida: datos.unidad_medida,
          }),
        });
      });
    } else {
      // doc() sin id genera uno nuevo. Se guarda también como campo, igual que los importados.
      const nuevo = doc(collection(db, "ingredientes"));
      lote.set(nuevo, { ...campos, id_ingrediente: nuevo.id, estado_ingrediente: true });
      auditar(lote, usuario, { tabla: "Ingrediente", accion: "CREAR", registro: nuevo.id, actual: descripcion });
    }
    await lote.commit();
  });
}

// ---------- PLATOS Y BEBIDAS ----------

// Platos y bebidas se guardan igual: esta tabla indica qué cambia entre uno y otro
const PRODUCTOS = {
  plato: { coleccion: "platos", campoNombre: "nombre_plato", campoEstado: "estado_plato", tabla: "Plato" },
  bebida: { coleccion: "bebidas", campoNombre: "nombre_bebida", campoEstado: "disponible_bebida", tabla: "Bebida" },
};

// Palabras que quedan en minúscula en el nombre de un plato
const MINUSCULAS_PLATO = ["de", "del", "la", "las", "los", "y", "a", "al", "con", "sin", "en", "por", "para"];

// Ejemplo: "locro DE la casa" -> "Locro de la Casa"
const nombreDePlato = (texto) =>
  texto
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((palabra, posicion) =>
      posicion > 0 && MINUSCULAS_PLATO.includes(palabra)
        ? palabra
        : palabra.charAt(0).toUpperCase() + palabra.slice(1),
    )
    .join(" ");

// Lee una colección completa y la ordena por uno de sus campos
async function listarOrdenado(coleccion, campo) {
  const resultado = await getDocs(collection(db, coleccion));
  return resultado.docs
    .map((documento) => documento.data())
    .sort((a, b) => a[campo].localeCompare(b[campo], "es"));
}

export const listarProductos = (tipo) =>
  conMensaje(() => listarOrdenado(PRODUCTOS[tipo].coleccion, PRODUCTOS[tipo].campoNombre));

export const listarCategorias = () =>
  conMensaje(() => listarOrdenado("categorias", "nombre_categoria_plato"));

export const listarTiposBebida = () =>
  conMensaje(() => listarOrdenado("tipos_bebida", "nombre_tipo_bebida"));

export function obtenerProducto(tipo, id) {
  return conMensaje(async () => {
    const producto = await getDoc(doc(db, PRODUCTOS[tipo].coleccion, id));
    if (!producto.exists()) throw new Error("Este producto ya no existe.");
    return producto.data();
  });
}

const textoDisponible = (disponible) => (disponible ? "Disponible" : "No disponible");

export function cambiarEstadoProducto(tipo, id, disponible) {
  const { coleccion, campoEstado, tabla } = PRODUCTOS[tipo];
  return conMensaje(async () => {
    const usuario = await obtenerUsuarioActual();
    const lote = writeBatch(db);
    lote.update(doc(db, coleccion, id), { [campoEstado]: !disponible });
    auditar(lote, usuario, {
      tabla,
      accion: "MODIFICAR",
      registro: id,
      anterior: `Estado: ${textoDisponible(disponible)}`,
      actual: `Estado: ${textoDisponible(!disponible)}`,
    });
    await lote.commit();
  });
}

// Firestore no revisa que un dato sea único: se comprueba acá antes de guardar
async function nombreRepetido(tipo, nombre, idPropio) {
  const { coleccion, campoNombre } = PRODUCTOS[tipo];
  const resultado = await getDocs(collection(db, coleccion));
  return resultado.docs.some(
    (documento) =>
      documento.id !== idPropio &&
      documento.data()[campoNombre].toLowerCase() === nombre.toLowerCase(),
  );
}

// Crea un plato, o lo modifica si recibe idExistente
export function guardarPlato(datos, idExistente) {
  return conMensaje(async () => {
    const nombre = nombreDePlato(datos.nombre_plato);
    if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s/-]+$/.test(nombre)) {
      throw new Error("Nombre inválido: solo se permiten letras, números, espacios, / y -");
    }
    if (await nombreRepetido("plato", nombre, idExistente)) {
      throw new Error(`Plato "${nombre}" ya existe`);
    }

    const [categoria, plato, ...ingredientes] = await Promise.all([
      getDoc(doc(db, "categorias", datos.categoria)),
      idExistente ? getDoc(doc(db, "platos", idExistente)) : null,
      ...datos.ingredientes_ids.map((id) => getDoc(doc(db, "ingredientes", id))),
    ]);
    if (!categoria.exists()) throw new Error("La categoría elegida ya no existe.");

    // Conserva la cantidad de los ingredientes que siguen en el plato
    const anteriores = plato?.data().ingredientes || [];
    const copias = ingredientes.map((documento) => {
      const anterior = anteriores.find((item) => item.id_ingrediente === documento.id);
      // Solo se aceptan activos, o inactivos que el plato ya usaba
      if (!documento.exists() || (!documento.data().estado_ingrediente && !anterior)) {
        throw new Error("Hay ingredientes que no existen o no están disponibles");
      }
      const ingrediente = documento.data();
      return {
        id_ingrediente: documento.id,
        nombre_ingrediente: ingrediente.nombre_ingrediente,
        estado_ingrediente: ingrediente.estado_ingrediente,
        unidad_medida: ingrediente.unidad_medida,
        cantidad: anterior?.cantidad ?? 1,
      };
    });

    const campos = {
      nombre_plato: nombre,
      precio_plato: datos.precio_plato,
      categoria: datos.categoria,
      categoria_nombre: categoria.data().nombre_categoria_plato,
      descripcion_plato: datos.descripcion_plato,
      ingredientes_ids: datos.ingredientes_ids,
      ingredientes: copias,
    };
    const usuario = await obtenerUsuarioActual();
    const descripcion = `Nombre: ${nombre}, Precio: ${datos.precio_plato}, Categoría: ${campos.categoria_nombre}`;
    const lote = writeBatch(db);
    if (idExistente) {
      lote.update(doc(db, "platos", idExistente), campos);
      auditar(lote, usuario, { tabla: "Plato", accion: "MODIFICAR", registro: idExistente, actual: descripcion });
    } else {
      const nuevo = doc(collection(db, "platos"));
      lote.set(nuevo, { ...campos, id_plato: nuevo.id, estado_plato: true });
      auditar(lote, usuario, { tabla: "Plato", accion: "CREAR", registro: nuevo.id, actual: descripcion });
    }
    await lote.commit();
  });
}

// Crea una bebida, o la modifica si recibe idExistente
export function guardarBebida(datos, idExistente) {
  return conMensaje(async () => {
    const nombre = conMayusculas(datos.nombre_bebida);
    if (await nombreRepetido("bebida", nombre, idExistente)) {
      throw new Error("Esta bebida ya existe");
    }
    const tipo = await getDoc(doc(db, "tipos_bebida", datos.id_tipo_bebida));
    if (!tipo.exists()) throw new Error("El tipo elegido ya no existe.");

    const campos = {
      nombre_bebida: nombre,
      precio_bebida: datos.precio_bebida,
      id_tipo_bebida: datos.id_tipo_bebida,
      tipo_nombre: tipo.data().nombre_tipo_bebida,
      descripcion_bebida: datos.descripcion_bebida,
    };
    const usuario = await obtenerUsuarioActual();
    const descripcion = `Nombre: ${nombre}, Precio: ${datos.precio_bebida}`;
    const lote = writeBatch(db);
    if (idExistente) {
      lote.update(doc(db, "bebidas", idExistente), campos);
      auditar(lote, usuario, { tabla: "Bebida", accion: "MODIFICAR", registro: idExistente, actual: descripcion });
    } else {
      const nuevo = doc(collection(db, "bebidas"));
      lote.set(nuevo, { ...campos, id_bebida: nuevo.id, disponible_bebida: true });
      auditar(lote, usuario, { tabla: "Bebida", accion: "CREAR", registro: nuevo.id, actual: descripcion });
    }
    await lote.commit();
  });
}

// ---------- MESAS ----------

// Estados en los que una comanda sigue abierta
const ESTADOS_ABIERTOS = ["pendiente", "en_preparacion", "entregado"];

// Firestore entrega las fechas como un objeto Timestamp
export const milisegundos =(fecha) => (fecha?.toMillis ? fecha.toMillis() : new Date(fecha).getTime());

// Devuelve { id de mesa: id de su comanda abierta más reciente }
async function comandasAbiertasPorMesa() {
  const consulta = query(collection(db, "comandas"), where("estado_comanda", "in", ESTADOS_ABIERTOS));
  const resultado = await getDocs(consulta);
  const abiertas = {};
  resultado.docs
    .map((documento) => documento.data())
    // Se recorre de la más antigua a la más reciente: la última que se guarda es la que queda
    .sort((a, b) => milisegundos(a.fecha_hora) - milisegundos(b.fecha_hora))
    .forEach((comanda) => {
      abiertas[comanda.mesa] = comanda.id_comanda;
    });
  return abiertas;
}

export function listarMesas() {
  return conMensaje(async () => {
    const [resultado, abiertas] = await Promise.all([
      getDocs(collection(db, "mesas")),
      comandasAbiertasPorMesa(),
    ]);
    return resultado.docs
      .map((documento) => {
        const mesa = documento.data();
        return { ...mesa, comanda_abierta: abiertas[mesa.id_mesa] ?? null };
      })
      .sort((a, b) => a.numero_mesa - b.numero_mesa);
  });
}

// Alterna entre disponible y ocupada. No libera una mesa con una comanda abierta.
export function cambiarEstadoMesa(mesa) {
  return conMensaje(async () => {
    const abiertas = await comandasAbiertasPorMesa();
    if (!mesa.estado_mesa && abiertas[mesa.id_mesa]) {
      throw new Error(`No se puede liberar la mesa ${mesa.numero_mesa}: tiene una comanda abierta.`);
    }
    const nuevoEstado = !mesa.estado_mesa;
    const usuario = await obtenerUsuarioActual();
    const textoMesa = (disponible) => (disponible ? "Disponible" : "Ocupada");
    const lote = writeBatch(db);
    lote.update(doc(db, "mesas", mesa.id_mesa), { estado_mesa: nuevoEstado });
    auditar(lote, usuario, {
      tabla: "Mesa",
      accion: "MODIFICAR",
      registro: mesa.id_mesa,
      anterior: `Estado: ${textoMesa(mesa.estado_mesa)}`,
      actual: `Estado: ${textoMesa(nuevoEstado)}`,
    });
    await lote.commit();
    return { ...mesa, estado_mesa: nuevoEstado, comanda_abierta: abiertas[mesa.id_mesa] ?? null };
  });
}

// ---------- COMANDAS ----------

const NOMBRES_ESTADO = {
  pendiente: "Pendiente",
  en_preparacion: "En Preparación",
  entregado: "Entregado",
  pagado: "Pagado",
  anulado: "Anulado",
  cancelado: "Cancelado",
};

const METODOS_DE_PAGO = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta de Débito/Crédito",
  transferencia: "Transferencia",
  mercadopago: "Mercado Pago",
};

const CANTIDAD_MAXIMA = 999;

// Evita errores de decimales. Ejemplo: 0.1 + 0.2 da 0.30000000000000004
export const redondear = (numero) => Math.round(numero * 100) / 100;

// Las pantallas muestran las fechas como texto
export const fechaComoTexto =(fecha) => (fecha?.toDate ? fecha.toDate().toISOString() : fecha);

const estaAbierta = (comanda) => ESTADOS_ABIERTOS.includes(comanda.estado_comanda);

// Agrega a los datos guardados lo que las pantallas necesitan calcular
export function comandaParaPantalla(comanda) {
  const abierta = estaAbierta(comanda);
  return {
    ...comanda,
    fecha_hora: fechaComoTexto(comanda.fecha_hora),
    esta_abierta: abierta,
    puede_modificarse: abierta && comanda.pagos.length === 0,
    pagos: comanda.pagos.map((pago) => ({
      ...pago,
      metodo: pago.metodo_nombre,
      fecha_hora: fechaComoTexto(pago.fecha_hora),
    })),
  };
}

const referenciaProducto = (tipo, id) => doc(db, PRODUCTOS[tipo].coleccion, id);

// Nombre, precio y disponibilidad actuales de un plato o una bebida
function datosDeProducto(tipo, datos) {
  return tipo === "plato"
    ? { nombre: datos.nombre_plato, precio: datos.precio_plato, disponible: datos.estado_plato }
    : { nombre: datos.nombre_bebida, precio: datos.precio_bebida, disponible: datos.disponible_bebida };
}

const claveDeItem = (item) => `${item.tipo}-${item.id}`;

// Revisa lo que se pidió y lee cada producto dentro de la transacción.
// Devuelve { clave: { tipo, id, cantidad, nombre, precio, disponible } }
async function leerPedido(transaccion, items) {
  if (!Array.isArray(items) || !items.length) {
    throw new Error("Agregá al menos un plato o una bebida.");
  }
  const cantidades = {};
  for (const item of items) {
    if (!PRODUCTOS[item.tipo] || !item.id) throw new Error("Hay un producto inválido en la comanda.");
    if (!Number.isInteger(item.cantidad) || item.cantidad < 1 || item.cantidad > CANTIDAD_MAXIMA) {
      throw new Error(`La cantidad debe estar entre 1 y ${CANTIDAD_MAXIMA}.`);
    }
    const clave = claveDeItem(item);
    cantidades[clave] = {
      tipo: item.tipo,
      id: item.id,
      cantidad: (cantidades[clave]?.cantidad || 0) + item.cantidad,
    };
  }
  const pedido = {};
  for (const [clave, item] of Object.entries(cantidades)) {
    const producto = await transaccion.get(referenciaProducto(item.tipo, item.id));
    if (!producto.exists()) throw new Error("Hay un producto que ya no existe.");
    pedido[clave] = { ...item, ...datosDeProducto(item.tipo, producto.data()) };
  }
  return pedido;
}

// Lo que se guarda de cada producto, y el total con los precios actuales
function itemsYTotal(pedido) {
  const items = Object.values(pedido).map(({ tipo, id, nombre, precio, cantidad }) => ({
    tipo,
    id,
    nombre,
    precio,
    cantidad,
  }));
  const total = redondear(items.reduce((suma, item) => suma + item.precio * item.cantidad, 0));
  return { items, total };
}

// Lista las comandas más recientes, opcionalmente de una mesa o solo las abiertas
export function listarComandas({ mesa, soloAbiertas } = {}) {
  return conMensaje(async () => {
    const filtros = [];
    if (mesa) filtros.push(where("mesa", "==", mesa));
    if (soloAbiertas) filtros.push(where("estado_comanda", "in", ESTADOS_ABIERTOS));
    const resultado = await getDocs(query(collection(db, "comandas"), ...filtros));
    return resultado.docs
      .map((documento) => documento.data())
      .sort((a, b) => milisegundos(b.fecha_hora) - milisegundos(a.fecha_hora))
      .slice(0, 100)
      .map(comandaParaPantalla);
  });
}

export function obtenerComanda(id) {
  return conMensaje(async () => {
    const documento = await getDoc(doc(db, "comandas", id));
    if (!documento.exists()) throw new Error("Esta comanda ya no existe.");
    const comanda = documento.data();
    // La disponibilidad cambia con el tiempo: se consulta cada vez
    const productos = await Promise.all(
      comanda.items.map((item) => getDoc(referenciaProducto(item.tipo, item.id))),
    );
    const items = comanda.items.map((item, posicion) => ({
      ...item,
      disponible: productos[posicion].exists()
        ? datosDeProducto(item.tipo, productos[posicion].data()).disponible
        : false,
    }));
    return comandaParaPantalla({ ...comanda, items });
  });
}

// Lo que se puede pedir: platos y bebidas disponibles
export function listarProductosParaComanda() {
  return conMensaje(async () => {
    const [platos, bebidas] = await Promise.all([
      getDocs(query(collection(db, "platos"), where("estado_plato", "==", true))),
      getDocs(query(collection(db, "bebidas"), where("disponible_bebida", "==", true))),
    ]);
    const lista = (documentos, tipo, categoria) =>
      documentos
        .map((documento) => {
          const datos = documento.data();
          const { nombre, precio } = datosDeProducto(tipo, datos);
          return { tipo, id: documento.id, nombre, precio, categoria: datos[categoria] };
        })
        .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    return [
      ...lista(platos.docs, "plato", "categoria_nombre"),
      ...lista(bebidas.docs, "bebida", "tipo_nombre"),
    ];
  });
}

// Crea la comanda y ocupa la mesa. Devuelve el id de la comanda nueva.
export function crearComanda({ mesa: idMesa, observaciones, items }) {
  return conMensaje(async () => {
    if (!idMesa) throw new Error("Seleccioná una mesa válida.");
    const usuario = await obtenerUsuarioActual();
    const abiertas = await comandasAbiertasPorMesa();

    // La transacción garantiza que dos personas no ocupen la misma mesa a la vez
    return runTransaction(db, async (transaccion) => {
      const refMesa = doc(db, "mesas", idMesa);
      const refContador = doc(db, "contadores", "comandas");
      const [mesa, contador] = [await transaccion.get(refMesa), await transaccion.get(refContador)];
      if (!mesa.exists()) throw new Error("Seleccioná una mesa válida.");
      if (!mesa.data().estado_mesa || abiertas[idMesa]) {
        throw new Error(`La mesa ${mesa.data().numero_mesa} no está disponible.`);
      }

      const pedido = await leerPedido(transaccion, items);
      const noDisponibles = Object.values(pedido).filter((p) => !p.disponible).map((p) => p.nombre);
      if (noDisponibles.length) throw new Error(`No está disponible: ${noDisponibles.join(", ")}.`);

      // Mantiene los números seguidos: la siguiente a la #20 es la #21
      const numero = (contador.exists() ? contador.data().ultimo : 0) + 1;
      const id = String(numero);
      const { items: guardados, total } = itemsYTotal(pedido);
      transaccion.set(doc(db, "comandas", id), {
        id_comanda: id,
        mesa: idMesa,
        mesa_numero: mesa.data().numero_mesa,
        empleado: usuario.id_empleado,
        mozo: usuario.nombre,
        estado_comanda: "pendiente",
        estado_nombre: NOMBRES_ESTADO.pendiente,
        fecha_hora: Timestamp.now(),
        observaciones_comanda: (observaciones || "").trim(),
        total_comanda: total,
        total_pagado: 0,
        saldo_pendiente: total,
        fecha_anulacion: null,
        motivo_anulacion: "",
        usuario_anulacion: null,
        items: guardados,
        pagos: [],
      });
      transaccion.update(refContador, { ultimo: numero });
      transaccion.update(refMesa, { estado_mesa: false });
      auditar(transaccion, usuario, {
        tabla: "Comanda",
        accion: "CREAR",
        registro: id,
        actual: `Mesa: ${mesa.data().numero_mesa}. Total: $${total}`,
      });
      return id;
    });
  });
}

// Con pagos registrados solo se puede agregar, igual que en la web
export function actualizarComanda(id, { observaciones, items }) {
  return conMensaje(async () => {
    const usuario = await obtenerUsuarioActual();
    await runTransaction(db, async (transaccion) => {
      const referencia = doc(db, "comandas", id);
      const documento = await transaccion.get(referencia);
      if (!documento.exists()) throw new Error("Esta comanda ya no existe.");
      const comanda = documento.data();
      if (!estaAbierta(comanda)) {
        throw new Error(`La comanda #${id} está cerrada: no se puede editar.`);
      }

      const pedido = await leerPedido(transaccion, items);
      const anteriores = {};
      comanda.items.forEach((item) => {
        anteriores[claveDeItem(item)] = (anteriores[claveDeItem(item)] || 0) + item.cantidad;
      });

      if (comanda.pagos.length) {
        const reduce = Object.entries(anteriores).some(
          ([clave, cantidad]) => (pedido[clave]?.cantidad || 0) < cantidad,
        );
        if (reduce) {
          throw new Error(
            "La comanda tiene pagos registrados: podés agregar productos, pero no quitar ni reducir los que ya tenía.",
          );
        }
      }
      Object.entries(pedido).forEach(([clave, item]) => {
        if (!item.disponible && item.cantidad > (anteriores[clave] || 0)) {
          throw new Error(`${item.nombre} no está disponible: no se puede agregar ni aumentar.`);
        }
      });

      // Al recalcular con precios actuales, el total podría quedar debajo de lo cobrado
      const { items: guardados, total } = itemsYTotal(pedido);
      if (total < comanda.total_pagado) {
        throw new Error(
          `El nuevo total ($${total}) no puede ser menor a lo ya cobrado ($${comanda.total_pagado}).`,
        );
      }
      transaccion.update(referencia, {
        observaciones_comanda: (observaciones || "").trim(),
        items: guardados,
        total_comanda: total,
        saldo_pendiente: redondear(total - comanda.total_pagado),
      });
      auditar(transaccion, usuario, {
        tabla: "Comanda",
        accion: "MODIFICAR",
        registro: id,
        anterior: `Total: $${comanda.total_comanda}`,
        actual: `Total: $${total}`,
      });
    });
  });
}

// Cambia entre pendiente, en preparación y entregado, o anula la comanda
export function cambiarEstadoComanda(id, nuevoEstado, motivo = "") {
  return conMensaje(async () => {
    const usuario = await obtenerUsuarioActual();
    await runTransaction(db, async (transaccion) => {
      const referencia = doc(db, "comandas", id);
      const documento = await transaccion.get(referencia);
      if (!documento.exists()) throw new Error("Esta comanda ya no existe.");
      const comanda = documento.data();
      if (!estaAbierta(comanda)) throw new Error(`La comanda #${id} ya está cerrada.`);

      const refMesa = doc(db, "mesas", comanda.mesa);
      if (nuevoEstado === "anulado") {
        if (comanda.pagos.length) {
          throw new Error("La comanda tiene pagos registrados: no se puede anular.");
        }
        const motivoLimpio = motivo.trim();
        if (!motivoLimpio) throw new Error("Escribí el motivo de la anulación.");
        transaccion.update(referencia, {
          estado_comanda: "anulado",
          estado_nombre: NOMBRES_ESTADO.anulado,
          fecha_anulacion: Timestamp.now(),
          motivo_anulacion: motivoLimpio.slice(0, 250),
          usuario_anulacion: usuario.id_empleado,
        });
        transaccion.update(refMesa, { estado_mesa: true });
        auditar(transaccion, usuario, {
          tabla: "Comanda",
          accion: "ANULAR",
          registro: id,
          anterior: `Estado: ${comanda.estado_comanda}`,
          actual: `Estado: anulado. Motivo: ${motivoLimpio.slice(0, 250)}`,
        });
      } else if (ESTADOS_ABIERTOS.includes(nuevoEstado)) {
        transaccion.update(referencia, {
          estado_comanda: nuevoEstado,
          estado_nombre: NOMBRES_ESTADO[nuevoEstado],
        });
        transaccion.update(refMesa, { estado_mesa: false });
        auditar(transaccion, usuario, {
          tabla: "Comanda",
          accion: "MODIFICAR",
          registro: id,
          anterior: `Estado: ${comanda.estado_comanda}`,
          actual: `Estado: ${nuevoEstado}`,
        });
      } else {
        throw new Error("Estado no válido.");
      }
    });
    return obtenerComanda(id);
  });
}

// Solo se elimina si sigue abierta y no tiene pagos. Libera la mesa.
export function eliminarComanda(id) {
  return conMensaje(async () => {
    const usuario = await obtenerUsuarioActual();
    await runTransaction(db, async (transaccion) => {
      const referencia = doc(db, "comandas", id);
      const documento = await transaccion.get(referencia);
      if (!documento.exists()) throw new Error("Esta comanda ya no existe.");
      const comanda = documento.data();
      if (!estaAbierta(comanda) || comanda.pagos.length) {
        throw new Error(`La comanda #${id} ya tiene pagos o está cerrada: no se puede eliminar.`);
      }
      transaccion.delete(referencia);
      transaccion.update(doc(db, "mesas", comanda.mesa), { estado_mesa: true });
      auditar(transaccion, usuario, {
        tabla: "Comanda",
        accion: "ELIMINAR",
        registro: id,
        anterior: `Mesa: ${comanda.mesa_numero}. Total: $${comanda.total_comanda}`,
        actual: "Comanda eliminada",
      });
    });
  });
}

// Los métodos activos del catálogo. Si todavía no se cargó ninguno, los de siempre.
export function listarMetodosParaCobro() {
  return conMensaje(async () => {
    const resultado = await getDocs(collection(db, "metodos_pago"));
    if (resultado.empty) {
      return Object.entries(METODOS_DE_PAGO).map(([valor, nombre]) => ({ valor, nombre }));
    }
    return resultado.docs
      .map((documento) => documento.data())
      .filter((metodo) => metodo.estado_metodo_pago)
      .map((metodo) => ({ valor: metodo.id_metodo_pago, nombre: metodo.nombre_metodo_pago }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  });
}

// Guarda el pago y cierra la comanda si queda sin saldo
export function registrarPagoComanda(id, { tipoPago, metodoPago, montoTexto }) {
  return conMensaje(async () => {
    const usuario = await obtenerUsuarioActual();
    // La transacción evita que dos cobros simultáneos se pisen
    await runTransaction(db, async (transaccion) => {
      const referencia = doc(db, "comandas", id);
      const documento = await transaccion.get(referencia);
      if (!documento.exists()) throw new Error("Esta comanda ya no existe.");
      const comanda = documento.data();
      if (!estaAbierta(comanda)) throw new Error(`La comanda #${id} ya está cerrada.`);
      const delCatalogo = metodoPago ? await transaccion.get(doc(db, "metodos_pago", metodoPago)) : null;
      const nombreMetodo = delCatalogo?.exists()
        ? delCatalogo.data().estado_metodo_pago && delCatalogo.data().nombre_metodo_pago
        : METODOS_DE_PAGO[metodoPago];
      if (!nombreMetodo) throw new Error("Seleccioná un método de pago válido.");

      const saldo = comanda.saldo_pendiente;
      let monto;
      if (tipoPago === "total") {
        monto = saldo;
      } else if (tipoPago === "parcial") {
        const texto = String(montoTexto ?? "").trim();
        if (!/^\d+(\.\d{1,2})?$/.test(texto) || Number(texto) <= 0) {
          throw new Error("Ingresá un monto válido, mayor a 0 y con hasta 2 decimales.");
        }
        monto = Number(texto);
        if (monto > saldo) {
          throw new Error(`El monto no puede superar el saldo pendiente de $${saldo}.`);
        }
      } else {
        throw new Error("Seleccioná cómo se va a pagar la comanda.");
      }

      const saldoRestante = redondear(saldo - monto);
      const cambios = {
        total_pagado: redondear(comanda.total_pagado + monto),
        saldo_pendiente: saldoRestante,
      };
      if (monto > 0) {
        cambios.pagos = [
          ...comanda.pagos,
          {
            id_pago: `${id}-${comanda.pagos.length + 1}`,
            monto,
            metodo: metodoPago,
            metodo_nombre: nombreMetodo,
            fecha_hora: Timestamp.now(),
            empleado: usuario.id_empleado,
          },
        ];
      }
      if (saldoRestante === 0) {
        cambios.estado_comanda = "pagado";
        cambios.estado_nombre = NOMBRES_ESTADO.pagado;
        transaccion.update(doc(db, "mesas", comanda.mesa), { estado_mesa: true });
      }
      transaccion.update(referencia, cambios);
      auditar(transaccion, usuario, {
        tabla: "Comanda",
        accion: "MODIFICAR",
        registro: id,
        anterior: `Estado: ${comanda.estado_comanda}. Saldo: $${saldo}`,
        actual: `Estado: ${cambios.estado_comanda || comanda.estado_comanda}. Pago: $${monto} (${nombreMetodo}). Saldo: $${saldoRestante}`,
      });
    });
    return obtenerComanda(id);
  });
}

// ---------- INGREDIENTES: ESTADO ----------

// Cambia el estado del ingrediente y el de los platos que lo usan
export function cambiarEstadoIngrediente(ingrediente) {
  return conMensaje(async () => {
    const id = ingrediente.id_ingrediente;
    const anterior = ingrediente.estado_ingrediente;
    const nuevo = !anterior;
    const usuario = await obtenerUsuarioActual();
    const lote = writeBatch(db);

    lote.update(doc(db, "ingredientes", id), { estado_ingrediente: nuevo });
    const platos = await platosQueUsan(id);
    platos.forEach((plato) => {
      const datos = plato.data();
      lote.update(plato.ref, {
        ingredientes: copiaActualizada(datos, id, { estado_ingrediente: nuevo }),
        // Solo cambian los platos que estaban en el estado anterior del ingrediente
        estado_plato: datos.estado_plato === anterior ? nuevo : datos.estado_plato,
      });
    });
    auditar(lote, usuario, {
      tabla: "Ingrediente",
      accion: "MODIFICAR",
      registro: id,
      anterior: `Estado: ${textoDisponible(anterior)}`,
      actual: `Estado: ${textoDisponible(nuevo)}. Platos que lo usan: ${platos.length}`,
    });
    await lote.commit();
    return { ...ingrediente, estado_ingrediente: nuevo };
  });
}
