import React, { useEffect, useLayoutEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { listarCatalogo } from "../src/config/catalogos";
import { crearGasto, editarGasto, obtenerGasto } from "../src/config/finanzas";
import { COLORS } from "../styles/colors";
import { gestionStyles as g } from "../styles/gestionStyles";

// Crea un gasto en la caja abierta, o lo edita si llega route.params.id
export default function FormularioGasto({ route, navigation }) {
  const id = route.params?.id;
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [categoria, setCategoria] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({ title: id ? "Editar gasto" : "Nuevo gasto" });
  }, [id, navigation]);

  useEffect(() => {
    (async () => {
      try {
        const [lista, gasto] = await Promise.all([listarCatalogo("categoriaGasto"), id ? obtenerGasto(id) : null]);
        // Se ofrecen las activas y la que el gasto ya usa
        setCategorias(lista.filter((c) => c.activo || c.id === gasto?.categoria));
        if (gasto) {
          setDescripcion(gasto.descripcion);
          setMonto(String(gasto.monto));
          setCategoria(gasto.categoria);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setCargando(false);
      }
    })();
  }, [id]);

  const guardar = async () => {
    setError("");
    setGuardando(true);
    try {
      const datos = { descripcion, monto, categoria };
      if (id) await editarGasto(id, datos);
      else await crearGasto(datos);
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
      <Text style={[g.seccion, { marginTop: 0 }]}>Descripción *</Text>
      <TextInput style={[g.input, { height: 70, textAlignVertical: "top" }]} value={descripcion} onChangeText={setDescripcion} multiline placeholder="Ej. Compra de verduras" placeholderTextColor={COLORS.grisMedio} />

      <Text style={g.seccion}>Monto ($) *</Text>
      <TextInput style={g.input} value={monto} onChangeText={setMonto} keyboardType="decimal-pad" placeholder="Ej. 5000" placeholderTextColor={COLORS.grisMedio} />

      <Text style={g.seccion}>Categoría *</Text>
      <View style={g.opciones}>
        {categorias.map((c) => {
          const activa = categoria === c.id;
          return (
            <TouchableOpacity
              key={c.id}
              style={[g.opcion, activa && g.opcionActiva]}
              onPress={() => setCategoria(c.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: activa }}
            >
              <Text style={[g.opcionTexto, activa && g.opcionTextoActivo]}>{c.nombre}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {!categorias.length ? (
        <Text style={g.textoSuave}>Todavía no hay categorías activas. Creá una en Finanzas → Categorías de gasto.</Text>
      ) : null}

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
