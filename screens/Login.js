import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signInWithEmailAndPassword } from "firebase/auth";

import { auth } from "../src/config/firebaseConfig";
import { loginStyles as styles } from "../styles/loginStyles";
import { COLORS } from "../styles/colors";

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadRememberedEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem("@rememberedEmail");

        if (savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch (error) {
        console.log("Error al cargar el correo:", error);
      }
    };

    loadRememberedEmail();
  }, []);

  const handleLogin = async () => {
    setErrorMessage("");

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setErrorMessage("Por favor, completá ambos campos.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage("Ingresá un correo electrónico válido.");
      return;
    }

    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, cleanEmail, password);

      if (rememberMe) {
        await AsyncStorage.setItem("@rememberedEmail", cleanEmail);
      } else {
        await AsyncStorage.removeItem("@rememberedEmail");
      }
    } catch (error) {
      console.error("Error de inicio de sesión:", error.code);

      switch (error.code) {
        case "auth/invalid-email":
          setErrorMessage("El correo electrónico no es válido.");
          break;

        case "auth/invalid-credential":
        case "auth/wrong-password":
          setErrorMessage("El correo o la contraseña son incorrectos.");
          break;

        case "auth/user-not-found":
          setErrorMessage("No se encontró una cuenta con ese correo.");
          break;

        case "auth/too-many-requests":
          setErrorMessage(
            "Demasiados intentos. Esperá unos minutos e intentá nuevamente.",
          );
          break;

        case "auth/network-request-failed":
          setErrorMessage("Error de conexión. Intentá nuevamente.");
          break;

        case "auth/invalid-api-key":
          setErrorMessage("Error de configuración de Firebase.");
          break;

        default:
          setErrorMessage("No se pudo iniciar sesión. Intentá nuevamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      {/* PAISAJE SUPERIOR */}
      <View pointerEvents="none" style={styles.topWaveContainer}>
        <Image
          source={require("../assets/paisaje.jpg")}
          style={styles.backgroundImage}
          resizeMode="cover"
        />

        {/* La curva blanca cubre la parte inferior del paisaje */}
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 400 280"
          preserveAspectRatio="none"
          style={styles.topWaveSvg}
        >
          <Path
            d="M0 198 C65 174 110 143 180 157 C255 171 300 220 400 235 L400 280 L0 280 Z"
            fill="#FFFFFF"
          />

          {/* Borde naranja de la onda */}
          <Path
            d="M0 198 C65 174 110 143 180 157 C255 171 300 220 400 235"
            fill="none"
            stroke={COLORS.naranja}
            strokeWidth="3"
          />
        </Svg>
      </View>

      {/* DECORACIÓN INFERIOR */}
      <View pointerEvents="none" style={styles.bottomWaveContainer}>
        <Image
          source={require("../assets/empanadas.png")}
          style={styles.backgroundImage}
          resizeMode="cover"
        />

        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 400 200"
          preserveAspectRatio="none"
          style={styles.bottomWaveSvg}
        >
          {/* Franja naranja */}
          <Path
            d="M0 35 C75 15 115 67 190 65 C270 62 320 8 400 15 L400 45 C320 38 270 88 190 88 C115 90 75 40 0 60 Z"
            fill={COLORS.naranja}
          />

          {/* Área blanca que se une al formulario */}
          <Path
            d="M0 0 L400 0 L400 15 C320 8 270 62 190 65 C115 67 75 15 0 35 Z"
            fill="#FFFFFF"
          />
        </Svg>
      </View>

      {/* FORMULARIO */}
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Image
              source={require("../assets/logo.jpg")}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.title}>Iniciar sesión</Text>

            <Text style={styles.subtitle}>
              Accedé a tu cuenta para continuar
            </Text>

            <View style={styles.decorativeLines}>
              <View style={styles.shortLine} />
              <View style={styles.mainLine} />
              <View style={styles.shortLine} />
            </View>

            {/* CORREO */}
            <Text style={styles.label}>Correo electrónico</Text>

            <View style={styles.inputContainer}>
              <FontAwesome
                name="envelope-o"
                size={21}
                color={COLORS.grisMedio}
                style={styles.icon}
              />

              <TextInput
                style={styles.input}
                placeholder="ejemplo@correo.com"
                placeholderTextColor={COLORS.grisMedio}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                editable={!isLoading}
                returnKeyType="next"
              />
            </View>

            {/* CONTRASEÑA */}
            <Text style={styles.label}>Contraseña</Text>

            <View style={styles.inputContainer}>
              <FontAwesome
                name="lock"
                size={24}
                color={COLORS.grisMedio}
                style={styles.icon}
              />

              <TextInput
                style={styles.input}
                placeholder="Ingresá tu contraseña"
                placeholderTextColor={COLORS.grisMedio}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="current-password"
                textContentType="password"
                editable={!isLoading}
                returnKeyType="go"
                onSubmitEditing={handleLogin}
              />

              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                accessibilityRole="button"
                accessibilityLabel={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                <FontAwesome
                  name={showPassword ? "eye-slash" : "eye"}
                  size={21}
                  color={COLORS.grisMedio}
                />
              </TouchableOpacity>
            </View>

            {/* RECORDAR / RECUPERAR */}
            <View style={styles.rowOptions}>
              <TouchableOpacity
                style={styles.rememberBox}
                onPress={() => setRememberMe(!rememberMe)}
                disabled={isLoading}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: rememberMe }}
              >
                <View
                  style={[
                    styles.checkbox,
                    rememberMe && styles.checkboxChecked,
                  ]}
                >
                  {rememberMe && (
                    <FontAwesome name="check" size={12} color={COLORS.blanco} />
                  )}
                </View>

                <Text style={styles.rememberText}>Recordarme</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate("Recuperar")}
                disabled={isLoading}
              >
                <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            </View>

            {/* ERROR */}
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <FontAwesome
                  name="exclamation-circle"
                  size={18}
                  color={COLORS.rojo}
                />

                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* BOTÓN */}
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
              accessibilityRole="button"
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.blanco} />
              ) : (
                <Text style={styles.buttonText}>Iniciar sesión</Text>
              )}
            </TouchableOpacity>

            {/* REGISTRO */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>¿No tenés cuenta? </Text>

              <TouchableOpacity
                onPress={() => navigation.navigate("SignUp")}
                disabled={isLoading}
              >
                <Text style={styles.registerLink}>Registrate.</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
