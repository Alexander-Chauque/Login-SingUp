import React from "react";
import {
  View,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from "react-native";

import { loginStyles as styles } from "../styles/loginStyles";
const ANCHO_DISENIO = 794;

// Fondo común de Login, Registro y Recuperar.
export default function FondoAcceso({ children }) {
  // Ancho de la pantalla del teléfono
  const { width: anchoPantalla } = useWindowDimensions();
  const escala = anchoPantalla / ANCHO_DISENIO;
  const altoEncabezado = 300 * escala;

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* PAISAJE SUPERIOR */}
          <Image
            source={require("../assets/login/login_encabezado.png")}
            style={{ width: anchoPantalla, height: altoEncabezado }}
          />

          <View style={[styles.card, { marginTop: -altoEncabezado * 0.52 }]}>
            {/* DIBUJOS DE FONDO */}
            <Image
              source={require("../assets/login/login_hojas.png")}
              style={[
                styles.decoracionHojas,
                { width: 196 * escala, height: 335 * escala, top: 68 * escala },
              ]}
            />
            <Image
              source={require("../assets/login/login_empanada.png")}
              style={[
                styles.decoracionEmpanada,
                { width: 180 * escala, height: 238 * escala, top: 178 * escala },
              ]}
            />

            <Image
              source={require("../assets/login/login_logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            {children}
          </View>

          <View style={styles.espacioLibre} />

          {/* EMPANADAS */}
          <Image
            source={require("../assets/login/login_pie.png")}
            style={{ width: anchoPantalla, height: 215 * escala }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
