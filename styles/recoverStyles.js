import { StyleSheet } from 'react-native';
import { COLORS } from './colors';
import { loginStyles } from './loginStyles';

export const recoverStyles = StyleSheet.create({
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
  button: loginStyles.button,
  buttonText: loginStyles.buttonText,

  // Resalta el borde del campo que se está escribiendo
  inputFocused: {
    borderColor: COLORS.naranja,
    borderWidth: 2,
  },

  // Mensaje verde cuando el enlace se envió bien
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 12,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    gap: 9,
  },

  successText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'SegoeUI',
    color: COLORS.verde,
  },

  backText: {
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
