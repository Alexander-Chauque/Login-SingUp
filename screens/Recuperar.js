import React, { useState } from 'react';
import {View, Text, TextInput, TouchableOpacity, Image, ImageBackground, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { recoverStyles as styles } from '../styles/recoverStyles';
import { COLORS } from '../styles/colors';

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
    <ImageBackground
      source={require('../assets/fondo1.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <KeyboardAvoidingView
        style={{ flex: 1, width: '100%' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Image source={require('../assets/logo2.png')} style={styles.logo} />

            <Text style={styles.title}>Recuperar Contraseña</Text>
            <Text style={styles.subtitle}>Te enviaremos un enlace para que puedas restablecerla.</Text>
            
            <View style={styles.colorLine} />

            <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
            <View style={[styles.inputContainer, isEmailFocused && styles.inputFocused]}>
              <FontAwesome name="envelope" size={18} color={COLORS.grisMedio} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Ej. usuario@correo.com"
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
                <FontAwesome name="exclamation-circle" size={16} color={COLORS.rojo} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {successMessage ? (
              <View style={styles.successContainer}>
                <FontAwesome name="check-circle" size={16} color={COLORS.verde} />
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            ) : null}

            {/* Botón de enviar */}
            <TouchableOpacity style={styles.button} onPress={handleRecover} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color={COLORS.blanco} />
              ) : (
                <Text style={styles.buttonText}>ENVIAR ENLACE</Text>
              )}
            </TouchableOpacity>

            {/* Volver al Login */}
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.backText}>
                ¿Recordaste tu contraseña? <Text style={styles.linkText}>Inicia Sesión</Text>
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}