import React, { useLayoutEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { abrirCaja } from "../src/config/finanzas";
import { COLORS } from "../styles/colors";
import { gestionStyles as g } from "../styles/gestionStyles";

export default function FormularioCaja({ navigation }) {
  const [saldo, setSaldo] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({ title: "Abrir caja" });
  }, [navigation]);

  const guardar = async () => {
    setError("");
    setGuardando(true);
    try {
      const id = await abrirCaja({ saldoInicial: saldo, observaciones });
      // replace evita volver a este formulario con el botón de atrás
      navigation.replace("DetalleCaja", { id });
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ScrollView style={g.pantalla} contentContainerStyle={g.contenidoFormulario} keyboardShouldPersistTaps="handled">
      <Text style={[g.seccion, { marginTop: 0 }]}>Saldo inicial ($) *</Text>
      <TextInput style={g.input} value={saldo} onChangeText={setSaldo} keyboardType="decimal-pad" placeholder="Ej. 20000" placeholderTextColor={COLORS.grisMedio} />

      <Text style={g.seccion}>Observaciones (opcional)</Text>
      <TextInput style={[g.input, { height: 80, textAlignVertical: "top" }]} value={observaciones} onChangeText={setObservaciones} multiline maxLength={1000} placeholderTextColor={COLORS.grisMedio} />

      {error ? (
        <View style={g.errorCaja}>
          <MaterialIcons name="error-outline" size={18} color={COLORS.rojo} />
          <Text style={g.errorTexto}>{error}</Text>
        </View>
      ) : null}

      <TouchableOpacity style={[g.boton, { marginTop: 20 }, guardando && g.botonDesactivado]} onPress={guardar} disabled={guardando}>
        <MaterialIcons name="lock-open" size={18} color={COLORS.blanco} />
        <Text style={g.botonTexto}>{guardando ? "Abriendo..." : "Abrir caja"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
