import { StyleSheet } from "react-native";
import { COLORS } from "./colors";

export const ingredientStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.blanco },

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
  },
  // flex: 1 para que la lista ocupe el resto de la pantalla y se pueda desplazar
  contenido: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  lista: {
    flex: 1,
  },
  // Mensajes de error y de lista vacía
  mensajeContenedor: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 40,
    paddingHorizontal: 10,
  },
  mensajeTexto: {
    color: COLORS.grisOscuro,
    fontSize: 14,
    textAlign: "center",
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
    color: "#222222",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "SegoeUI",
    color: COLORS.grisMedio,
    marginTop: 2,
    marginBottom: 10,
  },
  botonNuevo: {
    backgroundColor: COLORS.naranja,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 13,
    elevation: 3,
    shadowColor: "#A95B00",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
  },
  textoBotonNuevo: {
    color: COLORS.blanco,
    fontFamily: "Oswald-Bold",
    marginLeft: 4,
    fontSize: 16,
  },

  // --- BUSCADOR Y FILTROS ---
  busquedaContenedor: {
    flexDirection: "row",
    marginBottom: 16,
  },
  inputBusqueda: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: COLORS.blanco,
    borderRadius: 14,
    minHeight: 52,
    paddingHorizontal: 15,
    alignItems: "center",
    borderWidth: 1.3,
    borderColor: COLORS.bordeClaro,
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
    backgroundColor: COLORS.blanco,
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
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  imagen: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: COLORS.grisClaro,
  },
  imagenVacia: {
    alignItems: "center",
    justifyContent: "center",
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