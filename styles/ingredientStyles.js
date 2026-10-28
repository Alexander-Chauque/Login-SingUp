import { StyleSheet } from "react-native";
import { COLORS } from "./colors";

export const ingredientStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#333333",
  },
  logoHeader: {
    width: 120,
    height: 40,
  },
  avatarHeader: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#FFE0B2",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontFamily: "SegoeUI",
    fontWeight: "bold",
    color: COLORS.naranja,
    fontSize: 14,
  },

  // --- TARJETA BLANCA PRINCIPAL ---
  mainCard: {
    flex: 1,
    backgroundColor: COLORS.blanco,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Espacio para el botón flotante
  },

  // --- TÍTULO Y BOTÓN NUEVO ---
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontFamily: "Oswald-Bold", // Usando tu fuente
    color: "#3D3D3D",
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "SegoeUI",
    color: COLORS.grisMedio,
    marginTop: 2,
  },
  botonNuevo: {
    backgroundColor: COLORS.naranja,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  textoBotonNuevo: {
    color: COLORS.blanco,
    fontWeight: "bold",
    marginLeft: 4,
    fontSize: 13,
  },

  // --- BUSCADOR Y FILTROS ---
  busquedaContenedor: {
    flexDirection: "row",
    marginBottom: 16,
  },
  inputBusqueda: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: COLORS.grisClaro,
    borderRadius: 12,
    paddingHorizontal: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.bordeClaro,
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    color: COLORS.grisOscuro,
  },
  botonFiltro: {
    backgroundColor: COLORS.blanco,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.bordeClaro,
  },
  filtrosRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  pildora: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.grisClaro,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.bordeClaro,
  },
  pildoraActiva: {
    backgroundColor: COLORS.naranja,
    borderColor: COLORS.naranja,
  },
  textoPildora: {
    color: COLORS.grisOscuro,
    fontWeight: "600",
    fontSize: 12,
  },
  textoPildoraActiva: {
    color: COLORS.blanco,
  },

  // --- TARJETAS DE INGREDIENTES ---
  tarjeta: {
    flexDirection: "row",
    backgroundColor: COLORS.blanco,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.bordeClaro,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  imagen: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: COLORS.grisClaro,
  },
  infoContenedor: {
    flex: 1,
    justifyContent: "center",
  },
  nombre: {
    fontSize: 16,
    fontFamily: "Oswald-Bold",
    color: COLORS.grisOscuro,
    marginBottom: 2,
  },
  descripcion: {
    fontSize: 12,
    fontFamily: "SegoeUI",
    color: COLORS.grisMedio,
    marginBottom: 6,
  },
  precioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  precio: {
    fontSize: 14,
    fontFamily: "Oswald",
    color: COLORS.grisOscuro,
    marginRight: 8,
  },
  unidadBadge: {
    backgroundColor: COLORS.grisClaro,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.bordeClaro,
  },
  unidadTexto: {
    fontSize: 10,
    color: COLORS.grisMedio,
    fontWeight: "bold",
  },
  estadoBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeDisponible: {
    backgroundColor: "#E8F5E9",
  },
  badgeNoDisponible: {
    backgroundColor: "#FFEBEE",
  },
  estadoTexto: {
    fontSize: 12,
    fontWeight: "bold",
  },
  textoVerde: {
    color: COLORS.verde,
  },
  textoRojo: {
    color: COLORS.rojo,
  },
  acciones: {
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  botonAccion: {
    padding: 4,
  },

  // --- BOTÓN FLOTANTE ---
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: COLORS.naranja,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});