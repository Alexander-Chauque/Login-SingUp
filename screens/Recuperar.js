import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { recoverStyles as styles } from '../styles/recoverStyles';
import { COLORS } from '../styles/colors';
import FondoAcceso from './FondoAcceso';

export default function Recuperar({ navigation }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEmailFocused, setIsEmailFocused] = useState(false);

  const handleRecover = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    // Validar que el campo no esté vacío
    if (!email.trim()) {
      setErrorMessage("Por favor ingrese su correo electrónico.");
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
      // Enviar el correo de recuperación con Firebase
      await sendPasswordResetEmail(auth, email.trim());
      
      // Mostrar mensaje de éxito
      setSuccessMessage("¡Enlace enviado! Revisá tu bandeja de entrada o spam.");
      
    } catch (error) {
      let errorMessage = "Hubo un problema al enviar el correo.";
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = "No se encontró un usuario con este correo.";
          break;
        case 'auth/invalid-email':
          errorMessage = "El formato del correo no es válido.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Demasiados intentos. Esperá unos minutos.";
          break;
      }
      setErrorMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FondoAcceso>
      <Text style={styles.title}>Recuperar contraseña</Text>
      <Text style={styles.subtitle}>Te enviaremos un enlace para que puedas restablecerla.</Text>

      <View style={styles.decorativeLines}>
        <View style={styles.shortLine} />
        <View style={styles.mainLine} />
        <View style={styles.shortLine} />
      </View>

      <Text style={styles.label}>Correo electrónico</Text>
      <View style={[styles.inputContainer, isEmailFocused && styles.inputFocused]}>
        <FontAwesome name="envelope-o" size={21} color={COLORS.grisMedio} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="ejemplo@correo.com"
          placeholderTextColor={COLORS.grisMedio}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          onFocus={() => setIsEmailFocused(true)}
          onBlur={() => setIsEmailFocused(false)}
        />
      </View>

      {/* Mensajes de error o éxito */}
      {errorMessage ? (
        <View style={styles.errorContainer}>
          <FontAwesome name="exclamation-circle" size={18} color={COLORS.rojo} />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      {successMessage ? (
        <View style={styles.successContainer}>
          <FontAwesome name="check-circle" size={18} color={COLORS.verde} />
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      ) : null}

      {/* Botón de enviar */}
      <TouchableOpacity style={styles.button} onPress={handleRecover} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color={COLORS.blanco} />
        ) : (
          <Text style={styles.buttonText}>Enviar enlace</Text>
        )}
      </TouchableOpacity>

      {/* Volver al Login */}
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.backText}>
          ¿Recordaste tu contraseña? <Text style={styles.linkText}>Iniciá sesión</Text>
        </Text>
      </TouchableOpacity>
    </FondoAcceso>
  );
}