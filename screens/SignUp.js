import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { auth } from '../src/config/firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { signUpStyles as styles} from '../styles/signUpStyles';
import { COLORS } from '../styles/colors';
import { LinearGradient } from 'expo-linear-gradient';

export default function SignUp({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignUp = async () => {
  setErrorMessage('');

  // Validar que todos los campos estén completos
  if (!nombre.trim() || !apellido.trim() || !dni.trim() || !email.trim() || !telefono.trim() || !password || !confirmPassword) {
    setErrorMessage("Todos los campos son obligatorios.");
    return;
  }

  // Validar formato de correo
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    setErrorMessage("Ingrese un correo electrónico válido.");
    return;
  }

  // Validar contraseña segura
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
  if (!passwordRegex.test(password)) {
    setErrorMessage("La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.");
    return;
  }

  // Validar que las contraseñas coincidan
  if (password !== confirmPassword) {
    setErrorMessage("Las contraseñas no coinciden.");
    return;
  }

  setIsLoading(true);

  try {
    // Crear usuario en Firebase
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);

    // Guardar el nombre completo del usuario
    await updateProfile(credential.user, {
      displayName: `${nombre.trim()} ${apellido.trim()}`,
    });

    Alert.alert("Registro exitoso", "Usuario registrado con éxito.");
    // El observador de Firebase redirige al Home
  } catch (error) {
    let errorMessage = "Hubo un problema al registrar el usuario.";
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = "El correo electrónico ya está en uso.";
        break;
      case 'auth/invalid-email':
        errorMessage = "El formato del correo electrónico no es válido.";
        break;
      case 'auth/weak-password':
        errorMessage = "La contraseña es demasiado débil.";
        break;
      case 'auth/network-request-failed':
        errorMessage = "Error de conexión, por favor intenta más tarde.";
        break;
      }
      Alert.alert("Error", `${errorMessage}\n\nCódigo: ${error.code ?? 'desconocido'}`);
      return;
    }

    try {
      await updateProfile(credential.user, { displayName: `${firstName.trim()} ${lastName.trim()}` });
      Alert.alert("Registro exitoso", "Usuario registrado con éxito.");
    } catch (error) {
      Alert.alert("Cuenta creada", "La cuenta se creó, pero no se pudo guardar el nombre.");
    }
    // Firebase inicia la sesión y el navegador muestra Home.
  };

  return (
    <LinearGradient
      colors={['#4A4A4A', '#E89B3C', '#D18A2E']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.card}>
        <Image source={require('../assets/logo.jpg')} style={styles.logo} />
        <Text style={styles.title}>Crear cuenta</Text>

        <Text style={styles.subtitle}>
          Registrate en <Text style={styles.brandName}>LOS CARDONES</Text>
        </Text>

        <Text style={styles.label}>Nombre</Text>
        <View style={styles.inputContainer}>
          <FontAwesome name="user" size={20} color={COLORS.grisMedio} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Ingrese su nombre"
            value={nombre}
            onChangeText={setNombre}
          />
        </View>

        <Text style={styles.label}>Apellido</Text>
        <View style={styles.inputContainer}>
          <FontAwesome name="user" size={20} color={COLORS.grisMedio} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Ingrese su apellido"
            value={apellido}
            onChangeText={setApellido}
          />
        </View>

        <Text style={styles.label}>DNI</Text>
        <View style={styles.inputContainer}>
          <FontAwesome name="id-card" size={20} color={COLORS.grisMedio} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Ingrese su DNI"
            value={dni}
            onChangeText={setDni}
            keyboardType="numeric"
          />
        </View>

        <Text style={styles.label}>Correo electrónico</Text>
        <View style={styles.inputContainer}>
          <FontAwesome name="envelope" size={20} color={COLORS.grisMedio} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Ingrese su correo"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <Text style={styles.label}>Teléfono</Text>
        <View style={styles.inputContainer}>
          <FontAwesome name="phone" size={20} color={COLORS.grisMedio} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Ingrese su teléfono"
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
          />
        </View>

        <Text style={styles.label}>Contraseña</Text>
        <View style={styles.inputContainer}>
          <FontAwesome name="lock" size={20} color={COLORS.grisMedio} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Ingrese su contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={20} color={COLORS.grisMedio} />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Confirmar contraseña</Text>
        <View style={styles.inputContainer}>
          <FontAwesome name="lock" size={20} color={COLORS.grisMedio} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Confirme su contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <FontAwesome name={showConfirmPassword ? "eye-slash" : "eye"} size={20} color={COLORS.grisMedio} />
          </TouchableOpacity>
        </View>

        {errorMessage ? (
          <View style={styles.errorContainer}>
            <FontAwesome name="exclamation-circle" size={16} color={COLORS.rojo} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color={COLORS.blanco} />
          ) : (
            <Text style={styles.buttonText}>Registrarse</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.signUpText}>
            ¿Ya estás registrado? <Text style={styles.linkText}>Inicia Sesión</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}
