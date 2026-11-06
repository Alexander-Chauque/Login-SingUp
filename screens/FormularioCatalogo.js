import React, { useEffect, useLayoutEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { CATALOGOS, guardarElementoCatalogo, obtenerElementoCatalogo } from "../src/config/catalogos";
import { COLORS } from "../styles/colors";
import { gestionStyles as g } from "../styles/gestionStyles";

// Crea o edita una categoría, un tipo de bebida o un turno. route.params: { tipo, id }
export default function FormularioCatalogo({ route, navigation }) {
  const { tipo, id } = route.params;
  const config = CATALOGOS[tipo];
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cargando, setCargando] = useState(!!id);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({ title: `${id ? "Editar" : "Nuevo"}: ${config.singular}` });
  }, [id, config, navigation]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const elemento = await obtenerElementoCatalogo(tipo, id);
        setNombre(elemento.nombre);
        setDescripcion(elemento.descripcion);
      } catch (e) {
        setError(e.message);
      } finally {
        setCargando(false);
      }
    })();
  }, [tipo, id]);

  const guardar = async () => {
    setError("");
    if (!nombre.trim()) {
      setError("Completá el nombre.");
      return;
    }
    setGuardando(true);
    try {
      await guardarElementoCatalogo(tipo, { nombre, descripcion }, id);
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
      <Text style={[g.seccion, { marginTop: 0 }]}>Nombre *</Text>
      <TextInput style={g.input} value={nombre} onChangeText={setNombre} placeholderTextColor={COLORS.grisMedio} maxLength={50} />

      <Text style={g.seccion}>Descripción (opcional)</Text>
      <TextInput style={[g.input, { height: 80, textAlignVertical: "top" }]} value={descripcion} onChangeText={setDescripcion} multiline placeholderTextColor={COLORS.grisMedio} />

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
