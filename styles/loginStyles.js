import { StyleSheet } from 'react-native';
import { COLORS, FONTS } from './colors';

export const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.blanco,
  },

  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    resizeMode: 'contain',
    borderRadius: 40,
    elevation: 5,
  },

  title: {
    fontSize: 28,
    fontFamily: FONTS.titulo,
    color: COLORS.grisOscuro,
    marginBottom: 10,
    textAlign: 'center',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },

  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.titulo,
    color: COLORS.grisMedio,
    marginBottom: 30,
    textAlign: 'center',
  },

  brandName: {
  color: COLORS.naranja,
  fontFamily: FONTS.titulo,
  fontWeight: 'bold',
},

  label: {
    alignSelf: 'flex-start',
    fontSize: 14,
    fontFamily: FONTS.titulo,
    color: COLORS.grisOscuro,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    textTransform: 'uppercase',
    
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.bordeClaro,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
    width: '100%',
    height: 50,
    backgroundColor: COLORS.blanco,
  },

  inputFocused: {
    borderColor: COLORS.naranja,
    borderWidth: 2,
  },

  icon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    height: 40,
    fontFamily: FONTS.cuerpo,
    fontSize: 14,
    color: COLORS.grisOscuro,
  },

  rememberContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 10,
  marginBottom: 10,
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
    backgroundColor: 'transparent',
  },

  checkboxChecked: {
    backgroundColor: COLORS.naranja,
  },

  rememberText: {
    fontSize: 14,
    fontFamily: FONTS.cuerpo,
    color: COLORS.grisOscuro,
  },
  button: {
    backgroundColor: COLORS.naranja,
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },

  buttonText: {
    color: COLORS.blanco,
    fontSize: 16,
    fontFamily: FONTS.titulo, // Oswald
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },


  forgotText: {
    color: COLORS.naranja,
    fontFamily: FONTS.cuerpo,
    fontSize: 14,
    textAlign: 'right',
    marginTop: 8,
    marginBottom: 16,
  },

  signUpText: {
    marginTop: 20,
    color: COLORS.grisOscuro,
    fontFamily: FONTS.cuerpo,
    fontSize: 14,
    textAlign: 'center',
  },

  linkText: {
    color: COLORS.naranja,
    fontFamily: FONTS.titulo,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },

  errorText: {
    color: COLORS.rojo,
    fontSize: 12,
    fontFamily: FONTS.cuerpo,
    textAlign: 'center',
    marginTop: 10,
  },
});