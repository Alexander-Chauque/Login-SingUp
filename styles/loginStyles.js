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
  },

  // CONTENIDO DESPLAZABLE
  // flexGrow permite que ocupe toda la pantalla aunque el contenido sea más corto
  scrollContent: {
    flexGrow: 1,
  },

  // FORMULARIO
  // Sin fondo, sombra ni bordes redondeados: así se integra a la pantalla y no parece flotar
  card: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    paddingHorizontal: 28,
    zIndex: 1, // Mantiene los textos delante de las imágenes
  },

  // DIBUJOS DE FONDO
  // position absolute los saca del orden normal: el formulario no se corre por ellos
  decoracionHojas: {
    position: "absolute",
    left: 0,
  },

  decoracionEmpanada: {
    position: "absolute",
    right: 0,
  },

  // Empuja las empanadas hacia abajo en pantallas altas
  espacioLibre: {
    flex: 1,
  },

  logo: {
    width: 135,
    height: 133,
    alignSelf: "center",
    marginBottom: 8,
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
    marginBottom: 18,
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
    height: 52,
    paddingHorizontal: 15,
    marginBottom: 12,
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
    marginBottom: 16,
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
    minHeight: 52,
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
    marginTop: 16,
    marginBottom: 4,
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
