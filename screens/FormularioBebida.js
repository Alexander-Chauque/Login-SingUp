import React, { useEffect, useLayoutEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { guardarBebida, listarTiposBebida, obtenerProducto } from "../src/config/firestore";
import { COLORS } from "../styles/colors";
import { gestionStyles as g } from "../styles/gestionStyles";

export default function FormularioBebida({ route, navigation }) {
  const id = route.params?.id;
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [tipo, setTipo] = useState(null);
  const [descripcion, setDescripcion] = useState("");
  const [tipos, setTipos] = useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({ title: id ? "Editar Bebida" : "Crear Bebida" });
  }, [id, navigation]);

  useEffect(() => {
    (async () => {
      try {
        const [listaTipos, bebida] = await Promise.all([
          listarTiposBebida(),
          id ? obtenerProducto("bebida", id) : null,
        ]);
        // Se ofrecen los activos y el que la bebida ya usa
        setTipos(listaTipos.filter((t) => t.estado_tipo_bebida || t.id_tipo_bebida === bebida?.id_tipo_bebida));
        if (bebida) {
          setNombre(bebida.nombre_bebida);
          setPrecio(String(Number(bebida.precio_bebida)));
          setTipo(bebida.id_tipo_bebida);
          setDescripcion(bebida.descripcion_bebida);
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
    const precioTexto = precio.trim().replace(",", ".");
    if (!nombre.trim() || !precioTexto || !tipo) {
      setError("Completá el nombre, el precio y el tipo.");
      return;
    }
    if (!(Number(precioTexto) > 0)) {
      setError("Ingresá un precio mayor a 0.");
      return;
    }
    setGuardando(true);
    try {
      await guardarBebida(
        {
          nombre_bebida: nombre,
          precio_bebida: Number(precioTexto),
          id_tipo_bebida: tipo,
          descripcion_bebida: descripcion.trim(),
        },
        id,
      );
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
      <Text style={g.seccion}>Nombre *</Text>
      <TextInput style={g.input} value={nombre} onChangeText={setNombre} placeholder="Ej. Limonada" placeholderTextColor={COLORS.grisMedio} maxLength={50} />

      <Text style={g.seccion}>Precio ($) *</Text>
      <TextInput style={g.input} value={precio} onChangeText={setPrecio} placeholder="Ej. 3500" placeholderTextColor={COLORS.grisMedio} keyboardType="decimal-pad" />

      <Text style={g.seccion}>Tipo *</Text>
      <View style={g.opciones}>
        {tipos.map((t) => {
          const activo = tipo === t.id_tipo_bebida;
          return (
            <TouchableOpacity key={t.id_tipo_bebida} style={[g.opcion, activo && g.opcionActiva]} onPress={() => setTipo(t.id_tipo_bebida)}>
              <Text style={[g.opcionTexto, activo && g.opcionTextoActivo]}>{t.nombre_tipo_bebida}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={g.seccion}>Descripción (opcional)</Text>
      <TextInput style={[g.input, { height: 80, textAlignVertical: "top" }]} value={descripcion} onChangeText={setDescripcion} multiline placeholder="Descripción breve de la bebida" placeholderTextColor={COLORS.grisMedio} />

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
