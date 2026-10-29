import { StyleSheet } from 'react-native';
import { COLORS, FONTS } from './colors';

export const signUpStyles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#626262',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 5,
      overflow: 'hidden',
  },

  scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 20,
      paddingHorizontal: 20,
      paddingBottom: 100,
  },

  card: {
      backgroundColor: COLORS.blanco,
      borderRadius: 24,
      padding: 20,
      paddingBottom: 50,
      width: 300,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
      borderTopWidth: 4,
      borderTopColor: COLORS.naranja,
  },

  formCard: {
      width: '100%',
      backgroundColor: '#FFFFFF',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#E6E6E6',
      paddingHorizontal: 22,
      paddingTop: 24,
      paddingBottom: 24,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 4,
      elevation: 5,
  },

  logo: {
      width: 80,
      height: 80,
      marginBottom: 10,
      resizeMode: 'contain',
      alignSelf: 'center',
  },

  title: {
      fontSize: 22,
      fontFamily: 'Oswald-Bold',
      color: COLORS.grisOscuro,
      marginBottom: 5,
      textAlign: 'center',
      textTransform: 'uppercase',
  },

  subtitle: {
      fontSize: 12,
      fontFamily: FONTS.cuerpo,
      color: COLORS.grisOscuro,
      marginBottom: 15,
      textAlign: 'center',
  },

  brandName: {
      color: COLORS.naranja,
      fontFamily: 'Oswald-Bold',
  },

  colorLine: {
      height: 4,
      width: 60,
      backgroundColor: COLORS.naranja,
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: 15,
  },

  label: {
      alignSelf: 'flex-start',
      fontSize: 13,
      fontFamily: FONTS.titulo,
      color: COLORS.grisOscuro,
      marginTop: 8,
      marginBottom: 4,
      textTransform: 'uppercase',  },

  inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: COLORS.bordeClaro,
      borderRadius: 8,
      paddingHorizontal: 12,
      marginBottom: 12,
      width: '100%',
      height: 45,
      backgroundColor: COLORS.blanco,
  },

  inputFocused: {
      borderColor: COLORS.naranja,
      borderWidth: 2,
  },

  icon: {
      marginRight: 10,
  },

  infoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#E8E8E8', 
      borderRadius: 8,
      padding: 10,
      marginTop: 5,
      marginBottom: 15,
      width: '100%',
  },

  infoText: {
      color: '#4A4A4A',                 
      fontSize: 11,
      fontFamily: FONTS.cuerpo,
      marginLeft: 8,
      flex: 1,
  },

  input: {
      flex: 1,
      height: 40,
      fontFamily: FONTS.cuerpo,
      fontSize: 13,
      color: COLORS.grisOscuro,
  },

  button: {
      backgroundColor: COLORS.naranja,
      borderRadius: 10,
      height: 50,
      width: '60%',
      alignSelf: 'center',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 15,
      marginBottom: 15,
  },

  buttonText: {
      color: COLORS.blanco,
      fontSize: 16,
      fontFamily:  'Oswald-Bold',
      textTransform: 'uppercase',
  },

  loginText: {
      color: COLORS.naranja,
      fontFamily: FONTS.cuerpo,
      fontSize: 14,
      textAlign: 'center',
      marginTop: 8,
      marginBottom: 16,
      textDecorationLine: 'underline',
  },

  linkText: {
      color: COLORS.naranja,
      fontFamily:  'Oswald-Bold',
      textDecorationLine: 'underline',
  },

  errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFEBEE',
      borderRadius: 8,
      padding: 8,
      marginTop: 8,
      marginBottom: 8,
      width: '100%',
  },

  errorText: {
      color: COLORS.rojo,
      fontSize: 11,
      fontFamily: FONTS.cuerpo,
      marginLeft: 8,
      flex: 1,
  },

  termsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
      marginBottom: 15,
      width: '100%',
      paddingLeft: 4,
  },

  checkbox: {
      width: 20,
      height: 20,
      borderWidth: 2,
      borderColor: COLORS.naranja,
      borderRadius: 4,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
  },

  checkboxChecked: {
      backgroundColor: COLORS.naranja,
      borderColor: COLORS.naranja,
  },

  termsText: {
      fontSize: 12,
      fontFamily: FONTS.cuerpo,
      color: COLORS.grisOscuro,
      flex: 1,
  },

  termsLink: {
      color: COLORS.naranja,
      fontFamily:  'Oswald-Bold',
      fontWeight: 'bold',
      textDecorationLine: 'underline',
  },

  strengthContainer: {
      width: '100%',
      marginTop: -8,
      marginBottom: 12,
  },

  strengthBarContainer: {
      height: 6,
      backgroundColor: '#E0E0E0',
      borderRadius: 3,
      overflow: 'hidden',
      marginBottom: 4,
  },

  strengthBar: {
      height: '100%',
      width: '0%',
      borderRadius: 3,
  },

  strengthWeak: {
      width: '33%',
      backgroundColor: COLORS.rojo,
  },

  strengthMedium: {
      width: '66%',
      backgroundColor: '#F57C00',
  },

  strengthStrong: {
      width: '100%',
      backgroundColor: COLORS.verde,
  },

  strengthText: {
      fontSize: 11,
      fontFamily: FONTS.cuerpo,
      textAlign: 'right',
  },

  requirementsContainer: {
      marginTop: 5,
      marginBottom: 12,
  },

  requirementItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 3,
  },

  requirementIcon: {
  
  },

  requirementText: {
      fontSize: 11,
      fontFamily: FONTS.cuerpo,
      color: COLORS.grisOscuro,
  },
  });
