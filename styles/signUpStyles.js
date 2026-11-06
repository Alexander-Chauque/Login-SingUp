import { StyleSheet } from 'react-native';
import { COLORS } from './colors';
import { loginStyles } from './loginStyles';

export const signUpStyles = StyleSheet.create({
  // Mismos estilos que el login: si cambian allá, también cambian acá
  title: loginStyles.title,
  subtitle: loginStyles.subtitle,
  decorativeLines: loginStyles.decorativeLines,
  shortLine: loginStyles.shortLine,
  mainLine: loginStyles.mainLine,
  label: loginStyles.label,
  inputContainer: loginStyles.inputContainer,
  icon: loginStyles.icon,
  input: loginStyles.input,
  errorContainer: loginStyles.errorContainer,
  errorText: loginStyles.errorText,
  checkbox: loginStyles.checkbox,
  checkboxChecked: loginStyles.checkboxChecked,
  button: loginStyles.button,
  buttonText: loginStyles.buttonText,

  // Pinta de naranja "Los Cardones" dentro del título
  brandName: {
    color: COLORS.naranja,
    fontFamily: 'Oswald-Bold',
  },

  instructionText: {
    fontSize: 14,
    fontFamily: 'SegoeUI',
    color: '#444444',
    textAlign: 'center',
    marginBottom: 10,
  },

  // Resalta el borde del campo que se está escribiendo
  inputFocused: {
    borderColor: COLORS.naranja,
    borderWidth: 2,
  },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E7',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },

  infoText: {
    color: COLORS.grisOscuro,
    fontSize: 12,
    fontFamily: 'SegoeUI',
    marginLeft: 8,
    flex: 1,
  },

  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
    width: '100%',
  },

  termsText: {
    fontSize: 14,
    fontFamily: 'SegoeUI',
    color: '#444444',
    flex: 1,
  },

  termsLink: {
    color: COLORS.naranja,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },

  // Lista de requisitos de la contraseña
  requirementsContainer: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },

  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },

  requirementIcon: {
    marginRight: 6,
  },

  requirementText: {
    fontSize: 12,
    fontFamily: 'SegoeUI',
    color: COLORS.grisOscuro,
  },

  signUpText: {
    fontSize: 14,
    fontFamily: 'SegoeUI',
    color: '#555555',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 4,
  },

  linkText: {
    fontWeight: 'bold',
    color: COLORS.naranja,
    textDecorationLine: 'underline',
  },
});
