import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Switch,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../src/config/firebaseConfig";
import { COLORS } from "../styles/colors";
import { formStyles as styles } from "../styles/formStyles";

export default function FormularioIngrediente({ route, navigation }) {
  // Detectar si es Edición o Creación
  const ingredienteAEditar = route.params?.ingrediente;
  const esEdicion = !!ingredienteAEditar;

  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [unidad, setUnidad] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [disponible, setDisponible] = useState(true);
  const [imagen, setImagen] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Cambiar el título del header según el modo y cargar datos
  useLayoutEffect(() => {
    navigation.setOptions({
      title: esEdicion ? "Editar Ingrediente" : "Crear Ingrediente",
      headerStyle: { backgroundColor: COLORS.grisOscuro },
      headerTintColor: COLORS.blanco,
      headerTitleStyle: { fontFamily: "Oswald-Bold" },
    });

    if (esEdicion) {
      setNombre(ingredienteAEditar.nombre_ingrediente || "");
      setPrecio(ingredienteAEditar.precio_ingrediente?.toString() || "");
      setUnidad(ingredienteAEditar.unidad || "");
      setDescripcion(ingredienteAEditar.descripcion || "");
      setDisponible(ingredienteAEditar.estado_ingrediente ?? true);
      setImagen(ingredienteAEditar.img_ingrediente || null);
    }
  }, [esEdicion, ingredienteAEditar, navigation]);

  // Función para seleccionar foto
  const seleccionarImagen = async () => {
    // Pedir permisos (necesario en iOS y Android moderno)
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso denegado",
        "Necesitamos acceso a tus fotos para continuar.",
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImagen(result.assets[0].uri);
    }
  };

  // Función para guardar (Crear o Editar)
  const guardarIngrediente = async () => {
    if (!nombre || !precio || !unidad) {
      Alert.alert(
        "Faltan datos",
        "Por favor completa Nombre, Precio y Unidad.",
      );
      return;
    }

    setGuardando(true);

    // Nota: La imagen se guarda como URI local. Para producción real, deberías subirla a Firebase Storage.
    const datos = {
      nombre_ingrediente: nombre,
      precio_ingrediente: parseFloat(precio) || 0,
      unidad: unidad,
      descripcion: descripcion,
      estado_ingrediente: disponible,
      img_ingrediente: imagen,
    };

    try {
      if (esEdicion) {
        const docRef = doc(db, "Ingredientes", ingredienteAEditar.id);
        await updateDoc(docRef, datos);
      } else {
        await addDoc(collection(db, "Ingredientes"), datos);
      }
      navigation.goBack();
    } catch (error) {
      console.error("Error al guardar: ", error);
      Alert.alert("Error", "No se pudo guardar el ingrediente.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* FOTO */}
        <View style={styles.fotoContainer}>
          <TouchableOpacity
            style={styles.fotoBoton}
            onPress={seleccionarImagen}
          >
            {imagen ? (
              <Image source={{ uri: imagen }} style={styles.fotoImagen} />
            ) : (
              <>
                <MaterialIcons
                  name="camera-alt"
                  size={32}
                  color={COLORS.grisMedio}
                />
                <Text style={styles.fotoTexto}>Agregar foto</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* CAMPOS DE TEXTO */}
        <Text style={styles.label}>Nombre del ingrediente *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Tomate"
          value={nombre}
          onChangeText={setNombre}
          placeholderTextColor={COLORS.grisMedio}
        />

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Costo unitario (Gs.) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. 2500"
              keyboardType="numeric"
              value={precio}
              onChangeText={setPrecio}
              placeholderTextColor={COLORS.grisMedio}
            />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Unidad de medida *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. kg, L, u"
              value={unidad}
              onChangeText={setUnidad}
              placeholderTextColor={COLORS.grisMedio}
            />
          </View>
        </View>

        <Text style={styles.label}>Descripción (Opcional)</Text>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: "top" }]}
          placeholder="Ej. Tomate fresco para ensaladas..."
          multiline
          value={descripcion}
          onChangeText={setDescripcion}
          placeholderTextColor={COLORS.grisMedio}
        />

        {/* SWITCH DE ESTADO */}
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>¿Está disponible?</Text>
          <Switch
            value={disponible}
            onValueChange={setDisponible}
            trackColor={{ false: COLORS.grisMedio, true: COLORS.verde }}
            thumbColor={COLORS.blanco}
          />
        </View>

        {/* BOTONES */}
        <View style={styles.botonesRow}>
          <TouchableOpacity
            style={styles.botonCancelar}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.textoCancelar}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonGuardar}
            onPress={guardarIngrediente}
            disabled={guardando}
          >
            <MaterialIcons name="save" size={20} color={COLORS.blanco} />
            <Text style={styles.textoGuardar}>
              {guardando ? "Guardando..." : "Guardar"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
