import { StyleSheet } from 'react-native';
import { COLORS, FONTS } from './colors';

export const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.blanco,
    padding: 20,
  },

  card: {
    backgroundColor: COLORS.blanco,
    borderRadius: 25,
    padding: 24,
    width: '95%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderTopWidth: 4,
    borderTopColor: COLORS.naranja,
  },

  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    resizeMode: 'contain',
    alignSelf: 'center',
    borderRadius: 40,
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
    textAlign:'left',
  },

  brandName: {
    color: COLORS.naranja,
    fontFamily: FONTS.titulo,
    fontWeight: 'bold',
  },

  colorLine: {
    height: 4,
    width: 100,
    flexDirection: 'row',
    marginBottom: 30,
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

  passwordSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },

  rowOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 30,
  },

  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontFamily: FONTS.titulo,
    color: COLORS.grisOscuro,
    marginRight: 25,
  },

  forgotText: {
    fontSize: 14,
    fontFamily: FONTS.titulo,
    color: COLORS.naranja,
  },

  button: {
    backgroundColor: COLORS.naranja,
    borderRadius: 8,
    height: 50,
    width: '40%',
    alignSelf: 'center',
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
    fontFamily: FONTS.titulo,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 25,
    textDecorationLine: 'underline',
    fontWeight: 3,
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