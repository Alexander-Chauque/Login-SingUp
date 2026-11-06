import React, { useEffect, useLayoutEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { obtenerUsuarioActual } from "../src/config/firestore";
import { actualizarMiTelefono, cambiarMiContrasena } from "../src/config/personal";
import { COLORS } from "../styles/colors";
import { gestionStyles as g } from "../styles/gestionStyles";

// Datos propios y contraseña. route.params.seccion: "telefono" o "contrasena"
export default function MiCuenta({ route, navigation }) {
  const { seccion } = route.params;
  const esTelefono = seccion === "telefono";
  const [telefono, setTelefono] = useState("");
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [ver, setVer] = useState(false);
  const [cargando, setCargando] = useState(esTelefono);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({ title: esTelefono ? "Mi teléfono" : "Cambiar contraseña" });
  }, [esTelefono, navigation]);

  useEffect(() => {
    if (!esTelefono) return;
    obtenerUsuarioActual()
      .then((yo) => setTelefono(yo.telefono || ""))
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [esTelefono]);

  const guardar = async () => {
    setError("");
    setGuardando(true);
    try {
      if (esTelefono) {
        await actualizarMiTelefono(telefono);
      } else {
        if (!actual || !nueva || !confirmacion) throw new Error("Completá las tres contraseñas.");
        if (nueva !== confirmacion) throw new Error("Las contraseñas no coinciden.");
        await cambiarMiContrasena(actual, nueva);
      }
      navigation.goBack();
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <View style={g.centro}>
        <ActivityIndicator size="large" color={COLORS.naranja} />
      </View>
    );
  }

  return (
    <ScrollView style={g.pantalla} contentContainerStyle={g.contenidoFormulario} keyboardShouldPersistTaps="handled">
      {esTelefono ? (
        <>
          <Text style={[g.seccion, { marginTop: 0 }]}>Teléfono</Text>
          <TextInput style={g.input} value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" maxLength={20} placeholder="Ej. 387 456 7890" placeholderTextColor={COLORS.grisMedio} />
          <Text style={[g.textoSuave, { marginTop: 8 }]}>
            El correo identifica tu cuenta y no se puede cambiar desde aquí.
          </Text>
        </>
      ) : (
        <>
          <Text style={[g.seccion, { marginTop: 0 }]}>Contraseña actual *</Text>
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
        </>
      )}

      {error ? (
        <View style={g.errorCaja}>
          <MaterialIcons name="error-outline" size={18} color={COLORS.rojo} />
          <Text style={g.errorTexto}>{error}</Text>
        </View>
      ) : null}

      <TouchableOpacity style={[g.boton, { marginTop: 20 }, guardando && g.botonDesactivado]} onPress={guardar} disabled={guardando}>
        <MaterialIcons name="save" size={18} color={COLORS.blanco} />
        <Text style={g.botonTexto}>{guardando ? "Guardando..." : "Guardar"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
