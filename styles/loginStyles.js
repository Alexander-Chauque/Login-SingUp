import { StyleSheet } from "react-native";
import { COLORS } from "./colors";

export const loginStyles = StyleSheet.create({
  // PANTALLA
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },

  keyboardContainer: {
    flex: 1,
    width: "100%",
    zIndex: 1,
  },

  // ONDA SUPERIOR: PAISAJE
  topWaveContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 285,
    overflow: "hidden",
    zIndex: 1,
  },

  topWaveSvg: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
  },

  // ONDA INFERIOR: EMPANADAS
  bottomWaveContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 190,
    overflow: "hidden",
    zIndex: 1,
  },

  bottomWaveSvg: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },

  backgroundImage: {
    width: "100%",
    height: "100%",
  },

  // CONTENIDO DESPLAZABLE
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 170,
    paddingBottom: 195,
    paddingHorizontal: 20,
  },

  // FORMULARIO
  card: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",

    // Fondo blanco sólido
    backgroundColor: "#FFFFFF",
    opacity: 1,

    paddingHorizontal: 24,
    paddingTop: 25,
    paddingBottom: 25,

    borderRadius: 28,

    // Sombra suave
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },

  logo: {
    width: 150,
    height: 150,
    alignSelf: "center",
    marginBottom: 12,
  },

  title: {
    fontSize: 30,
    fontFamily: "Oswald-Bold",
    color: "#222222",
    textAlign: "center",
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 16,
    fontFamily: "SegoeUI",
    fontWeight: "bold",
    color: "#666666",
    textAlign: "center",
    marginBottom: 17,
  },

  // PEQUEÑAS LÍNEAS DECORATIVAS
  decorativeLines: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 9,
    marginBottom: 28,
  },

  shortLine: {
    width: 30,
    height: 2,
    backgroundColor: "#E9B66F",
    borderRadius: 5,
  },

  mainLine: {
    width: 48,
    height: 7,
    backgroundColor: COLORS.naranja,
    borderRadius: 5,
  },

  // ETIQUETAS
  label: {
    alignSelf: "flex-start",
    fontSize: 16,
    fontFamily: "Oswald-Bold",
    color: "#222222",
    marginBottom: 8,
    marginTop: 6,
  },

  // CAMPOS
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 58,
    paddingHorizontal: 15,
    marginBottom: 17,
    borderWidth: 1.3,
    borderColor: "#DDDDDD",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
  },

  icon: {
    width: 27,
    marginRight: 13,
    textAlign: "center",
  },

  input: {
    flex: 1,
    height: "100%",
    paddingVertical: 0,
    fontFamily: "SegoeUI",
    fontSize: 15,
    color: "#292929",
    includeFontPadding: false,
  },

  eyeButton: {
    padding: 7,
    marginLeft: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  // RECORDAR / RECUPERAR
  rowOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    rowGap: 12,
    width: "100%",
    marginTop: 2,
    marginBottom: 22,
  },

  rememberBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },

  checkbox: {
    width: 21,
    height: 21,
    borderWidth: 1.8,
    borderColor: "#8A8A8A",
    borderRadius: 5,
    marginRight: 9,
    justifyContent: "center",
    alignItems: "center",
  },

  checkboxChecked: {
    backgroundColor: COLORS.naranja,
    borderColor: COLORS.naranja,
  },

  rememberText: {
    fontSize: 14,
    fontFamily: "SegoeUI",
    color: "#444444",
  },

  forgotText: {
    fontSize: 13,
    fontFamily: "Segoeui-Bold",
    color: COLORS.naranja,
    textDecorationLine: "underline",
  },

  // MENSAJE DE ERROR
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: 12,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    borderColor: "#FFD4D4",
    gap: 9,
  },

  errorText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "SegoeUI",
    color: COLORS.rojo,
  },

  // BOTÓN PRINCIPAL
  button: {
    width: "100%",
    minHeight: 58,
    paddingHorizontal: 12,
    borderRadius: 13,
    backgroundColor: COLORS.naranja,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#A95B00",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    fontFamily: "Oswald-Bold",
    fontSize: 19,
    color: COLORS.blanco,
  },

  // ENLACE DE REGISTRO
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 20,
    marginBottom: 8,
  },

  registerText: {
    fontSize: 14,
    fontFamily: "SegoeUI",
    color: "#555555",
  },

  registerLink: {
    fontSize: 14,
    fontFamily: "SegoeUI-Bold",
    color: COLORS.naranja,
    textDecorationLine: "underline",
  },
});
