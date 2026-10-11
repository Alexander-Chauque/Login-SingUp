import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { loginStyles as styles } from '../styles/loginStyles';
import { ActivityIndicator } from 'react-native-web';
import { COLORS } from '../styles/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isEmailFocused, setIsEmailFocused]= useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Error", "Por favor ingrese ambos campos.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      Alert.alert("Login exitoso", "Has iniciado sesión correctamente.");
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
          errorMessage = "La contraseña es incorrecta.";
          break;
        case 'auth/user-not-found':
          errorMessage = "No se encontró un usuario con este correo.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Error de conexión, por favor intenta más tarde.";
          break;
        case 'auth/invalid-api-key':
          errorMessage = "La clave API de Firebase no es válida. Revisa el archivo .env.";
          break;
      }
      Alert.alert("Error", `${errorMessage}\n\nCódigo: ${error.code ?? 'desconocido'}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
      <Image source={require('../assets/logo.jpg')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Iniciar sesión</Text>

      <Text style={styles.subtitle}>
        Accede a tu cuenta de <Text style={styles.brandName}>LOS CARDONES</Text>
      </Text>

      <Text style={styles.label}>Correo</Text>
      <View style={[styles.inputContainer, isEmailFocused && styles.inputFocused]}>
        <FontAwesome name="envelope" size={20} color={COLORS.grisMedio} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Ingrese su correo"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          onFocus={()=> setIsEmailFocused(true)} // cuando entra
          onBlur={()=> setIsEmailFocused(false)} //cuando sale
        />
      </View>

      <Text style={styles.label}>Contraseña</Text>
      <View style={styles.inputContainer}>
        <FontAwesome name="lock" size={20} color="#ccc" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Ingrese su contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      <View style={styles.rememberContainer}>
        <TouchableOpacity
          style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
          onPress={() => setRememberMe(!rememberMe)}
        >
          {rememberMe && <FontAwesome name="check" size={12} color={COLORS.blanco} />}
        </TouchableOpacity>
        <Text style={styles.rememberText}>Recordar contraseña</Text>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate()}>
          <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color={COLORS.blanco}/>)  :
          (<Text style={styles.buttonText}>Ingresar</Text>)}
      </TouchableOpacity>

    
      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.signUpText}>
          ¿No tienes cuenta aún? 
        <Text style= {styles.linkText}> Regístrate</Text></Text>
      </TouchableOpacity>
    </View>
    </View>
  );
}

