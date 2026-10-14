import React from 'react';
import { ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS } from '../styles/colors';

export default function Terminos({ navigation }) {
  return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Términos y Condiciones</Text>
      <Text style={styles.subtitle}>Última actualización: 12 de octubre de 2026</Text>

      <Text style={styles.paragraph}>
          Bienvenido a <Text style={styles.bold}>Los Cardones Salta</Text>. 
          Al registrarte y usar nuestra aplicación móvil, aceptás los siguientes 
          términos y condiciones. Por favor, leelos con atención antes de continuar.
      </Text>

      <Text style={styles.sectionTitle}>1. Aceptación de los términos</Text>
      <Text style={styles.paragraph}>
          Al crear una cuenta en Los Cardones Salta, confirmás que tenés al menos 
          18 años y que aceptás estos términos en su totalidad. Si no estás de 
          acuerdo con alguna parte, no podés usar la aplicación.
      </Text>

      <Text style={styles.sectionTitle}>2. Uso de la aplicación</Text>
      <Text style={styles.paragraph}>
          La aplicación está destinada a la gestión interna del restaurante 
          "Los Cardones Salta". Los usuarios registrados podrán acceder a 
          funcionalidades como gestión de empleados, inventario, mesas y comandas, 
          según el rol asignado por el administrador.
      </Text>

      <Text style={styles.sectionTitle}>3. Registro y seguridad de la cuenta</Text>
      <Text style={styles.paragraph}>
          Para usar la aplicación, es necesario registrarse con un correo 
          electrónico válido y una contraseña segura. El usuario es responsable 
          de mantener la confidencialidad de sus credenciales y de todas las 
          actividades que ocurran en su cuenta.
      </Text>

      <Text style={styles.sectionTitle}>4. Privacidad de los datos</Text>
      <Text style={styles.paragraph}>
          Los datos personales que proporciones (nombre, apellido, DNI, correo 
          electrónico y teléfono) serán almacenados de forma segura y utilizados 
          únicamente para la gestión interna del restaurante. No compartiremos 
          tu información con terceros sin tu consentimiento.
      </Text>

      <Text style={styles.sectionTitle}>5. Responsabilidades del usuario</Text>
      <Text style={styles.paragraph}>
          El usuario se compromete a:
      </Text>
      <Text style={styles.bullet}>• Proporcionar información veraz y actualizada.</Text>
      <Text style={styles.bullet}>• No compartir su cuenta con otras personas.</Text>
      <Text style={styles.bullet}>• Usar la aplicación solo para fines laborales.</Text>
      <Text style={styles.bullet}>• Reportar cualquier uso indebido al administrador.</Text>

      <Text style={styles.sectionTitle}>6. Propiedad intelectual</Text>
      <Text style={styles.paragraph}>
          El nombre "Los Cardones Salta", el logo, los colores y el diseño de la 
          aplicación son propiedad exclusiva del restaurante. Queda prohibida su 
          reproducción total o parcial sin autorización previa.
      </Text>

      <Text style={styles.sectionTitle}>7. Modificaciones</Text>
      <Text style={styles.paragraph}>
          Nos reservamos el derecho de modificar estos términos en cualquier 
          momento. Las modificaciones serán notificadas a través de la aplicación 
          y entrarán en vigencia desde su publicación.
      </Text>

      <Text style={styles.sectionTitle}>8. Contacto</Text>
      <Text style={styles.paragraph}>
          Si tenés alguna duda sobre estos términos, podés contactarnos a través 
          de:
      </Text>
      <Text style={styles.bullet}>• Correo: contacto@loscardones.com</Text>
      <Text style={styles.bullet}>• Teléfono: +54 387 408 8656</Text>
      <Text style={styles.bullet}>• Dirección: Salta, Argentina</Text>

      <Text style={styles.finalText}>
          Al marcar la casilla "Acepto los términos y condiciones" durante el 
          registro, confirmás que leíste, entendiste y aceptaste todos los 
          puntos mencionados anteriormente.
      </Text>

      <TouchableOpacity 
          style={styles.button}onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Entendido</Text>
      </TouchableOpacity>
      </ScrollView>
  );
  }

  const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: COLORS.blanco,
  },
  content: {
      padding: 24,
      paddingBottom: 40,
  },
  title: {
      fontSize: 26,
      fontFamily: FONTS.titulo,
      color: COLORS.grisOscuro,
      marginBottom: 8,
      textAlign: 'center',
  },
  subtitle: {
      fontSize: 12,
      fontFamily: FONTS.cuerpo,
      color: COLORS.grisMedio,
      marginBottom: 24,
      textAlign: 'center',
      fontStyle: 'italic',
  },
  sectionTitle: {
      fontSize: 16,
      fontFamily: FONTS.titulo,
      color: COLORS.naranja,
      marginTop: 20,
      marginBottom: 8,
  },
  paragraph: {
      fontSize: 14,
      fontFamily: FONTS.cuerpo,
      color: COLORS.grisOscuro,
      lineHeight: 22,
      marginBottom: 8,
      textAlign: 'justify',
  },
  bullet: {
      fontSize: 14,
      fontFamily: FONTS.cuerpo,
      color: COLORS.grisOscuro,
      lineHeight: 22,
      marginLeft: 16,
      marginBottom: 4,
  },
  bold: {
      fontFamily: FONTS.titulo,
      fontWeight: 'bold',
      color: COLORS.naranja,
  },
  finalText: {
      fontSize: 13,
      fontFamily: FONTS.cuerpo,
      color: COLORS.grisOscuro,
      lineHeight: 20,
      marginTop: 24,
      marginBottom: 20,
      fontStyle: 'italic',
      textAlign: 'center',
      backgroundColor: '#F5F5F5',
      padding: 12,
      borderRadius: 8,
  },
  button: {
      backgroundColor: COLORS.naranja,
      borderRadius: 10,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
  },
  buttonText: {
      color: COLORS.blanco,
      fontSize: 16,
      fontFamily: FONTS.titulo,
      fontWeight: 'bold',
      textTransform: 'uppercase',
  },
  });