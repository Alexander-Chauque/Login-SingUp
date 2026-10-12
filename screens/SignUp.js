import React, { useState, useEffect } from 'react';
import {View, Text, TextInput, TouchableOpacity, Alert, Image, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform,} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { signUpStyles as styles } from '../styles/signUpStyles';
import { COLORS } from '../styles/colors';

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
  const [focusedField, setFocusedField] = useState(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  

  const checkPasswordStrength = (password) => {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;

    if (password.length === 0) {
      setPasswordStrength('');
    } else if (strength <= 2) {
      setPasswordStrength('weak');
    } else if (strength <= 4) {
      setPasswordStrength('medium');
    } else {
      setPasswordStrength('strong');
    }
  };

  const handleSignUp = async () => {
  setErrorMessage('');

  // Validar que todos los campos estén completos
  if (!nombre.trim() || !apellido.trim() || !dni.trim() || !email.trim() || !password || !confirmPassword) {
    setErrorMessage("Todos los campos son obligatorios.");
    return;
  }

  // Validar nombre y apellido
  if (nombre.length < 2 || apellido.length < 2) {
    setErrorMessage('El nombre y el apellido deben tener al menos 2 caracteres.');
    return;
  }

  // DNI argentino: 7 u 8 dígitos
  if (!/^\d{7,8}$/.test(dni)) {
    setErrorMessage('Ingresá un DNI de 7 u 8 números.');
    return;
  }

  // Validar formato de correo
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    setErrorMessage("Ingrese un correo electrónico válido.");
    return;
  }

  // Validar contraseña segura
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*_\-]).{8,}$/;
  if (!passwordRegex.test(password)) {
    setErrorMessage("La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.");
    return;
  }

  // Validar que las contraseñas coincidan
  if (password !== confirmPassword) {
    setErrorMessage("Las contraseñas no coinciden.");
    return;
  }

  // Teléfono opcional: validar solo si se completó
  if (telefono.trim() && !/^[+\d\s()-]{8,20}$/.test(telefono.trim())) {
    setErrorMessage('Revisá el formato del teléfono. Debe tener entre 8 y 20 caracteres');
    return;
  }

  //Validar que aceptó los términos
  if (!acceptTerms) {
    setErrorMessage("Debes aceptar los términos y condiciones para registrarte.");
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

    //Enviar correo de verificación
    await sendEmailVerification(credential.user);
    Alert.alert("Registro exitoso", "Usuario registrado con éxito.",
    );
    

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
      case 'auth/too-many-requests':
        errorMensaje = 'Demasiados intentos. Esperá un momento.';
        break;
      }
      setErrorMessage(mensaje);
  } finally {
    setIsLoading(false);
  };
    //   Alert.alert("Error", `${errorMessage}\n\nCódigo: ${error.code ?? 'desconocido'}`);
    //   return;
    
    // }


    // try {
    //   await updateProfile(credential.user, { displayName: `${firstName.trim()} ${lastName.trim()}` });
    //   Alert.alert("Registro exitoso", "Usuario registrado con éxito.");
    // } catch (error) {
    //   Alert.alert("Cuenta creada", "La cuenta se creó, pero no se pudo guardar el nombre.");
    // }
    // Firebase inicia la sesión y el navegador muestra Home.
  };

  return (
  <View style={styles.container}>
  <View style={styles.circleTop} />
  <View style={styles.circleBottom} />

    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'undefined'}
      keyboardVerticalOffset={Platform.OS === 'ios' }
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Image source={require('../assets/logo.jpg')} style={styles.logo} />
          <Text style={styles.title}>Crear cuenta</Text>

          <Text style={styles.subtitle}>
            Registrate en <Text style={styles.brandName}>LOS CARDONES</Text>
          </Text>

          <View style={styles.infoCard}>
            <FontAwesome name='info-circle' size={16} color={COLORS.grisOscuro}/>
            <Text style ={styles.infoText}>
              Todos los campos son obligatorios excepto el teléfono
            </Text>
          </View>

          <View style={styles.colorLine} />

                    <Text style={styles.label}>Nombre</Text>
          <View style={[styles.inputContainer, focusedField === 'nombre' && styles.inputFocused]}>
            <FontAwesome name="user" size={20} color={COLORS.grisMedio} style={styles.icon} />
            <TextInput
                style={styles.input}
                placeholder="Ingrese su nombre"
                value={nombre}
                onChangeText={setNombre}
                onFocus={() => setFocusedField('nombre')}
                onBlur={() => setFocusedField(null)}
            />
          </View>

          <Text style={styles.label}>Apellido</Text>
          <View style={[styles.inputContainer, focusedField === 'apellido' && styles.inputFocused]}>
            <FontAwesome name="user" size={20} color={COLORS.grisMedio} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Ingrese su apellido"
              value={apellido}
              onChangeText={setApellido}
              onFocus={() => setFocusedField('apellido')}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <Text style={styles.label}>DNI</Text>
          <View style={[styles.inputContainer, focusedField === 'dni' && styles.inputFocused]}>
            <FontAwesome name="id-card" size={20} color={COLORS.grisMedio} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Ingrese su DNI"
              value={dni}
              onChangeText={setDni}
              keyboardType="numeric"
              onFocus={() => setFocusedField('dni')}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <Text style={styles.label}>Correo electrónico</Text>
          <View style={[styles.inputContainer, focusedField === 'email' && styles.inputFocused]}>
            <FontAwesome name="envelope" size={20} color={COLORS.grisMedio} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Ingrese su correo"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <Text style={styles.label}>Teléfono</Text>
          <View style={[styles.inputContainer, focusedField === 'telefono' && styles.inputFocused]}>
            <FontAwesome name="phone" size={20} color={COLORS.grisMedio} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Ingrese su teléfono"
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
              onFocus={() => setFocusedField('telefono')}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <Text style={styles.label}>Contraseña</Text>
          <View style={[styles.inputContainer, focusedField === 'password' && styles.inputFocused]}>
            <FontAwesome name="lock" size={20} color={COLORS.grisMedio} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Ingrese su contraseña"
              value={password}
              onChangeText= {setPassword}
              secureTextEntry={!showPassword}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={20} color={COLORS.grisMedio} />
            </TouchableOpacity>
          </View>

          {password.length > 0 && (
              <View style={styles.requirementsContainer}>
                <View style={styles.requirementItem}>
                  <FontAwesome
                    name={password.length >= 8 ? 'check-circle' : 'times-circle'}
                    size={12}
                    color={password.length >= 8 ? COLORS.verde : COLORS.rojo}
                    style={styles.requirementIcon}
                  />
                  <Text style={styles.requirementText}>Mínimo 8 caracteres</Text>
                </View>

                <View style={styles.requirementItem}>
                  <FontAwesome
                    name={/[A-Z]/.test(password) ? 'check-circle' : 'times-circle'}
                    size={12}
                    color={/[A-Z]/.test(password) ? COLORS.verde : COLORS.rojo}
                    style={styles.requirementIcon}
                  />
                  <Text style={styles.requirementText}>Una letra mayúscula</Text>
                </View>

                <View style={styles.requirementItem}>
                  <FontAwesome
                    name={/[a-z]/.test(password) ? 'check-circle' : 'times-circle'}
                    size={12}
                    color={/[a-z]/.test(password) ? COLORS.verde : COLORS.rojo}
                    style={styles.requirementIcon}
                  />
                  <Text style={styles.requirementText}>Una letra minúscula</Text>
                </View>

                <View style={styles.requirementItem}>
                  <FontAwesome
                    name={/\d/.test(password) ? 'check-circle' : 'times-circle'}
                    size={12}
                    color={/\d/.test(password) ? COLORS.verde : COLORS.rojo}
                    style={styles.requirementIcon}
                  />
                  <Text style={styles.requirementText}>Un número</Text>
                </View>

                <View style={styles.requirementItem}>
                  <FontAwesome
                    name={/[!@#$%^&*_\-}]/.test(password) ? 'check-circle' : 'times-circle'}
                    size={12}
                    color={/[!@#$%^&*_\-]/.test(password) ? COLORS.verde : COLORS.rojo}
                    style={styles.requirementIcon}
                  />
                  <Text style={styles.requirementText}>Un carácter especial (! @ # $ % ^ & _ -)</Text>
                </View>
              </View>
          )}

          <Text style={styles.label}>Confirmar contraseña</Text>
          <View style={[styles.inputContainer, focusedField === 'confirmPassword' && styles.inputFocused]}>
            <FontAwesome name="lock" size={20} color={COLORS.grisMedio} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Confirme su contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              onFocus={() => setFocusedField('confirmPassword')}
              onBlur={() => setFocusedField(null)}
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

          <View style={styles.termsContainer}>
            <TouchableOpacity
              style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}
              onPress={() => setAcceptTerms(!acceptTerms)}>{acceptTerms && (
                <FontAwesome name="check" size={12} color={COLORS.blanco} />)}
            </TouchableOpacity>
            <Text style={styles.termsText}> Acepto los{' '}
              <Text style={styles.termsLink} onPress={() => navigation.navigate('Terminos')}>
                términos y condiciones
              </Text>
            </Text>
          </View>

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
      </ScrollView>
    </KeyboardAvoidingView>
  </View>
  );
}
