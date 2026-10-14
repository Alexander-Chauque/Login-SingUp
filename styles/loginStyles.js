import { StyleSheet } from 'react-native';
import { COLORS, FONTS } from './colors';

export const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#626262',
    padding: 20,
    owerflow: 'hidden'
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },

  card: {
    backgroundColor: COLORS.blanco,
    borderRadius: 24,
    padding: 16,
    width: 300,
    height: 720,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderTopWidth: 8,
    borderTopColor: COLORS.naranja,
  },

  circleTop: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#A77D48',
    top: -80,
    right: -80,
  },
  circleBottom: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#A77D48',
    bottom: -100,
    left: -100,
  },

  logo: {
    width: 100,
    height: 100,
    marginBottom: 15,
    resizeMode: 'contain',
    alignSelf: 'center',
    borderRadius: 43,
  },

  title: {
    fontSize: 26,
    fontFamily: FONTS.titulo,
    color: COLORS.grisOscuro,
    marginBottom: 8,
    textAlign: 'center',
    textTransform: 'uppercase',
    fontWeight: 'bold'
  },

  subtitle: {
    fontSize: 13,
    fontFamily: FONTS.titulo,
    color: COLORS.grisOscuro,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 10,
  },

  brandName: {
    color: COLORS.naranja,
    fontFamily: FONTS.titulo,
    fontWeight: 'bold',
  },

  colorLine: {
    height: 4,
    width: 80,
    backgroundColor: COLORS.naranja,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 25,
  },

  label: {
    alignSelf: 'flex-start',
    fontSize: 14,
    fontFamily: FONTS.titulo,
    fontWeight: 'bold',
    color: COLORS.grisOscuro,
    marginTop: 10,
    marginBottom: 5,
    textTransform: 'uppercase'
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.bordeClaro,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingRight: 15,
    marginBottom: 16,
    width: '100%',
    height: 50,
    backgroundColor: COLORS.blanco,
    alignSelf: 'flex-start',
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
    marginTop: 5,
    marginBottom: 20,
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

  rememberText: {
    fontSize: 14,
    fontFamily: FONTS.cuerpo,
    color: COLORS.grisOscuro,
  },

  button: {
    backgroundColor: COLORS.naranja,
    borderRadius: 10,
    height: 50,
    width: '80%',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },

  buttonText: {
    color: COLORS.blanco,
    fontSize: 16,
    fontFamily: FONTS.titulo,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },

  forgotText: {
    color: COLORS.naranja,
    fontFamily: FONTS.cuerpo,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
    textDecorationLine: 'underline',
  },

  signUpText: {
    marginTop: 10,
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

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    width: '100%',
  },

  errorText: {
    color: COLORS.rojo,
    fontSize: 12,
    fontFamily: FONTS.cuerpo,
    marginLeft: 8,
    flex: 1,
  },
});