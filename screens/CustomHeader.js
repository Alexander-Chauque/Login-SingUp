import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { obtenerUsuarioActual } from "../src/config/firestore";
import { COLORS } from "../styles/colors";

const obtenerIniciales = (nombre) => {
  const palabras = nombre.trim().split(/\s+/);
  const ultima = palabras.length > 1 ? palabras[palabras.length - 1][0] : "";
  return `${palabras[0][0]}${ultima}`.toUpperCase();
};

// Barra superior, igual que .topbar en la web.
// titulo: si llega, se muestra en lugar del logo (lo usan los formularios).
// mostrarAvatar: en false no pide datos del usuario, para pantallas sin sesión iniciada.
export default function CustomHeader({
  navigation,
  showBackButton = false,
  titulo,
  mostrarAvatar = true,
}) {
  const [iniciales, setIniciales] = useState("");
  const [cargo, setCargo] = useState("");

  useEffect(() => {
    if (!mostrarAvatar) return undefined;
    let activo = true;
    obtenerUsuarioActual()
      .then((yo) => {
        if (!activo) return;
        setIniciales(obtenerIniciales(yo.nombre));
        setCargo(yo.cargo || "Usuario");
      })
      // Sin conexión o sin empleado, el avatar queda vacío: el error ya se ve en la pantalla
      .catch(() => {});
    // Evita actualizar el encabezado si ya se cerró la pantalla
    return () => {
      activo = false;
    };
  }, [mostrarAvatar]);

  return (
    <View style={styles.barra}>
      <View style={styles.izquierda}>
        {/* El menú abre la pestaña Más, que tiene los datos de la cuenta */}
        <TouchableOpacity
          onPress={() => (showBackButton ? navigation.goBack() : navigation.navigate("Más"))}
          accessibilityRole="button"
          accessibilityLabel={showBackButton ? "Volver" : "Menú"}
        >
          <Ionicons
            name={showBackButton ? "arrow-back" : "menu"}
            size={28}
            color={COLORS.blanco}
          />
        </TouchableOpacity>

        {titulo ? (
          <Text style={styles.titulo} numberOfLines={1}>
            {titulo}
          </Text>
        ) : (
          <Image
            source={require("../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        )}
      </View>

      {mostrarAvatar ? (
        <View style={styles.usuario}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>{iniciales}</Text>
          </View>
          {cargo ? (
            <Text style={styles.cargo} numberOfLines={1}>
              {cargo}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  barra: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.grisOscuro,
    paddingHorizontal: 14,
    paddingTop: 46,
    paddingBottom: 12,
    elevation: 4,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  izquierda: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 118,
    height: 40,
  },
  titulo: {
    flex: 1,
    fontFamily: "Oswald-Bold",
    fontSize: 18,
    color: COLORS.blanco,
  },
  // .user-dropdown en la web
  usuario: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#4A4A4A",
    paddingVertical: 4,
    paddingLeft: 4,
    paddingRight: 12,
    borderRadius: 25,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.naranja,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarTexto: {
    fontFamily: "Oswald-Bold",
    color: COLORS.blanco,
    fontSize: 13,
  },
  cargo: {
    maxWidth: 86,
    fontFamily: "Oswald",
    color: COLORS.blanco,
    fontSize: 13,
  },
});
