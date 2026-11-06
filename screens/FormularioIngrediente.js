import React, { useLayoutEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { guardarIngrediente as guardarEnFirestore } from "../src/config/firestore";
import { COLORS } from "../styles/colors";
import { formStyles as styles } from "../styles/formStyles";

// Las unidades de medida que acepta el sistema
const UNIDADES = [
  { valor: "kg", nombre: "Kilogramo" },
  { valor: "g", nombre: "Gramos" },
  { valor: "l", nombre: "Litros" },
  { valor: "ml", nombre: "Mililitros" },
  { valor: "u", nombre: "Unidades" },
];

// La foto se guarda como texto dentro del documento, y Firestore admite hasta 1 MB por documento
const TAMANIO_MAXIMO_FOTO = 700000;

export default function FormularioIngrediente({ route, navigation }) {
  // Si llega un ingrediente, la pantalla edita. Si no, crea uno nuevo.
  const ingredienteAEditar = route.params?.ingrediente;
  const esEdicion = !!ingredienteAEditar;

  // Con la función, los valores iniciales se calculan una sola vez
  const [nombre, setNombre] = useState(() => ingredienteAEditar?.nombre_ingrediente || "");
  const [costo, setCosto] = useState(() =>
    ingredienteAEditar ? String(Number(ingredienteAEditar.costo_unitario)) : "",
  );
  const [unidad, setUnidad] = useState(() => ingredienteAEditar?.unidad_medida || "");
  const [descripcion, setDescripcion] = useState(
    () => ingredienteAEditar?.descripcion_ingrediente || "",
  );
  // La foto como texto, lista para mostrarla y para guardarla en el documento
  const [imagen, setImagen] = useState(() => ingredienteAEditar?.imagen_ingrediente || null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  // useLayoutEffect cambia el título antes de que se dibuje la pantalla
  useLayoutEffect(() => {
    navigation.setOptions({
      title: esEdicion ? "Editar Ingrediente" : "Crear Ingrediente",
    });
  }, [esEdicion, navigation]);

  const seleccionarImagen = async () => {
    setError("");
    // Pide permiso para ver las fotos del teléfono
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setError("Necesitamos acceso a tus fotos para agregar una imagen.");
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true, // Permite recortar antes de elegir
      aspect: [1, 1], // Recorte cuadrado
      quality: 0.2, // Reduce el peso de la foto para que entre en el documento
      base64: true, // Entrega la foto como texto
    });

    if (!resultado.canceled) {
      const foto = resultado.assets[0];
      if (!foto.base64 || foto.base64.length > TAMANIO_MAXIMO_FOTO) {
        setError("La foto es demasiado pesada. Probá recortarla o elegir otra.");
        return;
      }
      setImagen(`data:${foto.mimeType || "image/jpeg"};base64,${foto.base64}`);
    }
  };

  const eliminarImagen = () => setImagen(null);

  const guardarIngrediente = async () => {
    setError("");
    const nombreLimpio = nombre.trim();
    // Acepta la coma decimal que suele usarse en Argentina
    const costoTexto = costo.trim().replace(",", ".");

    if (!nombreLimpio || !costoTexto || !unidad) {
      setError("Completá el nombre, el costo y la unidad.");
      return;
    }
    // Number("12abc") da NaN. parseFloat lo habría aceptado como 12.
    const costoNumero = Number(costoTexto);
    if (!Number.isFinite(costoNumero) || costoNumero < 0) {
      setError("Ingresá un costo válido, igual o mayor a 0.");
      return;
    }

    setGuardando(true);
    try {
      const datos = {
        nombre_ingrediente: nombreLimpio,
        costo_unitario: costoNumero,
        unidad_medida: unidad,
        unidad_nombre: UNIDADES.find((opcion) => opcion.valor === unidad).nombre,
        descripcion_ingrediente: descripcion.trim(),
        imagen_ingrediente: imagen,
      };
      await guardarEnFirestore(datos, ingredienteAEditar?.id_ingrediente);
      navigation.goBack();
    } catch (e) {
      // Por ejemplo, un ingrediente repetido o una persona sin permiso
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* FOTO */}
        <View style={styles.fotoContainer}>
          <TouchableOpacity
            style={styles.fotoBoton}
            onPress={seleccionarImagen}
            accessibilityRole="button"
            accessibilityLabel={imagen ? "Cambiar foto" : "Agregar foto"}
          >
            {imagen ? (
              <Image source={{ uri: imagen }} style={styles.fotoImagen} />
            ) : (
              <>
                <MaterialIcons name="camera-alt" size={32} color={COLORS.grisMedio} />
                <Text style={styles.fotoTexto}>Agregar foto</Text>
              </>
            )}
          </TouchableOpacity>
          {imagen ? (
            <TouchableOpacity style={styles.fotoQuitar} onPress={eliminarImagen}>
              <Text style={styles.fotoQuitarTexto}>Quitar foto</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <Text style={styles.label}>Nombre del ingrediente *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Tomate"
          value={nombre}
          onChangeText={setNombre}
          placeholderTextColor={COLORS.grisMedio}
          maxLength={100}
        />

        <Text style={styles.label}>Costo unitario ($) *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. 2500"
          keyboardType="decimal-pad"
          value={costo}
          onChangeText={setCosto}
          placeholderTextColor={COLORS.grisMedio}
        />

        <Text style={styles.label}>Unidad de medida *</Text>
        <View style={styles.unidadesRow}>
          {UNIDADES.map((opcion) => {
            const activa = unidad === opcion.valor;
            return (
              <TouchableOpacity
                key={opcion.valor}
                style={[styles.unidadOpcion, activa && styles.unidadOpcionActiva]}
                onPress={() => setUnidad(opcion.valor)}
                accessibilityRole="radio"
                accessibilityState={{ selected: activa }}
              >
                <Text style={[styles.unidadTexto, activa && styles.unidadTextoActivo]}>
                  {opcion.nombre}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Descripción (opcional)</Text>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: "top" }]}
          placeholder="Ej. Tomate fresco para ensaladas..."
          multiline
          value={descripcion}
          onChangeText={setDescripcion}
          placeholderTextColor={COLORS.grisMedio}
        />

        {error ? (
          <View style={styles.errorContenedor}>
            <MaterialIcons name="error-outline" size={18} color={COLORS.rojo} />
            <Text style={styles.errorTexto}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.botonesRow}>
          <TouchableOpacity style={styles.botonCancelar} onPress={() => navigation.goBack()}>
            <Text style={styles.textoCancelar}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonGuardar}
            onPress={guardarIngrediente}
            disabled={guardando}
          >
            <MaterialIcons name="save" size={20} color={COLORS.blanco} />
            <Text style={styles.textoGuardar}>{guardando ? "Guardando..." : "Guardar"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
