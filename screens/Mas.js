import React, { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { sendEmailVerification, sendPasswordResetEmail, signOut } from "firebase/auth";

import { auth } from "../src/config/firebaseConfig";
import { obtenerUsuarioActual } from "../src/config/firestore";
import { COLORS } from "../styles/colors";
import { gestionStyles as g } from "../styles/gestionStyles";

// Módulos y acciones que usa el sistema, para mostrar los permisos con nombres claros
const MODULOS = [
  { clave: "platos", nombre: "Platos" },
  { clave: "bebidas", nombre: "Bebidas" },
  { clave: "ingredientes", nombre: "Ingredientes" },
  { clave: "categorias", nombre: "Categorías" },
  { clave: "empleados", nombre: "Empleados" },
  { clave: "cargos", nombre: "Cargos" },
  { clave: "mesas", nombre: "Mesas" },
  { clave: "comandas", nombre: "Comandas" },
  { clave: "ventas", nombre: "Ventas" },
  { clave: "caja", nombre: "Caja" },
  { clave: "reportes", nombre: "Reportes" },
  { clave: "auditoria", nombre: "Auditoría" },
];
const ACCIONES = [
  { clave: "leer", nombre: "Ver" },
  { clave: "escribir", nombre: "Crear" },
  { clave: "modificar", nombre: "Editar" },
  { clave: "eliminar", nombre: "Eliminar" },
];

// Pestaña "Más": datos de la cuenta, permisos y cierre de sesión
export default function Mas({ navigation }) {
  const usuario = auth.currentUser;
  const [yo, setYo] = useState(null);
  const [errorDatos, setErrorDatos] = useState("");
  const [saliendo, setSaliendo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          setErrorDatos("");
          setYo(await obtenerUsuarioActual());
        } catch (e) {
          setErrorDatos(e.message);
        }
      })();
    }, []),
  );

  // Envía el enlace de Firebase, por si no recuerda la contraseña actual
  const cambiarContrasena = async () => {
    setError("");
    setAviso("");
    setEnviando(true);
    try {
      await sendPasswordResetEmail(auth, usuario.email);
      setAviso(`Enviamos un enlace a ${usuario.email} para cambiar tu contraseña de la app.`);
    } catch {
      setError("No se pudo enviar el correo. Intentá nuevamente.");
    } finally {
      setEnviando(false);
    }
  };

  // Pide a Firebase que envíe de nuevo el correo con el enlace de verificación
  const reenviarVerificacion = async () => {
    setError("");
    setAviso("");
    setEnviando(true);
    try {
      await sendEmailVerification(usuario);
      setAviso(
        `Enviamos el enlace a ${usuario.email}. Revisá también spam. Después de abrirlo, volvé a la pantalla que querías usar y tocá Reintentar.`,
      );
    } catch (e) {
      setError(
        e.code === "auth/too-many-requests"
          ? "Ya se enviaron varios correos. Esperá unos minutos e intentá nuevamente."
          : "No se pudo enviar el correo. Intentá nuevamente.",
      );
    } finally {
      setEnviando(false);
    }
  };

  const cerrarSesion = async () => {
    setError("");
    setSaliendo(true);
    try {
      // Navigation.js detecta el cierre de sesión y muestra el Login
      await signOut(auth);
    } catch {
      setError("No se pudo cerrar la sesión. Intentá nuevamente.");
      setSaliendo(false);
    }
  };

  return (
    <ScrollView style={g.pantalla} contentContainerStyle={g.contenido}>
      <View style={g.tarjeta}>
        <Text style={g.titulo}>{yo?.nombre || usuario?.displayName || "Usuario"}</Text>
        <Text style={g.texto}>{usuario?.email}</Text>
        {yo ? (
          <>
            <Text style={[g.textoSuave, { marginTop: 8 }]}>Usuario: {yo.usuario}</Text>
            <Text style={g.textoSuave}>Cargo: {yo.cargo || "Sin cargo asignado"}</Text>
            {yo.telefono ? <Text style={g.textoSuave}>Teléfono: {yo.telefono}</Text> : null}
          </>
        ) : null}
      </View>

      {errorDatos ? (
        <View style={[g.errorCaja, { marginTop: 0, marginBottom: 12 }]}>
          <MaterialIcons name="error-outline" size={18} color={COLORS.rojo} />
          <Text style={g.errorTexto}>{errorDatos}</Text>
        </View>
      ) : null}

      {yo ? (
        <View style={g.tarjeta}>
          <Text style={[g.seccion, { marginTop: 0 }]}>Mis permisos</Text>
          {MODULOS.map((modulo) => {
            const permitidas = ACCIONES.filter((a) => yo.permisos.includes(`${modulo.clave}:${a.clave}`));
            return (
              <View key={modulo.clave} style={[g.filaEntre, { paddingVertical: 5 }]}>
                <Text style={g.texto}>{modulo.nombre}</Text>
                <Text style={[g.textoSuave, { flexShrink: 1, textAlign: "right" }]}>
                  {permitidas.length ? permitidas.map((a) => a.nombre).join(", ") : "Sin acceso"}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}

      {aviso ? (
        <View style={g.avisoCaja}>
          <MaterialIcons name="info-outline" size={18} color={COLORS.naranjaOscuro} />
          <Text style={g.avisoTexto}>{aviso}</Text>
        </View>
      ) : null}
      {error ? (
        <View style={[g.errorCaja, { marginTop: 0, marginBottom: 12 }]}>
          <MaterialIcons name="error-outline" size={18} color={COLORS.rojo} />
          <Text style={g.errorTexto}>{error}</Text>
        </View>
      ) : null}

      <View style={{ gap: 10 }}>
        {/* Solo aparece si Firebase todavía no tiene el correo como verificado */}
        {usuario && !usuario.emailVerified ? (
          <TouchableOpacity style={g.boton} onPress={reenviarVerificacion} disabled={enviando}>
            <MaterialIcons name="mark-email-read" size={20} color={COLORS.blanco} />
            <Text style={g.botonTexto}>Enviar correo de verificación</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={g.botonSecundario} onPress={() => navigation.navigate("MiCuenta", { seccion: "telefono" })}>
          <MaterialIcons name="phone" size={20} color="#333333" />
          <Text style={g.botonSecundarioTexto}>Editar mi teléfono</Text>
        </TouchableOpacity>

        <TouchableOpacity style={g.botonSecundario} onPress={() => navigation.navigate("MiCuenta", { seccion: "contrasena" })}>
          <MaterialIcons name="key" size={20} color="#333333" />
          <Text style={g.botonSecundarioTexto}>Cambiar contraseña</Text>
        </TouchableOpacity>

        <TouchableOpacity style={g.botonSecundario} onPress={cambiarContrasena} disabled={enviando}>
          <MaterialIcons name="mail-outline" size={20} color="#333333" />
          <Text style={g.botonSecundarioTexto}>Olvidé mi contraseña: enviar enlace</Text>
        </TouchableOpacity>

        <TouchableOpacity style={g.botonPeligro} onPress={cerrarSesion} disabled={saliendo}>
          {saliendo ? (
            <ActivityIndicator color={COLORS.blanco} />
          ) : (
            <>
              <MaterialIcons name="power-settings-new" size={20} color={COLORS.blanco} />
              <Text style={g.botonPeligroTexto}>Cerrar sesión</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
