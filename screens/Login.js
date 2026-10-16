import React, { useState, useEffect } from 'react';
import {View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform,} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { signInWithEmailAndPassword, fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { loginStyles as styles } from '../styles/loginStyles';
import { COLORS } from '../styles/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Cargar el correo guardado al abrir la pantalla
  useEffect(() => {
    const loadRememberedEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('@rememberedEmail');
        if (savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch (error) {
        console.log('Error al cargar el correo guardado:', error);
      }
    };
    loadRememberedEmail();
  }, []);

  const handleLogin = async () => {
    setErrorMessage('');

    // Validar campos vacíos
    if (!email.trim() || !password) {
      setErrorMessage("Por favor ingrese ambos campos.");
      return;
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage("Ingrese un correo electrónico válido.");
      return;
    }

    setIsLoading(true);

    try {
      
      const methods = await fetchSignInMethodsForEmail(auth, email.trim());
      if(methods.length === 0){
        setErrorMessage("No se encontró un usuario con este correo")
        return;
      }

      await signInWithEmailAndPassword(auth, email.trim(), password);

      // Guardar o borrar el correo según el checkbox
      if (rememberMe) {
        await AsyncStorage.setItem('@rememberedEmail', email.trim());
      } else {
        await AsyncStorage.removeItem('@rememberedEmail');
      }

      
      // El observador de Firebase cambia la pantalla al detectar la sesión.
    } catch (error) {
      console.error('Error de inicio de sesión:', error.code, error.message);
      let errorMessage = "Hubo un problema al iniciar sesión.";
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = "El formato del correo electrónico no es válido.";
          break;
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
          errorMessage = "El correo o la contraseña son incorrectos.";
          break;
        case 'auth/user-not-found':
          errorMessage = "No se encontró un usuario con este correo.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Demasiados intentos fallidos. Espere unos minutos e intente nuevamente.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Error de conexión, por favor intenta más tarde.";
          break;
        case 'auth/invalid-api-key':
          errorMessage = "La clave API de Firebase no es válida. Revisa el archivo .env.";
          break;
      }
      setErrorMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.circleTop}/>
      <View style={styles.circleBottom}/>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Image source={require('../assets/logo.jpg')} style={styles.logo} />
            <Text style={styles.title}>Iniciar sesión</Text>

            <Text style={styles.subtitle}>
              Accedé a tu cuenta de <Text style={styles.brandName}>LOS CARDONES</Text>
            </Text>

            <View style={styles.colorLine} />

            <View style={styles.formCard}>
              <Text style={styles.label}>Correo</Text>
              <View style={[styles.inputContainer, isEmailFocused && styles.inputFocused]}>
                <FontAwesome name="envelope" size={20} color={COLORS.grisMedio} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ingrese su correo"
                  placeholderTextColor={COLORS.grisMedio}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                />
              </View>

              <Text style={styles.label}>Contraseña</Text>
              <View style={[styles.inputContainer, isPasswordFocused && styles.inputFocused]}>
                <FontAwesome name="lock" size={20} color={COLORS.grisMedio} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ingrese su contraseña"
                  placeholderTextColor={COLORS.grisMedio}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={20} color={COLORS.grisMedio} />
                </TouchableOpacity>
              </View>

              <View style={styles.rememberContainer}>
                <TouchableOpacity
                  style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  {rememberMe && <FontAwesome name="check" size={12} color={COLORS.blanco} />}
                </TouchableOpacity>
                <Text style={styles.rememberText}>Recordar Contraseña</Text>
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={COLORS.blanco} size="small" />
                ) : (
                  <Text style={styles.buttonText}>Ingresar</Text>
                )}
              </TouchableOpacity>

              {errorMessage ? (
                <View style={styles.errorContainer}>
                  <FontAwesome name="exclamation-circle" size={16} color={COLORS.rojo} />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              <TouchableOpacity onPress={() => navigation.navigate('Recuperar')}>
                <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.signUpText}>
                  ¿No tienes cuenta aún? <Text style={styles.linkText}>Regístrate</Text>
                </Text>
              </TouchableOpacity>
              </View>
            </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}