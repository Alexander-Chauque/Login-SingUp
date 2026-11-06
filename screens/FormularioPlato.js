import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import {
  guardarPlato,
  listarCategorias,
  listarIngredientes,
  obtenerProducto,
} from "../src/config/firestore";
import { normalizar } from "../src/utils/ayudas";
import { COLORS } from "../styles/colors";
import { gestionStyles as g } from "../styles/gestionStyles";

// Crea un plato, o lo edita si llega route.params.id
export default function FormularioPlato({ route, navigation }) {
  const id = route.params?.id;
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoria, setCategoria] = useState(null);
  const [descripcion, setDescripcion] = useState("");
  // Un Set guarda los ids elegidos sin repetir
  const [elegidos, setElegidos] = useState(new Set());
  const [actuales, setActuales] = useState(new Set());

  const [categorias, setCategorias] = useState([]);
  const [ingredientes, setIngredientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({ title: id ? "Editar Plato" : "Crear Plato" });
  }, [id, navigation]);

  useEffect(() => {
    (async () => {
      try {
        const [listaCategorias, listaIngredientes, plato] = await Promise.all([
          listarCategorias(),
          listarIngredientes(),
          id ? obtenerProducto("plato", id) : null,
        ]);
        setCategorias(listaCategorias);
        setIngredientes(listaIngredientes);
        if (plato) {
          const ids = new Set(plato.ingredientes.map((i) => i.id_ingrediente));
          setNombre(plato.nombre_plato);
          setPrecio(String(Number(plato.precio_plato)));
          setCategoria(plato.categoria);
          setDescripcion(plato.descripcion_plato);
          setElegidos(ids);
          setActuales(ids);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setCargando(false);
      }
    })();
  }, [id]);

  // Se ofrecen los activos y los inactivos que este plato ya usa, igual que en la web
  const visibles = useMemo(() => {
    const texto = normalizar(busqueda.trim());
    return ingredientes.filter(
      (i) =>
        (i.estado_ingrediente || actuales.has(i.id_ingrediente)) &&
        normalizar(i.nombre_ingrediente).includes(texto),
    );
  }, [ingredientes, actuales, busqueda]);

  const alternar = (idIngrediente) => {
    setElegidos((anterior) => {
      const nuevo = new Set(anterior);
      if (nuevo.has(idIngrediente)) nuevo.delete(idIngrediente);
      else nuevo.add(idIngrediente);
      return nuevo;
    });
  };

  const guardar = async () => {
    setError("");
    const precioTexto = precio.trim().replace(",", ".");
    if (!nombre.trim() || !precioTexto || !categoria) {
      setError("Completá el nombre, el precio y la categoría.");
      return;
    }
    if (!(Number(precioTexto) > 0)) {
      setError("Ingresá un precio mayor a 0.");
      return;
    }
    if (!elegidos.size) {
      setError("Seleccioná al menos un ingrediente.");
      return;
    }
    setGuardando(true);
    try {
      await guardarPlato(
        {
          nombre_plato: nombre,
          precio_plato: Number(precioTexto),
          categoria,
          descripcion_plato: descripcion.trim(),
          ingredientes_ids: [...elegidos],
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
      <TextInput style={g.input} value={nombre} onChangeText={setNombre} placeholder="Ej. Locro salteño" placeholderTextColor={COLORS.grisMedio} maxLength={100} />

      <Text style={g.seccion}>Precio ($) *</Text>
      <TextInput style={g.input} value={precio} onChangeText={setPrecio} placeholder="Ej. 8500" placeholderTextColor={COLORS.grisMedio} keyboardType="decimal-pad" />

      <Text style={g.seccion}>Categoría *</Text>
      <View style={g.opciones}>
        {categorias.map((c) => {
          const activa = categoria === c.id_categoria_plato;
          return (
            <TouchableOpacity key={c.id_categoria_plato} style={[g.opcion, activa && g.opcionActiva]} onPress={() => setCategoria(c.id_categoria_plato)}>
              <Text style={[g.opcionTexto, activa && g.opcionTextoActivo]}>{c.nombre_categoria_plato}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={g.seccion}>Descripción (opcional)</Text>
      <TextInput style={[g.input, { height: 80, textAlignVertical: "top" }]} value={descripcion} onChangeText={setDescripcion} multiline maxLength={250} placeholder="Descripción breve del plato" placeholderTextColor={COLORS.grisMedio} />

      <Text style={g.seccion}>Ingredientes * ({elegidos.size} seleccionados)</Text>
      <View style={g.buscador}>
        <Ionicons name="search" size={20} color={COLORS.grisMedio} />
        <TextInput style={g.buscadorInput} value={busqueda} onChangeText={setBusqueda} placeholder="Buscar ingrediente..." placeholderTextColor={COLORS.grisMedio} autoCorrect={false} />
      </View>
      <View style={g.opciones}>
        {visibles.map((i) => {
          const activo = elegidos.has(i.id_ingrediente);
          return (
            <TouchableOpacity
              key={i.id_ingrediente}
              style={[g.opcion, activo && g.opcionActiva]}
              onPress={() => alternar(i.id_ingrediente)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: activo }}
            >
              <Text style={[g.opcionTexto, activo && g.opcionTextoActivo]}>
                {i.nombre_ingrediente}
                {!i.estado_ingrediente ? " (no disponible)" : ""}
              </Text>
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
