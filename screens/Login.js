import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signInWithEmailAndPassword } from "firebase/auth";

import { auth } from "../src/config/firebaseConfig";
import { loginStyles as styles } from "../styles/loginStyles";
import { COLORS } from "../styles/colors";
import FondoAcceso from "./FondoAcceso";

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
    <FondoAcceso>
      <Text style={styles.title}>Iniciar sesión</Text>

      <Text style={styles.subtitle}>Accedé a tu cuenta para continuar</Text>

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
            style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
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
    </FondoAcceso>
  );
}
