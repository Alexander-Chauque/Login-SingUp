import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { homeStyles as styles } from '../styles/homeStyles';
import { COLORS } from '../styles/colors';

export default function Home({ navigation }) {

  const handleLogOut = async () => {
    try {
      await signOut(auth);  
      Alert.alert("Sesión cerrada", "Has cerrado sesión correctamente.");
      // El observador de Firebase muestra Login al cerrar la sesión.
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al cerrar sesión.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.circleTop} />
      <View style={styles.circleBottom} />

      <View style={styles.card}>
        <Image source={require('../assets/logo.jpg')} style={styles.logo} />
        <Text style={styles.title}>¡Bienvenido!</Text>
        <Text style={styles.subtitle}>
          Sistema de gestión de <Text style={styles.brandName}>LOS CARDONES</Text>
        </Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogOut}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
