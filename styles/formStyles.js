import { StyleSheet } from "react-native";
import { COLORS } from "./colors";

export const formStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Sección de la foto
  fotoContainer: {
    alignItems: "center",
    marginBottom: 25,
    marginTop: 10,
  },
  fotoBoton: {
    width: 120,
    height: 120,
    borderRadius: 15,
    backgroundColor: COLORS.grisClaro,
    borderWidth: 2,
    borderColor: COLORS.bordeClaro,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  fotoImagen: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  fotoTexto: {
    marginTop: 8,
    color: COLORS.grisMedio,
    fontSize: 12,
    fontFamily: "SegoeUI",
    fontWeight: "bold",
  },

  // Campos del formulario
  label: {
    fontSize: 14,
    fontFamily: "Oswald-Bold",
    color: COLORS.grisOscuro,
    marginBottom: 5,
    marginTop: 15,
  },
  input: {
    backgroundColor: COLORS.blanco,
    borderWidth: 1,
    borderColor: COLORS.bordeClaro,
    borderRadius: 10,
    padding: 12,
    color: COLORS.grisOscuro,
    fontSize: 14,
    fontFamily: "SegoeUI",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  col: {
    width: "48%",
  },

  // Switch de estado
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 25,
    padding: 15,
    backgroundColor: COLORS.blanco,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.bordeClaro,
  },
  switchLabel: {
    fontFamily: "Oswald-Bold",
    color: COLORS.grisOscuro,
    fontSize: 14,
  },

  // Botones
  botonesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
  },
  botonCancelar: {
    flex: 1,
    backgroundColor: COLORS.grisClaro,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.bordeClaro,
  },
  textoCancelar: {
    color: COLORS.grisOscuro,
    fontWeight: "bold",
    fontSize: 15,
  },
  botonGuardar: {
    flex: 1,
    backgroundColor: COLORS.naranja,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginLeft: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  textoGuardar: {
    color: COLORS.blanco,
    fontWeight: "bold",
    fontSize: 15,
    marginLeft: 8,
  },
});
