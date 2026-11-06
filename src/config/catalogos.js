// Categorías de platos, tipos de bebida, turnos, mesas y asistencias en Firestore.
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "./firebaseConfig";
import { auditar, conMayusculas, conMensaje, obtenerUsuarioActual } from "./firestore";
import { hoy } from "./personal";
import { inicioDelPeriodo } from "./reportes";

// ---------- CATÁLOGOS ----------

// Estas tres listas funcionan igual: esta tabla indica qué cambia entre una y otra.
// relacion: los documentos que dependen de cada elemento, y que guardan una copia de su nombre.
export const CATALOGOS = {
  categoria: {
    titulo: "Categorías de platos",
    singular: "categoría",
    subtitulo: "Agrupan los platos del menú",
    icono: "category",
    modulo: "categorias",
    tabla: "Categoría",
    coleccion: "categorias",
    campoId: "id_categoria_plato",
    campoNombre: "nombre_categoria_plato",
    campoDescripcion: "descripcion_categoria_plato",
    campoEstado: "estado_categoria_plato",
    relacion: { coleccion: "platos", campo: "categoria", copia: "categoria_nombre", texto: "platos asociados" },
  },
  tipoBebida: {
    titulo: "Tipos de bebida",
    singular: "tipo de bebida",
    subtitulo: "Agrupan las bebidas del menú",
    icono: "local-bar",
    modulo: "bebidas",
    tabla: "Tipo de Bebida",
    coleccion: "tipos_bebida",
    campoId: "id_tipo_bebida",
    campoNombre: "nombre_tipo_bebida",
    campoDescripcion: "descripcion_tipo_bebida",
    campoEstado: "estado_tipo_bebida",
    relacion: { coleccion: "bebidas", campo: "id_tipo_bebida", copia: "tipo_nombre", texto: "bebidas asociadas" },
  },
  tipoAsistencia: {
    titulo: "Turnos",
    singular: "turno",
    subtitulo: "Los turnos de trabajo del personal",
    icono: "schedule",
    modulo: "empleados",
    tabla: "TipoAsistencia",
    coleccion: "tipos_asistencia",
    campoId: "id_tipo_asistencia",
    campoNombre: "nombre_tipo_asis",
    campoDescripcion: "desc_tipo_asistencia",
    campoEstado: null,
    relacion: { coleccion: "asistencias", campo: "tipo", copia: "tipo_nombre", texto: "asistencias asociadas" },
  },
  categoriaGasto: {
    titulo: "Categorías de gasto",
    singular: "categoría de gasto",
    subtitulo: "Agrupan los gastos del restaurante",
    icono: "category",
    modulo: "caja",
    tabla: "Categoria gastos",
    coleccion: "categorias_gasto",
    campoId: "id_categoria_gasto",
    campoNombre: "nombre_categoria_gasto",
    campoDescripcion: "descripcion_categoria_gasto",
    campoEstado: "estado_categoria_gasto",
    // Una categoría ya usada no se modifica, para no cambiar los gastos anteriores
    sinEditarSiSeUsa: true,
    relacion: { coleccion: "gastos", campo: "categoria", copia: "categoria_nombre", texto: "gastos asociados" },
  },
  metodoPago: {
    titulo: "Métodos de pago",
    singular: "método de pago",
    subtitulo: "Las formas de pago del restaurante",
    icono: "credit-card",
    modulo: "caja",
    tabla: "Metodo de pago",
    coleccion: "metodos_pago",
    campoId: "id_metodo_pago",
    campoNombre: "nombre_metodo_pago",
    campoDescripcion: "descripcion_metodo_pago",
    campoEstado: "estado_metodo_pago",
    relacion: null,
  },
};

// Todas las listas se muestran con los mismos nombres de campos
function elementoParaPantalla(config, datos) {
  return {
    id: datos[config.campoId],
    nombre: datos[config.campoNombre],
    descripcion: datos[config.campoDescripcion] || "",
    activo: config.campoEstado ? datos[config.campoEstado] : true,
  };
}

export function listarCatalogo(tipo) {
  const config = CATALOGOS[tipo];
  return conMensaje(async () => {
    const resultado = await getDocs(collection(db, config.coleccion));
    return resultado.docs
      .map((documento) => elementoParaPantalla(config, documento.data()))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  });
}

export function obtenerElementoCatalogo(tipo, id) {
  const config = CATALOGOS[tipo];
  return conMensaje(async () => {
    const documento = await getDoc(doc(db, config.coleccion, id));
    if (!documento.exists()) throw new Error("Este elemento ya no existe.");
    return elementoParaPantalla(config, documento.data());
  });
}

// Los documentos que usan este elemento. Algunos catálogos no tienen relación.
const dependientes = async (config, id) =>
  config.relacion
    ? getDocs(query(collection(db, config.relacion.coleccion), where(config.relacion.campo, "==", id)))
    : { empty: true, docs: [] };

// Crea un elemento, o lo modifica si recibe idExistente
export function guardarElementoCatalogo(tipo, datos, idExistente) {
  const config = CATALOGOS[tipo];
  return conMensaje(async () => {
    const nombre = conMayusculas(datos.nombre || "");
    const descripcion = (datos.descripcion || "").trim();
    if (!nombre) throw new Error("Completá el nombre.");

    const [usuario, existentes] = await Promise.all([
      obtenerUsuarioActual(),
      getDocs(collection(db, config.coleccion)),
    ]);
    const repetido = existentes.docs.some(
      (documento) =>
        documento.id !== idExistente &&
        documento.data()[config.campoNombre].toLowerCase() === nombre.toLowerCase(),
    );
    if (repetido) throw new Error(`Ya existe un elemento llamado "${nombre}".`);

    const lote = writeBatch(db);
    const campos = { [config.campoNombre]: nombre, [config.campoDescripcion]: descripcion };

    if (!idExistente) {
      const nuevo = doc(collection(db, config.coleccion));
      lote.set(nuevo, {
        ...campos,
        [config.campoId]: nuevo.id,
        ...(config.campoEstado ? { [config.campoEstado]: true } : {}),
      });
      auditar(lote, usuario, { tabla: config.tabla, accion: "CREAR", registro: nuevo.id, actual: `Nombre: ${nombre}` });
      await lote.commit();
      return;
    }

    const actual = existentes.docs.find((documento) => documento.id === idExistente)?.data();
    if (!actual) throw new Error("Este elemento ya no existe.");
    const relacionados = await dependientes(config, idExistente);
    if (config.sinEditarSiSeUsa && !relacionados.empty) {
      throw new Error(`No se puede modificar "${actual[config.campoNombre]}" porque tiene ${config.relacion.texto}.`);
    }
    lote.update(doc(db, config.coleccion, idExistente), campos);
    // Los documentos relacionados guardan una copia del nombre
    if (actual[config.campoNombre] !== nombre) {
      relacionados.docs.forEach((documento) => {
        lote.update(documento.ref, { [config.relacion.copia]: nombre });
      });
    }
    auditar(lote, usuario, {
      tabla: config.tabla,
      accion: "MODIFICAR",
      registro: idExistente,
      anterior: `Nombre: ${actual[config.campoNombre]}`,
      actual: `Nombre: ${nombre}`,
    });
    await lote.commit();
  });
}

export function cambiarEstadoCatalogo(tipo, elemento) {
  const config = CATALOGOS[tipo];
  return conMensaje(async () => {
    const usuario = await obtenerUsuarioActual();
    const lote = writeBatch(db);
    lote.update(doc(db, config.coleccion, elemento.id), { [config.campoEstado]: !elemento.activo });
    auditar(lote, usuario, {
      tabla: config.tabla,
      accion: "MODIFICAR",
      registro: elemento.id,
      anterior: `Estado: ${elemento.activo ? "Activo" : "Inactivo"}`,
      actual: `Estado: ${elemento.activo ? "Inactivo" : "Activo"}`,
    });
    await lote.commit();
  });
}

// No se elimina si algo depende de este elemento: se perderían esos datos
export function eliminarElementoCatalogo(tipo, elemento) {
  const config = CATALOGOS[tipo];
  return conMensaje(async () => {
    const [usuario, relacionados] = await Promise.all([obtenerUsuarioActual(), dependientes(config, elemento.id)]);
    if (!relacionados.empty) {
      throw new Error(`No se puede eliminar "${elemento.nombre}" porque tiene ${config.relacion.texto}.`);
    }
    const lote = writeBatch(db);
    lote.delete(doc(db, config.coleccion, elemento.id));
    auditar(lote, usuario, {
      tabla: config.tabla,
      accion: "ELIMINAR",
      registro: elemento.id,
      anterior: `Nombre: ${elemento.nombre}`,
      actual: "Eliminado",
    });
    await lote.commit();
  });
}

// ---------- MESAS ----------

export const UBICACIONES = [
  { valor: "salon", nombre: "Salón" },
  { valor: "patio", nombre: "Patio" },
];

export function obtenerMesa(id) {
  return conMensaje(async () => {
    const mesa = await getDoc(doc(db, "mesas", id));
    if (!mesa.exists()) throw new Error("Esta mesa ya no existe.");
    return mesa.data();
  });
}

// Crea una mesa, o la modifica si recibe idExistente
export function guardarMesa(datos, idExistente) {
  return conMensaje(async () => {
    const numero = Number(datos.numero);
    if (!Number.isInteger(numero) || numero < 1) throw new Error("Ingresá un número de mesa válido.");
    const ubicacion = UBICACIONES.find((opcion) => opcion.valor === datos.ubicacion);
    if (!ubicacion) throw new Error("Seleccioná una ubicación.");

    const [usuario, mesas] = await Promise.all([obtenerUsuarioActual(), getDocs(collection(db, "mesas"))]);
    if (mesas.docs.some((documento) => documento.id !== idExistente && documento.data().numero_mesa === numero)) {
      throw new Error("Este número de mesa ya existe");
    }

    const campos = { numero_mesa: numero, ubicacion: ubicacion.valor, ubicacion_nombre: ubicacion.nombre };
    const descripcion = `N° ${numero}, Ubicación: ${ubicacion.valor}`;
    const lote = writeBatch(db);
    if (idExistente) {
      const actual = mesas.docs.find((documento) => documento.id === idExistente)?.data();
      if (!actual) throw new Error("Esta mesa ya no existe.");
      lote.update(doc(db, "mesas", idExistente), campos);
      auditar(lote, usuario, {
        tabla: "Mesa",
        accion: "MODIFICAR",
        registro: idExistente,
        anterior: `N° ${actual.numero_mesa}, Ubicación: ${actual.ubicacion}`,
        actual: descripcion,
      });
    } else {
      const nueva = doc(collection(db, "mesas"));
      lote.set(nueva, { ...campos, id_mesa: nueva.id, estado_mesa: true });
      auditar(lote, usuario, { tabla: "Mesa", accion: "CREAR", registro: nueva.id, actual: `Mesa creada: ${descripcion}` });
    }
    await lote.commit();
  });
}

// Una mesa con comandas registradas no se elimina, como en la web
export function eliminarMesa(mesa) {
  return conMensaje(async () => {
    const [usuario, comandas] = await Promise.all([
      obtenerUsuarioActual(),
      getDocs(query(collection(db, "comandas"), where("mesa", "==", mesa.id_mesa))),
    ]);
    if (!comandas.empty) {
      throw new Error(`No se puede eliminar la mesa ${mesa.numero_mesa} porque tiene comandas registradas.`);
    }
    const lote = writeBatch(db);
    lote.delete(doc(db, "mesas", mesa.id_mesa));
    auditar(lote, usuario, {
      tabla: "Mesa",
      accion: "ELIMINAR",
      registro: mesa.id_mesa,
      anterior: `Mesa N° ${mesa.numero_mesa} eliminada`,
      actual: "Eliminada",
    });
    await lote.commit();
  });
}

// ---------- ASISTENCIAS ----------

// De la más reciente a la más antigua. La fecha se guarda como texto: 2026-11-06
export function listarAsistencias(periodo) {
  return conMensaje(async () => {
    const inicio = inicioDelPeriodo(periodo);
    const resultado = await getDocs(collection(db, "asistencias"));
    return resultado.docs
      .map((documento) => documento.data())
      .filter((asistencia) => {
        const [anio, mes, dia] = asistencia.fecha.split("-").map(Number);
        return new Date(anio, mes - 1, dia).getTime() >= inicio;
      })
      .sort(
        (a, b) => b.fecha.localeCompare(a.fecha) || a.empleado_nombre.localeCompare(b.empleado_nombre, "es"),
      );
  });
}

export function listarEmpleadosActivos() {
  return conMensaje(async () => {
    const resultado = await getDocs(query(collection(db, "empleados"), where("estado", "==", true)));
    return resultado.docs
      .map((documento) => {
        const empleado = documento.data();
        return {
          id: empleado.id_empleado,
          nombre: `${empleado.nombre_empleado} ${empleado.apellido_empleado}`,
        };
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  });
}

// Se registra siempre con la fecha de hoy, una sola vez por empleado
export function registrarAsistencia({ empleado: idEmpleado, tipo: idTipo }) {
  return conMensaje(async () => {
    if (!idEmpleado || !idTipo) throw new Error("Debe seleccionar un empleado y un turno.");
    const usuario = await obtenerUsuarioActual();
    const fecha = hoy();
    await runTransaction(db, async (transaccion) => {
      const [empleado, tipo] = [
        await transaccion.get(doc(db, "empleados", idEmpleado)),
        await transaccion.get(doc(db, "tipos_asistencia", idTipo)),
      ];
      if (!empleado.exists() || !empleado.data().estado || !tipo.exists()) {
        throw new Error("Debe seleccionar un empleado y un turno.");
      }
      // Este id impide que un empleado tenga dos asistencias el mismo día
      const id = `${idEmpleado}_${fecha}`;
      const referencia = doc(db, "asistencias", id);
      if ((await transaccion.get(referencia)).exists()) {
        throw new Error("Este empleado ya tiene una asistencia registrada hoy.");
      }
      const nombre = `${empleado.data().nombre_empleado} ${empleado.data().apellido_empleado}`;
      transaccion.set(referencia, {
        id_asistencia: id,
        empleado: idEmpleado,
        empleado_nombre: nombre,
        tipo: idTipo,
        tipo_nombre: tipo.data().nombre_tipo_asis,
        fecha,
      });
      auditar(transaccion, usuario, {
        tabla: "Asistencia",
        accion: "CREAR",
        registro: id,
        actual: `Asistencia registrada: ${nombre}. Fecha: ${fecha}. Turno: ${tipo.data().nombre_tipo_asis}`,
      });
    });
  });
}

export function cambiarTurnoAsistencia(asistencia, idTipo) {
  return conMensaje(async () => {
    const [usuario, tipo] = await Promise.all([
      obtenerUsuarioActual(),
      getDoc(doc(db, "tipos_asistencia", idTipo)),
    ]);
    if (!tipo.exists()) throw new Error("El turno elegido ya no existe.");
    const lote = writeBatch(db);
    lote.update(doc(db, "asistencias", asistencia.id_asistencia), {
      tipo: idTipo,
      tipo_nombre: tipo.data().nombre_tipo_asis,
    });
    auditar(lote, usuario, {
      tabla: "Asistencia",
      accion: "MODIFICAR",
      registro: asistencia.id_asistencia,
      anterior: `Turno: ${asistencia.tipo_nombre}`,
      actual: `Turno: ${tipo.data().nombre_tipo_asis}`,
    });
    await lote.commit();
  });
}

export function anularAsistencia(asistencia) {
  return conMensaje(async () => {
    const usuario = await obtenerUsuarioActual();
    const lote = writeBatch(db);
    lote.delete(doc(db, "asistencias", asistencia.id_asistencia));
    auditar(lote, usuario, {
      tabla: "Asistencia",
      accion: "ANULAR",
      registro: asistencia.id_asistencia,
      anterior: `Asistencia anulada: ${asistencia.empleado_nombre}. Fecha: ${asistencia.fecha}. Turno: ${asistencia.tipo_nombre}`,
      actual: "Anulada",
    });
    await lote.commit();
  });
}
