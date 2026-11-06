import React, { useEffect, useLayoutEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { guardarMesa, obtenerMesa, UBICACIONES } from "../src/config/catalogos";
import { COLORS } from "../styles/colors";
import { gestionStyles as g } from "../styles/gestionStyles";

// Crea una mesa, o la edita si llega route.params.id
export default function FormularioMesa({ route, navigation }) {
  const id = route.params?.id;
  const [numero, setNumero] = useState("");
  const [ubicacion, setUbicacion] = useState(null);
  const [cargando, setCargando] = useState(!!id);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({ title: id ? "Editar mesa" : "Nueva mesa" });
  }, [id, navigation]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const mesa = await obtenerMesa(id);
        setNumero(String(mesa.numero_mesa));
        setUbicacion(mesa.ubicacion);
      } catch (e) {
        setError(e.message);
      } finally {
        setCargando(false);
      }
    })();
  }, [id]);

  const guardar = async () => {
    setError("");
    if (!numero.trim() || !ubicacion) {
      setError("Completá el número y la ubicación.");
      return;
    }
    setGuardando(true);
    try {
      await guardarMesa({ numero: numero.trim(), ubicacion }, id);
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
      <Text style={[g.seccion, { marginTop: 0 }]}>Número de mesa *</Text>
      <TextInput style={g.input} value={numero} onChangeText={setNumero} keyboardType="number-pad" maxLength={6} placeholder="Ej. 12" placeholderTextColor={COLORS.grisMedio} />

      <Text style={g.seccion}>Ubicación *</Text>
      <View style={g.opciones}>
        {UBICACIONES.map((opcion) => {
          const activa = ubicacion === opcion.valor;
          return (
            <TouchableOpacity
              key={opcion.valor}
              style={[g.opcion, activa && g.opcionActiva]}
              onPress={() => setUbicacion(opcion.valor)}
              accessibilityRole="radio"
              accessibilityState={{ selected: activa }}
            >
              <Text style={[g.opcionTexto, activa && g.opcionTextoActivo]}>{opcion.nombre}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

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
