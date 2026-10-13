import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { FontAwesome } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Estado para detectar cuando se selecciona la contraseña.
  const [passwordFocused, setPasswordFocused] = useState(false);

 const handleLogin = async () => {
  if (!email.trim() || !password.trim()) {
    Alert.alert(
      'Campos obligatorios',
      'Por favor, ingresá tu correo y contraseña.'
    );
    return;
  }

  try {
    await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    Alert.alert(
      'Login exitoso',
      'Has iniciado sesión correctamente.'
    );

  } catch (error) {
    console.error('Error de inicio de sesión:', error);

    let errorMessage = 'Hubo un problema al iniciar sesión.';

    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = 'El correo electrónico no es válido.';
        break;

      case 'auth/invalid-credential':
      case 'auth/wrong-password':
        errorMessage = 'El correo o la contraseña son incorrectos.';
        break;

      case 'auth/user-not-found':
        errorMessage = 'No se encontró un usuario con ese correo.';
        break;

      case 'auth/network-request-failed':
        errorMessage = 'Error de conexión. Revisá tu internet.';
        break;

      case 'auth/invalid-api-key':
        errorMessage = 'La clave API de Firebase no es válida.';
        break;
    }

    Alert.alert(
      'Error',
      errorMessage + '\n\nCódigo: ' + (error.code || 'desconocido')
    );
  }
};

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Decoración del fondo */}
        <View style={styles.circleTop} />
        <View style={styles.circleBottom} />

        {/* Tarjeta principal */}
        <View style={styles.mainCard}>

          {/* Logo del restaurante */}
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>INICIAR SESIÓN</Text>

          {/* Tarjeta interna del formulario */}
          <View style={styles.formCard}>

            {/* Campo de correo */}
            <Text style={styles.label}>CORREO ELECTRÓNICO</Text>

            <View style={styles.inputContainer}>
              <FontAwesome
                name="envelope"
                size={16}
                color="#BDBDBD"
                style={styles.inputIcon}
              />

              <TextInput
                style={styles.input}
                placeholder="Ingrese su correo"
                placeholderTextColor="#B0B0B0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Campo de contraseña */}
            <Text style={styles.label}>CONTRASEÑA</Text>

            <View
              style={[
                styles.inputContainer,
                passwordFocused && styles.inputFocused,
              ]}
            >
              <FontAwesome
                name="lock"
                size={18}
                color="#BDBDBD"
                style={styles.inputIcon}
              />

              <TextInput
                style={styles.input}
                placeholder="Ingrese su contraseña"
                placeholderTextColor="#B0B0B0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />

              {/* Mostrar u ocultar contraseña */}
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                accessibilityLabel={
                  showPassword
                    ? 'Ocultar contraseña'
                    : 'Mostrar contraseña'
                }
              >
                <FontAwesome
                  name={showPassword ? 'eye-slash' : 'eye'}
                  size={18}
                  color="#AFAFAF"
                />
              </TouchableOpacity>
            </View>

            {/* Botón de inicio de sesión */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>INICIAR SESIÓN</Text>
            </TouchableOpacity>

            {/* Enlace de recuperación: tarea de Teo */}
            <TouchableOpacity
              style={styles.forgotButton}
              onPress={() =>
                Alert.alert(
                  'Recuperar contraseña',
                  'La recuperación de contraseña debe configurarse.'
                )
              }
            >
              <Text style={styles.forgotText}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            {/* Navegación al registro */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerQuestion}>
                ¿No tienes cuenta?
              </Text>

              <TouchableOpacity
                onPress={() => navigation.navigate('SignUp')}
              >
                <Text style={styles.registerLink}>
                  Regístrate
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#626262',
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 35,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },

  // Círculos decorativos del fondo
  circleTop: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#A77D48',
    top: -95,
    right: -75,
  },

  circleBottom: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#A77D48',
    bottom: -125,
    left: -90,
  },

  // Contenedor blanco exterior
  mainCard: {
    width: '100%',
    maxWidth: 390,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 6,
    borderTopColor: '#FFA12B',
    borderRadius: 24,
    paddingHorizontal: 13,
    paddingTop: 15,
    paddingBottom: 24,
    alignItems: 'center',
  },

  logo: {
    width: 120,
    height: 120,
    marginBottom: 12,
  },

  title: {
    fontSize: 27,
    fontWeight: '900',
    color: '#F3A13D',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: '#D0D0D0',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
  },

  // Tarjeta interior con sombra
  formCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 24,

    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 5,
  },

  label: {
    alignSelf: 'flex-start',
    fontSize: 13,
    fontWeight: '800',
    color: '#505050',
    marginBottom: 8,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    minHeight: 43,
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
  },

  // Se aplica al enfocar el campo de contraseña
  inputFocused: {
    borderColor: '#FFA12B',
    borderWidth: 2,
  },

  inputIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    minWidth: 0,
    height: 42,
    fontSize: 13,
    color: '#444444',
    paddingVertical: 0,
  },

  eyeButton: {
    padding: 5,
    marginLeft: 5,
  },

  button: {
    width: '85%',
    alignSelf: 'center',
    backgroundColor: '#FFA12B',
    paddingVertical: 12,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  forgotButton: {
    alignSelf: 'center',
    marginTop: 24,
    marginBottom: 24,
  },

  forgotText: {
    color: '#686868',
    fontSize: 12,
    textAlign: 'center',
  },

  registerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },

  registerQuestion: {
    color: '#555555',
    fontSize: 13,
    fontWeight: '700',
    marginRight: 10,
  },

  registerLink: {
    color: '#F28C18',
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});