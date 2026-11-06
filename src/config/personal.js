// Empleados, cargos y permisos en Firestore, y la cuenta de cada empleado en Firebase.
import { getApps, initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  getAuth,
  initializeAuth,
  inMemoryPersistence,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  updatePassword,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { auth, db, firebaseConfig } from "./firebaseConfig";
import { auditar, conMayusculas, conMensaje, obtenerUsuarioActual } from "./firestore";

const NIVEL_ADMINISTRADOR = 5;

export const MODULOS = [
  { valor: "platos", nombre: "Platos" },
  { valor: "bebidas", nombre: "Bebidas" },
  { valor: "ingredientes", nombre: "Ingredientes" },
  { valor: "categorias", nombre: "Categorías" },
  { valor: "empleados", nombre: "Empleados" },
  { valor: "cargos", nombre: "Cargos" },
  { valor: "comandas", nombre: "Comandas" },
  { valor: "mesas", nombre: "Mesas" },
  { valor: "ventas", nombre: "Ventas" },
  { valor: "caja", nombre: "Caja" },
  { valor: "gastos", nombre: "Gastos" },
  { valor: "reportes", nombre: "Reportes" },
  { valor: "auditoria", nombre: "Auditoría" },
];

export const ACCIONES = [
  { valor: "leer", nombre: "Leer" },
  { valor: "escribir", nombre: "Escribir" },
  { valor: "modificar", nombre: "Modificar" },
  { valor: "eliminar", nombre: "Eliminar" },
];

// El administrador tiene todos los permisos, aunque su cargo no los tenga marcados
const TODOS_LOS_PERMISOS = MODULOS.flatMap((m) => ACCIONES.map((a) => `${m.valor}:${a.valor}`));

const permisosSegunNivel = (cargo) =>
  cargo.nivel_acceso >= NIVEL_ADMINISTRADOR ? TODOS_LOS_PERMISOS : cargo.permisos;

// Solo se gestiona a quien tiene un nivel menor al propio. El administrador gestiona a todos.
const puedeGestionar = (yo, nivelObjetivo) =>
  yo.nivel >= NIVEL_ADMINISTRADOR || yo.nivel > nivelObjetivo;

const SIN_NIVEL_EMPLEADO = "No podés gestionar a un empleado con un nivel de acceso igual o superior al tuyo.";
const SIN_NIVEL_CARGO = "No podés asignar un cargo con un nivel de acceso igual o superior al tuyo.";

// Fecha de hoy según el teléfono. Ejemplo: 2026-11-06
export function hoy() {
  const ahora = new Date();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");
  return `${ahora.getFullYear()}-${mes}-${dia}`;
}

// ---------- CONTRASEÑAS Y CUENTAS ----------

const MENSAJES_DE_CUENTA = {
  "auth/email-already-in-use": "Ya existe una cuenta con ese correo.",
  "auth/invalid-email": "El correo no es válido.",
  "auth/weak-password": "La contraseña es demasiado débil.",
  "auth/wrong-password": "La contraseña actual es incorrecta.",
  "auth/invalid-credential": "La contraseña actual es incorrecta.",
  "auth/too-many-requests": "Demasiados intentos. Esperá unos minutos e intentá nuevamente.",
  "auth/network-request-failed": "Error de conexión. Intentá nuevamente.",
  "auth/requires-recent-login": "Por seguridad, cerrá la sesión y volvé a entrar.",
};

// Traduce los errores de cuenta. Los de Firestore los resuelve conMensaje.
function conMensajeDeCuenta(operacion) {
  return conMensaje(async () => {
    try {
      return await operacion();
    } catch (error) {
      if (MENSAJES_DE_CUENTA[error?.code]) throw new Error(MENSAJES_DE_CUENTA[error.code]);
      throw error;
    }
  });
}

export function validarClaveSegura(clave) {
  if (!clave || clave.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
  const completa =
    /[A-ZÁÉÍÓÚÑ]/.test(clave) && /[0-9]/.test(clave) && /[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9]/.test(clave);
  return completa ? "" : "La contraseña debe incluir una letra mayúscula, un número y un carácter especial.";
}

// Una segunda conexión a Firebase: permite crear una cuenta sin cerrar la sesión del administrador
function authParaAltas() {
  const nombre = "altaDeEmpleados";
  const app = getApps().find((a) => a.name === nombre) || initializeApp(firebaseConfig, nombre);
  try {
    return initializeAuth(app, { persistence: inMemoryPersistence });
  } catch (error) {
    if (error.code !== "auth/already-initialized") throw error;
    return getAuth(app);
  }
}

// Crea la cuenta y envía el correo de verificación. Devuelve true si la cuenta ya existía.
async function crearCuentaDeEmpleado(correo, clave) {
  const authAltas = authParaAltas();
  try {
    const credencial = await createUserWithEmailAndPassword(authAltas, correo, clave);
    // Si falla el correo, el empleado puede pedirlo de nuevo al entrar
    await sendEmailVerification(credencial.user).catch(() => {});
    return false;
  } catch (error) {
    // Pasa con cuentas anteriores o si un alta falló antes de terminar: se reutiliza la cuenta
    if (error.code === "auth/email-already-in-use") return true;
    throw error;
  } finally {
    await signOut(authAltas).catch(() => {});
  }
}

// El primer ingreso: exige la contraseña temporal y define la definitiva
export function cambiarContrasenaObligatoria(actual, nueva) {
  return conMensajeDeCuenta(async () => {
    const problema = validarClaveSegura(nueva);
    if (problema) throw new Error(problema);
    if (actual === nueva) throw new Error("La nueva contraseña debe ser distinta de la temporal.");
    const usuario = auth.currentUser;
    await reauthenticateWithCredential(usuario, EmailAuthProvider.credential(usuario.email, actual));
    await updatePassword(usuario, nueva);
    await updateDoc(doc(db, "usuarios", usuario.email.toLowerCase()), {
      debe_cambiar_contrasena: false,
    });
  });
}

// Cambio voluntario: pide la contraseña actual y queda registrado en la auditoría
export function cambiarMiContrasena(actual, nueva) {
  return conMensajeDeCuenta(async () => {
    const problema = validarClaveSegura(nueva);
    if (problema) throw new Error(problema);
    if (actual === nueva) throw new Error("La nueva contraseña debe ser distinta de la actual.");
    const usuario = auth.currentUser;
    const yo = await obtenerUsuarioActual();
    await reauthenticateWithCredential(usuario, EmailAuthProvider.credential(usuario.email, actual));
    await updatePassword(usuario, nueva);
    const lote = writeBatch(db);
    auditar(lote, yo, {
      tabla: "Empleado",
      accion: "MODIFICAR",
      registro: yo.id_empleado,
      actual: "Cambió su propia contraseña",
    });
    await lote.commit();
  });
}

// Cada persona solo puede cambiar su propio teléfono
export function actualizarMiTelefono(telefono) {
  return conMensaje(async () => {
    const limpio = (telefono || "").trim();
    if (limpio && !/^[0-9+()\s-]{6,20}$/.test(limpio)) throw new Error("Ingresá un teléfono válido.");
    const yo = await obtenerUsuarioActual();
    const lote = writeBatch(db);
    lote.update(doc(db, "usuarios", yo.correo), { telefono: limpio || null });
    lote.update(doc(db, "empleados", yo.id_empleado), { telefono: limpio || null });
    auditar(lote, yo, {
      tabla: "Empleado",
      accion: "MODIFICAR",
      registro: yo.id_empleado,
      anterior: `Teléfono: ${yo.telefono || ""}`,
      actual: `Teléfono: ${limpio}`,
    });
    await lote.commit();
  });
}

export function reenviarVerificacion() {
  return conMensajeDeCuenta(() => sendEmailVerification(auth.currentUser));
}

// Devuelve true si el correo ya se verificó. También renueva el token, que usan las reglas.
export function comprobarVerificacion() {
  return conMensajeDeCuenta(async () => {
    await auth.currentUser.reload();
    if (!auth.currentUser.emailVerified) return false;
    await auth.currentUser.getIdToken(true);
    return true;
  });
}

// Firebase no permite cambiar desde la app la contraseña de otra persona: se le envía un enlace
export function enviarRestablecimiento(empleado) {
  return conMensajeDeCuenta(() => sendPasswordResetEmail(auth, empleado.correo));
}

// ---------- EMPLEADOS ----------

// Agrega lo que las pantallas necesitan para saber qué botones mostrar
const empleadoParaPantalla = (empleado, yo) => ({
  ...empleado,
  puede_gestionar: puedeGestionar(yo, empleado.nivel_cargo),
  es_yo: empleado.correo === yo.correo,
});

export function listarEmpleados() {
  return conMensaje(async () => {
    const [resultado, yo] = await Promise.all([
      getDocs(collection(db, "empleados")),
      obtenerUsuarioActual(),
    ]);
    return resultado.docs
      .map((documento) => empleadoParaPantalla(documento.data(), yo))
      .sort(
        (a, b) =>
          a.apellido_empleado.localeCompare(b.apellido_empleado, "es") ||
          a.nombre_empleado.localeCompare(b.nombre_empleado, "es"),
      );
  });
}

export function obtenerEmpleado(id) {
  return conMensaje(async () => {
    const [documento, yo] = await Promise.all([getDoc(doc(db, "empleados", id)), obtenerUsuarioActual()]);
    if (!documento.exists()) throw new Error("Este empleado ya no existe.");
    return empleadoParaPantalla(documento.data(), yo);
  });
}

// Los cargos para elegir en el formulario. Esta colección no contiene sueldos.
export function listarCargosParaEmpleado() {
  return conMensaje(async () => {
    const [resultado, yo] = await Promise.all([
      getDocs(collection(db, "cargos")),
      obtenerUsuarioActual(),
    ]);
    return resultado.docs
      .map((documento) => {
        const cargo = documento.data();
        return {
          id_cargo: cargo.id_cargo,
          nombre_cargo: cargo.nombre_cargo,
          gestionable: puedeGestionar(yo, cargo.nivel_acceso),
        };
      })
      .sort((a, b) => a.nombre_cargo.localeCompare(b.nombre_cargo, "es"));
  });
}

// Ejemplo: Juan Pérez -> pérezj. Si ya existe, agrega un número: pérezj1
function generarUsuario(nombre, apellido, empleados, idPropio) {
  const base = `${apellido.toLowerCase()}${nombre.toLowerCase()[0]}`;
  const usados = empleados
    .filter((documento) => documento.id !== idPropio)
    .map((documento) => documento.data().user_auto);
  let usuario = base;
  for (let numero = 1; usados.includes(usuario); numero += 1) usuario = `${base}${numero}`;
  return usuario;
}

// Revisa los datos del formulario y devuelve los valores limpios
function validarEmpleado(datos, empleados, idPropio) {
  const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  const nombre = conMayusculas(datos.nombre_empleado || "");
  const apellido = conMayusculas(datos.apellido_empleado || "");
  if (!soloLetras.test(nombre)) throw new Error("El nombre solo puede contener letras y espacios.");
  if (!soloLetras.test(apellido)) throw new Error("El apellido solo puede contener letras y espacios.");

  const dni = (datos.dni || "").replace(/\./g, "").trim();
  if (!/^\d{7,8}$/.test(dni)) throw new Error("El DNI debe tener entre 7 y 8 dígitos, solo números.");

  const correo = (datos.correo || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) throw new Error("Ingresá un correo válido.");
  if (!datos.cargo) throw new Error("Seleccioná un cargo.");

  const otros = empleados.filter((documento) => documento.id !== idPropio).map((d) => d.data());
  if (otros.some((e) => e.dni === dni)) throw new Error("El DNI ya está registrado en otro empleado.");
  if (otros.some((e) => e.correo === correo)) throw new Error("Este correo ya está registrado en otro empleado.");

  return { nombre, apellido, dni, correo, telefono: (datos.telefono || "").trim() };
}

async function leerCargo(id) {
  const cargo = await getDoc(doc(db, "cargos", id));
  if (!cargo.exists()) throw new Error("El cargo elegido ya no existe.");
  return cargo.data();
}

// El administrador crea al empleado y su cuenta. Devuelve { cuentaExistente, usuario }.
export function crearEmpleado(datos, clave, confirmacion) {
  return conMensajeDeCuenta(async () => {
    const problema = validarClaveSegura(clave);
    if (problema) throw new Error(problema);
    if (clave !== confirmacion) throw new Error("Las contraseñas no coinciden.");

    const [yo, empleados] = await Promise.all([
      obtenerUsuarioActual(),
      getDocs(collection(db, "empleados")),
    ]);
    const limpio = validarEmpleado(datos, empleados.docs);
    const cargo = await leerCargo(datos.cargo);
    if (!puedeGestionar(yo, cargo.nivel_acceso)) throw new Error(SIN_NIVEL_CARGO);
    const usuario = generarUsuario(limpio.nombre, limpio.apellido, empleados.docs);

    // Primero la cuenta: si falla, no queda un empleado que no puede entrar
    const cuentaExistente = await crearCuentaDeEmpleado(limpio.correo, clave);

    const nuevo = doc(collection(db, "empleados"));
    const lote = writeBatch(db);
    lote.set(nuevo, {
      id_empleado: nuevo.id,
      nombre_empleado: limpio.nombre,
      apellido_empleado: limpio.apellido,
      dni: limpio.dni,
      telefono: limpio.telefono || null,
      correo: limpio.correo,
      user_auto: usuario,
      fecha_ingreso: hoy(),
      fecha_baja: null,
      estado: true,
      cargo: cargo.id_cargo,
      cargo_nombre: cargo.nombre_cargo,
      nivel_cargo: cargo.nivel_acceso,
    });
    lote.set(doc(db, "usuarios", limpio.correo), {
      id_empleado: nuevo.id,
      nombre: `${limpio.nombre} ${limpio.apellido}`,
      usuario,
      correo: limpio.correo,
      telefono: limpio.telefono || null,
      id_cargo: cargo.id_cargo,
      cargo: cargo.nombre_cargo,
      nivel: cargo.nivel_acceso,
      permisos: permisosSegunNivel(cargo),
      activo: true,
      // Obliga a cambiar la contraseña temporal en el primer ingreso
      debe_cambiar_contrasena: true,
    });
    lote.update(doc(db, "cargos", cargo.id_cargo), { total_empleados: increment(1) });
    auditar(lote, yo, {
      tabla: "Empleado",
      accion: "CREAR",
      registro: nuevo.id,
      actual: `Empleado creado: ${limpio.nombre} ${limpio.apellido}. Usuario: ${usuario}`,
    });
    await lote.commit();
    return { cuentaExistente, usuario };
  });
}

// El correo no se cambia: identifica la cuenta de Firebase, y solo su dueño podría cambiarlo
export function actualizarEmpleado(id, datos) {
  return conMensaje(async () => {
    const [yo, empleados, documento] = await Promise.all([
      obtenerUsuarioActual(),
      getDocs(collection(db, "empleados")),
      getDoc(doc(db, "empleados", id)),
    ]);
    if (!documento.exists()) throw new Error("Este empleado ya no existe.");
    const actual = documento.data();
    if (!puedeGestionar(yo, actual.nivel_cargo)) throw new Error(SIN_NIVEL_EMPLEADO);

    const limpio = validarEmpleado({ ...datos, correo: actual.correo }, empleados.docs, id);
    const cargo = await leerCargo(datos.cargo);
    // Conservar el cargo actual se permite, como en el formulario
    if (cargo.id_cargo !== actual.cargo && !puedeGestionar(yo, cargo.nivel_acceso)) {
      throw new Error(SIN_NIVEL_CARGO);
    }

    const mismoNombre =
      limpio.nombre === actual.nombre_empleado && limpio.apellido === actual.apellido_empleado;
    const usuario = mismoNombre
      ? actual.user_auto
      : generarUsuario(limpio.nombre, limpio.apellido, empleados.docs, id);

    const lote = writeBatch(db);
    lote.update(doc(db, "empleados", id), {
      nombre_empleado: limpio.nombre,
      apellido_empleado: limpio.apellido,
      dni: limpio.dni,
      telefono: limpio.telefono || null,
      user_auto: usuario,
      cargo: cargo.id_cargo,
      cargo_nombre: cargo.nombre_cargo,
      nivel_cargo: cargo.nivel_acceso,
    });
    const refUsuario = doc(db, "usuarios", actual.correo);
    if ((await getDoc(refUsuario)).exists()) {
      lote.update(refUsuario, {
        nombre: `${limpio.nombre} ${limpio.apellido}`,
        usuario,
        telefono: limpio.telefono || null,
        id_cargo: cargo.id_cargo,
        cargo: cargo.nombre_cargo,
        nivel: cargo.nivel_acceso,
        permisos: permisosSegunNivel(cargo),
      });
    }
    if (cargo.id_cargo !== actual.cargo) {
      lote.update(doc(db, "cargos", cargo.id_cargo), { total_empleados: increment(1) });
      lote.update(doc(db, "cargos", actual.cargo), { total_empleados: increment(-1) });
    }
    auditar(lote, yo, {
      tabla: "Empleado",
      accion: "MODIFICAR",
      registro: id,
      anterior: `Nombre: ${actual.nombre_empleado}, Apellido: ${actual.apellido_empleado}, Cargo: ${actual.cargo_nombre}`,
      actual: `Nombre: ${limpio.nombre}, Apellido: ${limpio.apellido}, Cargo: ${cargo.nombre_cargo}`,
    });
    await lote.commit();
  });
}

// Da de baja o reactiva. Dar de baja le quita el acceso a todos los datos.
export function cambiarEstadoEmpleado(id) {
  return conMensaje(async () => {
    const [yo, documento] = await Promise.all([obtenerUsuarioActual(), getDoc(doc(db, "empleados", id))]);
    if (!documento.exists()) throw new Error("Este empleado ya no existe.");
    const empleado = documento.data();
    const esBaja = empleado.estado;
    if (esBaja && empleado.correo === yo.correo) throw new Error("No podés darte de baja a vos mismo.");
    if (!puedeGestionar(yo, empleado.nivel_cargo)) throw new Error(SIN_NIVEL_EMPLEADO);

    const lote = writeBatch(db);
    const cambios = { estado: !esBaja, fecha_baja: esBaja ? hoy() : null };
    lote.update(doc(db, "empleados", id), cambios);
    const refUsuario = doc(db, "usuarios", empleado.correo);
    if ((await getDoc(refUsuario)).exists()) lote.update(refUsuario, { activo: !esBaja });
    auditar(lote, yo, {
      tabla: "Empleado",
      accion: "MODIFICAR",
      registro: id,
      anterior: `Estado: ${esBaja ? "Activo" : "Inactivo"}`,
      actual: esBaja ? "Estado: Dado de baja." : "Estado: Reactivado.",
    });
    await lote.commit();
    return empleadoParaPantalla({ ...empleado, ...cambios }, yo);
  });
}

// ---------- CARGOS ----------

const cargoParaPantalla = (cargo, sueldo, yo) => ({
  ...cargo,
  // Las pantallas trabajan con los ids de los permisos
  permisos: cargo.permisos_ids,
  total_permisos: cargo.permisos_ids.length,
  sueldo_cargo: sueldo,
  gestionable: puedeGestionar(yo, cargo.nivel_acceso),
});

export function listarCargos() {
  return conMensaje(async () => {
    const [cargos, sueldos, yo] = await Promise.all([
      getDocs(collection(db, "cargos")),
      getDocs(collection(db, "sueldos")),
      obtenerUsuarioActual(),
    ]);
    const sueldoDe = {};
    sueldos.docs.forEach((documento) => {
      sueldoDe[documento.id] = documento.data().sueldo_cargo;
    });
    return cargos.docs
      .map((documento) => cargoParaPantalla(documento.data(), sueldoDe[documento.id] ?? 0, yo))
      .sort((a, b) => a.nombre_cargo.localeCompare(b.nombre_cargo, "es"));
  });
}

export function obtenerCargo(id) {
  return conMensaje(async () => {
    const [cargo, sueldo, yo] = await Promise.all([
      getDoc(doc(db, "cargos", id)),
      getDoc(doc(db, "sueldos", id)),
      obtenerUsuarioActual(),
    ]);
    if (!cargo.exists()) throw new Error("Este cargo ya no existe.");
    return cargoParaPantalla(cargo.data(), sueldo.exists() ? sueldo.data().sueldo_cargo : 0, yo);
  });
}

// Copia los cambios de un cargo a sus empleados, porque cada uno guarda su nivel y sus permisos
async function propagarCargo(lote, cargo) {
  const [empleados, usuarios] = await Promise.all([
    getDocs(query(collection(db, "empleados"), where("cargo", "==", cargo.id_cargo))),
    getDocs(query(collection(db, "usuarios"), where("id_cargo", "==", cargo.id_cargo))),
  ]);
  empleados.docs.forEach((documento) => {
    lote.update(documento.ref, { cargo_nombre: cargo.nombre_cargo, nivel_cargo: cargo.nivel_acceso });
  });
  usuarios.docs.forEach((documento) => {
    lote.update(documento.ref, {
      cargo: cargo.nombre_cargo,
      nivel: cargo.nivel_acceso,
      permisos: permisosSegunNivel(cargo),
    });
  });
}

// Crea un cargo, o lo modifica si recibe idExistente
export function guardarCargo(datos, idExistente) {
  return conMensaje(async () => {
    const yo = await obtenerUsuarioActual();
    const nombre = conMayusculas(datos.nombre_cargo || "");
    const nivel = Number(datos.nivel_acceso);
    if (!nombre) throw new Error("Completá el nombre del cargo.");
    if (!Number.isInteger(nivel) || nivel < 1 || nivel > NIVEL_ADMINISTRADOR) {
      throw new Error("Seleccioná un nivel de acceso válido.");
    }
    if (!(datos.sueldo_cargo >= 0)) throw new Error("El sueldo no puede ser negativo.");
    if (!puedeGestionar(yo, nivel)) throw new Error(SIN_NIVEL_CARGO);

    const cargos = await getDocs(collection(db, "cargos"));
    const repetido = cargos.docs.some(
      (documento) =>
        documento.id !== idExistente &&
        documento.data().nombre_cargo.toLowerCase() === nombre.toLowerCase(),
    );
    if (repetido) throw new Error("Este cargo ya existe");

    const lote = writeBatch(db);
    if (!idExistente) {
      const nuevo = doc(collection(db, "cargos"));
      lote.set(nuevo, {
        id_cargo: nuevo.id,
        nombre_cargo: nombre,
        descripcion_cargo: (datos.descripcion_cargo || "").trim(),
        nivel_acceso: nivel,
        permisos: [],
        permisos_ids: [],
        total_empleados: 0,
      });
      lote.set(doc(db, "sueldos", nuevo.id), { sueldo_cargo: datos.sueldo_cargo });
      auditar(lote, yo, {
        tabla: "Cargo",
        accion: "CREAR",
        registro: nuevo.id,
        actual: `Cargo creado. Nombre: ${nombre}, Nivel: ${nivel}`,
      });
      await lote.commit();
      return;
    }

    const actual = cargos.docs.find((documento) => documento.id === idExistente)?.data();
    if (!actual) throw new Error("Este cargo ya no existe.");
    if (!puedeGestionar(yo, actual.nivel_acceso)) throw new Error(SIN_NIVEL_CARGO);

    // Evita quedarse sin nadie que pueda administrar el sistema
    if (actual.nivel_acceso >= NIVEL_ADMINISTRADOR && nivel < NIVEL_ADMINISTRADOR) {
      const empleados = await getDocs(collection(db, "empleados"));
      const hayOtro = empleados.docs.some((documento) => {
        const empleado = documento.data();
        return (
          empleado.estado && empleado.nivel_cargo >= NIVEL_ADMINISTRADOR && empleado.cargo !== idExistente
        );
      });
      if (!hayOtro) throw new Error("Debe quedar al menos un empleado activo con nivel de administrador.");
    }

    const cambios = {
      nombre_cargo: nombre,
      descripcion_cargo: (datos.descripcion_cargo || "").trim(),
      nivel_acceso: nivel,
    };
    lote.update(doc(db, "cargos", idExistente), cambios);
    lote.set(doc(db, "sueldos", idExistente), { sueldo_cargo: datos.sueldo_cargo });
    await propagarCargo(lote, { ...actual, ...cambios });
    auditar(lote, yo, {
      tabla: "Cargo",
      accion: "MODIFICAR",
      registro: idExistente,
      anterior: `Nombre: ${actual.nombre_cargo}, Nivel: ${actual.nivel_acceso}`,
      actual: `Nombre: ${nombre}, Nivel: ${nivel}`,
    });
    await lote.commit();
  });
}

export function eliminarCargo(id) {
  return conMensaje(async () => {
    const yo = await obtenerUsuarioActual();
    const cargo = await leerCargo(id);
    if (!puedeGestionar(yo, cargo.nivel_acceso)) throw new Error(SIN_NIVEL_CARGO);
    if (cargo.total_empleados > 0) {
      throw new Error(`No se puede eliminar "${cargo.nombre_cargo}" porque tiene empleados asignados.`);
    }
    const lote = writeBatch(db);
    lote.delete(doc(db, "cargos", id));
    lote.delete(doc(db, "sueldos", id));
    auditar(lote, yo, {
      tabla: "Cargo",
      accion: "ELIMINAR",
      registro: id,
      anterior: `Nombre: ${cargo.nombre_cargo}, Nivel: ${cargo.nivel_acceso}`,
      actual: "Cargo eliminado",
    });
    await lote.commit();
  });
}

// Deja al cargo exactamente con estos permisos, y los aplica a sus empleados
export function guardarPermisosCargo(id, idsPermisos) {
  return conMensaje(async () => {
    const [yo, cargo, catalogo] = await Promise.all([
      obtenerUsuarioActual(),
      leerCargo(id),
      getDocs(collection(db, "permisos")),
    ]);
    if (!puedeGestionar(yo, cargo.nivel_acceso)) throw new Error(SIN_NIVEL_CARGO);

    const elegidos = [...new Set(idsPermisos)];
    const porId = {};
    catalogo.docs.forEach((documento) => {
      porId[documento.id] = documento.data();
    });
    if (elegidos.some((idPermiso) => !porId[idPermiso])) {
      throw new Error("Uno de los permisos elegidos ya no existe.");
    }

    // Solo el administrador reparte permisos que no tiene. Quitarlos sí está permitido.
    if (yo.nivel < NIVEL_ADMINISTRADOR) {
      elegidos.forEach((idPermiso) => {
        const { modulo, accion } = porId[idPermiso];
        if (!cargo.permisos_ids.includes(idPermiso) && !yo.permisos.includes(`${modulo}:${accion}`)) {
          throw new Error(`No podés asignar el permiso ${modulo}-${accion} porque no lo tenés.`);
        }
      });
    }

    const cambios = {
      permisos_ids: elegidos,
      permisos: elegidos.map((idPermiso) => `${porId[idPermiso].modulo}:${porId[idPermiso].accion}`),
    };
    const lote = writeBatch(db);
    lote.update(doc(db, "cargos", id), cambios);
    await propagarCargo(lote, { ...cargo, ...cambios });
    auditar(lote, yo, {
      tabla: "Cargo",
      accion: "MODIFICAR",
      registro: id,
      anterior: `Permisos: ${cargo.permisos.join(", ") || "Sin permisos"}`,
      actual: `Permisos: ${cambios.permisos.join(", ") || "Sin permisos"}`,
    });
    await lote.commit();
  });
}

// ---------- PERMISOS ----------

export function listarPermisos() {
  return conMensaje(async () => {
    const [resultado, yo] = await Promise.all([
      getDocs(collection(db, "permisos")),
      obtenerUsuarioActual(),
    ]);
    return {
      permisos: resultado.docs
        .map((documento) => documento.data())
        .sort((a, b) => a.modulo.localeCompare(b.modulo) || a.accion.localeCompare(b.accion)),
      modulos: MODULOS,
      acciones: ACCIONES,
      es_administrador: yo.nivel >= NIVEL_ADMINISTRADOR,
    };
  });
}

// Crear un permiso no se lo da a nadie: después hay que asignarlo a un cargo
export function crearPermiso({ modulo, accion }) {
  return conMensaje(async () => {
    const datosModulo = MODULOS.find((m) => m.valor === modulo);
    const datosAccion = ACCIONES.find((a) => a.valor === accion);
    if (!datosModulo || !datosAccion) throw new Error("Elegí el módulo y la acción.");

    const yo = await obtenerUsuarioActual();
    const existentes = await getDocs(collection(db, "permisos"));
    if (existentes.docs.some((d) => d.data().modulo === modulo && d.data().accion === accion)) {
      throw new Error("Este permiso (Módulo + Acción) ya existe en el sistema.");
    }
    const nuevo = doc(collection(db, "permisos"));
    const lote = writeBatch(db);
    lote.set(nuevo, {
      id_tipo_permiso: nuevo.id,
      modulo,
      modulo_nombre: datosModulo.nombre,
      accion,
      accion_nombre: datosAccion.nombre,
      descripcion: "",
    });
    auditar(lote, yo, {
      tabla: "Permiso",
      accion: "CREAR",
      registro: nuevo.id,
      actual: `Permiso creado: Módulo ${modulo} - Acción ${accion}`,
    });
    await lote.commit();
  });
}

// Lo quita de todos los cargos, por eso solo lo hace un administrador
export function eliminarPermiso(id) {
  return conMensaje(async () => {
    const yo = await obtenerUsuarioActual();
    if (yo.nivel < NIVEL_ADMINISTRADOR) throw new Error("Solo un administrador puede eliminar permisos.");
    const cargos = await getDocs(
      query(collection(db, "cargos"), where("permisos_ids", "array-contains", id)),
    );
    const documento = await getDoc(doc(db, "permisos", id));
    if (!documento.exists()) throw new Error("Este permiso ya no existe.");
    const { modulo, accion } = documento.data();

    const lote = writeBatch(db);
    for (const cargoDoc of cargos.docs) {
      const cargo = cargoDoc.data();
      const cambios = {
        permisos_ids: cargo.permisos_ids.filter((idPermiso) => idPermiso !== id),
        permisos: cargo.permisos.filter((nombre) => nombre !== `${modulo}:${accion}`),
      };
      lote.update(cargoDoc.ref, cambios);
      await propagarCargo(lote, { ...cargo, ...cambios });
    }
    lote.delete(doc(db, "permisos", id));
    auditar(lote, yo, {
      tabla: "Permiso",
      accion: "ELIMINAR",
      registro: id,
      anterior: `Módulo ${modulo} - Acción ${accion}`,
      actual: "Permiso eliminado",
    });
    await lote.commit();
  });
}
