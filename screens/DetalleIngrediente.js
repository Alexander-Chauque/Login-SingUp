import React, { useLayoutEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,

  
  TouchableOpacity,
} from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../styles/colors";
import { detalleStyles as styles } from "../styles/detalleStyles";

export default function DetalleIngrediente({ route, navigation }) {
  const ingrediente = route.params?.ingrediente;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Detalle del ingrediente",
      headerStyle: { backgroundColor: COLORS.grisOscuro },
      headerTintColor: COLORS.blanco,
      headerTitleStyle: { fontFamily: "Oswald-Bold" },
    });
  }, [navigation]);

  if (!ingrediente) {
    return (
      <View style={styles.container}>
        <Text>No se encontraron los datos del ingrediente.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        {/* FOTO */}
        <View style={styles.fotoContainer}>
          {ingrediente.img_ingrediente ? (
            <Image
              source={{ uri: ingrediente.img_ingrediente }}
              style={styles.fotoImagen}
            />
          ) : (
            <View style={styles.fotoVacia}>
              <MaterialIcons
                name="image"
                size={45}
                color={COLORS.grisMedio}
              />
              <Text style={styles.fotoTexto}>Sin fotografía</Text>
            </View>
          )}
        </View>

        {/* NOMBRE */}
        <Text style={styles.label}>Nombre del ingrediente</Text>
        <View style={styles.campo}>
          <Text style={styles.valor}>
            {ingrediente.nombre_ingrediente || "Sin nombre"}
          </Text>
        </View>

        {/* PRECIO Y UNIDAD */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Costo unitario (Gs.)</Text>
            <View style={styles.campo}>
              <Text style={styles.valor}>
                {ingrediente.precio_ingrediente ?? "0"}
              </Text>
            </View>
          </View>

          <View style={styles.col}>
            <Text style={styles.label}>Unidad de medida</Text>
            <View style={styles.campo}>
              <Text style={styles.valor}>
                {ingrediente.unidad || "Sin unidad"}
              </Text>
            </View>
          </View>
        </View>

        {/* DESCRIPCIÓN */}
        <Text style={styles.label}>Descripción</Text>
        <View style={[styles.campo, styles.descripcionCampo]}>
          <Text style={styles.valor}>
            {ingrediente.descripcion || "Sin descripción"}
          </Text>
        </View>

        {/* DISPONIBILIDAD */}
        <Text style={styles.label}>Estado del ingrediente</Text>
        <View style={styles.estadoRow}>
          <MaterialIcons
            name={
              ingrediente.estado_ingrediente
                ? "check-circle"
                : "cancel"
            }
            size={22}
            color={
              ingrediente.estado_ingrediente
                ? COLORS.verde
                : COLORS.rojo
            }
          />

          <Text
            style={[
              styles.estadoTexto,
              {
                color: ingrediente.estado_ingrediente
                  ? COLORS.verde
                  : COLORS.rojo,
              },
            ]}
          >
            {ingrediente.estado_ingrediente
              ? "Disponible"
              : "No disponible"}
          </Text>
        </View>

        {/* BOTÓN VOLVER */}
        <TouchableOpacity
          style={styles.botonVolver}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons
            name="arrow-back"
            size={20}
            color={COLORS.blanco}
          />
          <Text style={styles.textoBoton}>Volver</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
