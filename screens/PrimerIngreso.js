import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";

import { auth } from "../src/config/firebaseConfig";
import {
  cambiarContrasenaObligatoria,
  comprobarVerificacion,
  reenviarVerificacion,
} from "../src/config/personal";
import { COLORS } from "../styles/colors";
import { gestionStyles as g } from "../styles/gestionStyles";

// Pasos obligatorios antes de usar la app.
// paso: "verificar" (confirmar el correo) o "cambiar" (reemplazar la contraseña temporal).
// alTerminar: vuelve a comprobar el estado de la cuenta.
export default function PrimerIngreso({ paso, alTerminar }) {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [ver, setVer] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  const ejecutar = async (accion) => {
    setError("");
    setAviso("");
    setOcupado(true);
    try {
      await accion();
    } catch (e) {
      setError(e.message);
    } finally {
      setOcupado(false);
    }
  };

  const yaVerifique = () =>
    ejecutar(async () => {
      if (await comprobarVerificacion()) {
        alTerminar();
      } else {
        setAviso("Todavía no figura verificado. Abrí el enlace del correo y volvé a intentar.");
      }
    });

  const reenviar = () =>
    ejecutar(async () => {
      await reenviarVerificacion();
      setAviso("Te enviamos el correo de nuevo. Revisá también la carpeta de spam.");
    });

  const cambiar = () =>
    ejecutar(async () => {
      if (!actual || !nueva || !confirmacion) throw new Error("Completá las tres contraseñas.");
      if (nueva !== confirmacion) throw new Error("Las contraseñas no coinciden.");
      await cambiarContrasenaObligatoria(actual, nueva);
      alTerminar();
    });

  return (
    <ScrollView style={g.pantalla} contentContainerStyle={g.contenidoFormulario} keyboardShouldPersistTaps="handled">
      {paso === "verificar" ? (
        <>
          <Text style={g.titulo}>Verificá tu correo</Text>
          <Text style={[g.texto, { marginTop: 8 }]}>
            Te enviamos un enlace a {auth.currentUser?.email}. Abrilo y después tocá el botón.
          </Text>
          <TouchableOpacity style={[g.boton, { marginTop: 20 }, ocupado && g.botonDesactivado]} onPress={yaVerifique} disabled={ocupado}>
            <MaterialIcons name="check" size={18} color={COLORS.blanco} />
            <Text style={g.botonTexto}>Ya lo verifiqué</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[g.botonSecundario, { marginTop: 10 }, ocupado && g.botonDesactivado]} onPress={reenviar} disabled={ocupado}>
            <MaterialIcons name="mail-outline" size={18} color="#333333" />
            <Text style={g.botonSecundarioTexto}>Enviar el correo de nuevo</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={g.titulo}>Cambiá tu contraseña</Text>
          <Text style={[g.texto, { marginTop: 8 }]}>
            Es tu primer ingreso. Reemplazá la contraseña temporal por una que solo vos conozcas.
          </Text>

          <Text style={g.seccion}>Contraseña temporal *</Text>
          <TextInput style={g.input} value={actual} onChangeText={setActual} secureTextEntry={!ver} autoCapitalize="none" autoComplete="current-password" />

          <Text style={g.seccion}>Nueva contraseña *</Text>
          <TextInput style={g.input} value={nueva} onChangeText={setNueva} secureTextEntry={!ver} autoCapitalize="none" autoComplete="new-password" />

          <Text style={g.seccion}>Confirmar contraseña *</Text>
          <TextInput style={g.input} value={confirmacion} onChangeText={setConfirmacion} secureTextEntry={!ver} autoCapitalize="none" autoComplete="new-password" />

          <TouchableOpacity style={[g.fila, { marginTop: 10 }]} onPress={() => setVer(!ver)} accessibilityRole="button">
            <MaterialIcons name={ver ? "visibility-off" : "visibility"} size={20} color={COLORS.grisMedio} />
            <Text style={g.textoSuave}>{ver ? "Ocultar contraseñas" : "Mostrar contraseñas"}</Text>
          </TouchableOpacity>

          <View style={[g.avisoCaja, { marginTop: 14, marginBottom: 0 }]}>
            <MaterialIcons name="info-outline" size={18} color="#92400E" />
            <Text style={g.avisoTexto}>Mínimo 8 caracteres, con mayúscula, número y carácter especial.</Text>
          </View>

          <TouchableOpacity style={[g.boton, { marginTop: 20 }, ocupado && g.botonDesactivado]} onPress={cambiar} disabled={ocupado}>
            <MaterialIcons name="save" size={18} color={COLORS.blanco} />
            <Text style={g.botonTexto}>{ocupado ? "Guardando..." : "Cambiar contraseña"}</Text>
          </TouchableOpacity>
        </>
      )}

      {error ? (
        <View style={g.errorCaja}>
          <MaterialIcons name="error-outline" size={18} color={COLORS.rojo} />
          <Text style={g.errorTexto}>{error}</Text>
        </View>
      ) : null}
      {aviso ? <Text style={[g.mensaje, { color: "#065F46" }]}>{aviso}</Text> : null}

      <TouchableOpacity style={[g.fila, { marginTop: 24, justifyContent: "center" }]} onPress={() => signOut(auth)} accessibilityRole="button">
        <MaterialIcons name="logout" size={18} color={COLORS.grisMedio} />
        <Text style={g.textoSuave}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
