// Formulario de ingredientes. Copia .tarjeta-formulario-mesa y .form-control de la web.
import { StyleSheet } from "react-native";
import { COLORS } from "./colors";

export const formStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grisClaro,
  },
  // Panel blanco que envuelve el formulario
  scrollContent: {
    margin: 12,
    padding: 16,
    backgroundColor: COLORS.blanco,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },

  // Sección de la foto
  fotoContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  fotoBoton: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: "#FFF8E7",
    borderWidth: 2,
    borderColor: "#FEEBC8",
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
    color: COLORS.naranjaOscuro,
    fontSize: 13,
    fontFamily: "Oswald-Bold",
  },
  fotoQuitar: {
    marginTop: 8,
    padding: 6,
  },
  fotoQuitarTexto: {
    color: COLORS.rojo,
    fontSize: 13,
    fontWeight: "600",
  },

  // Campos del formulario
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    minHeight: 46,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: "#2D3748",
    fontSize: 14,
  },

  // Selector de unidad de medida
  unidadesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  unidadOpcion: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: COLORS.blanco,
    borderWidth: 2,
    borderColor: COLORS.bordeClaro,
    borderRadius: 8,
  },
  unidadOpcionActiva: {
    backgroundColor: COLORS.naranja,
    borderColor: COLORS.naranja,
  },
  unidadTexto: {
    color: "#4A4A4A",
    fontSize: 13,
    fontWeight: "600",
  },
  unidadTextoActivo: {
    color: COLORS.blanco,
  },

  // Mensaje de error: .alert-error
  errorContenedor: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    padding: 12,
    backgroundColor: "#FEE2E2",
    borderLeftWidth: 4,
    borderLeftColor: COLORS.rojo,
    borderRadius: 8,
  },
  errorTexto: {
    flex: 1,
    color: "#991B1B",
    fontSize: 13,
  },

  // Botones
  botonesRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.grisClaro,
  },
  botonCancelar: {
    flex: 1,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.blanco,
    borderWidth: 2,
    borderColor: COLORS.bordeClaro,
    borderRadius: 8,
  },
  textoCancelar: {
    color: "#333333",
    fontFamily: "Oswald-Bold",
    fontSize: 13,
    textTransform: "uppercase",
  },
  botonGuardar: {
    flex: 1,
    minHeight: 44,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.naranja,
    borderRadius: 8,
  },
  textoGuardar: {
    color: COLORS.blanco,
    fontFamily: "Oswald-Bold",
    fontSize: 13,
    textTransform: "uppercase",
  },
});
