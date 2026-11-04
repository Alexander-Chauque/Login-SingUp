
import { StyleSheet } from "react-native";
import { COLORS } from "./colors";

export const detalleStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Fotografía
  fotoContainer: {
    alignItems: "center",
    marginBottom: 25,
    marginTop: 10,
  },

  fotoImagen: {
    width: 150,
    height: 150,
    borderRadius: 15,
    resizeMode: "cover",
  },

  fotoVacia: {
    width: 150,
    height: 150,
    borderRadius: 15,
    backgroundColor: COLORS.grisClaro,
    borderWidth: 2,
    borderColor: COLORS.bordeClaro,
    justifyContent: "center",
    alignItems: "center",
  },

  fotoTexto: {
    marginTop: 8,
    color: COLORS.grisMedio,
    fontSize: 12,
    fontFamily: "SegoeUI",
  },

  // Etiquetas
  label: {
    fontSize: 14,
    fontFamily: "Oswald-Bold",
    color: COLORS.grisOscuro,
    marginBottom: 5,
    marginTop: 15,
  },

  // Campos de información
  campo: {
    backgroundColor: COLORS.blanco,
    borderWidth: 1,
    borderColor: COLORS.bordeClaro,
    borderRadius: 10,
    padding: 12,
    minHeight: 45,
    justifyContent: "center",
  },

  valor: {
    color: COLORS.grisOscuro,
    fontSize: 14,
    fontFamily: "SegoeUI",
  },

  descripcionCampo: {
    minHeight: 90,
    justifyContent: "flex-start",
  },

  // Distribución de campos
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  col: {
    width: "48%",
  },

  // Estado del ingrediente
  estadoRow: {
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

  estadoTexto: {
    fontFamily: "Oswald-Bold",
    fontSize: 14,
  },

  // Botón volver
  botonVolver: {
    backgroundColor: COLORS.naranja,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    flexDirection: "row",
  },

  textoBoton: {
    color: COLORS.blanco,
    fontWeight: "bold",
    fontSize: 15,
    marginLeft: 8,
  },
});
