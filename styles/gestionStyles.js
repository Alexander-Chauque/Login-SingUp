// Estilos compartidos de la app
import { StyleSheet } from "react-native";
import { COLORS } from "./colors";

// Sombra de los paneles: box-shadow 0 2px 12px rgba(0, 0, 0, 0.05) en la web
const sombra = {
  elevation: 2,
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 12,
};

// Forma común de los botones: .btn-primario, .btn-secundario y .btn-danger
const botonBase = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  minHeight: 44,
  paddingHorizontal: 20,
  borderRadius: 8,
};

const textoBoton = {
  fontFamily: "Oswald-Bold",
  fontSize: 13,
  textTransform: "uppercase",
};

export const gestionStyles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORS.grisClaro },
  contenido: { padding: 12, paddingBottom: 32 },
  // Panel blanco que envuelve un formulario, como .tarjeta-formulario-mesa
  contenidoFormulario: {
    margin: 12,
    padding: 16,
    backgroundColor: COLORS.blanco,
    borderRadius: 12,
    ...sombra,
  },
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
    backgroundColor: COLORS.grisClaro,
  },

  // Encabezado de cada página: .page-header
  encabezado: { marginBottom: 14, gap: 12 },
  encabezadoInfo: { flexDirection: "row", alignItems: "center", gap: 14 },
  encabezadoIcono: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFF8E7",
    alignItems: "center",
    justifyContent: "center",
  },
  encabezadoTexto: { flex: 1 },

  // Títulos
  titulo: { fontFamily: "Oswald-Bold", fontSize: 26, color: "#333333" },
  subtitulo: { fontSize: 14, color: COLORS.grisMedioTexto },
  seccion: {
    fontFamily: "Oswald-Bold",
    fontSize: 13,
    color: "#333333",
    textTransform: "uppercase",
    marginTop: 16,
    marginBottom: 8,
  },

  // Tarjetas: .tabla-panel
  tarjeta: {
    padding: 14,
    marginBottom: 12,
    backgroundColor: COLORS.blanco,
    borderRadius: 12,
    ...sombra,
  },
  filaEntre: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  fila: { flexDirection: "row", alignItems: "center", gap: 8 },
  nombre: { flexShrink: 1, fontFamily: "Oswald-Bold", fontSize: 16, color: "#333333" },
  texto: { fontSize: 14, color: "#4A4A4A" },
  textoSuave: { fontSize: 13, color: COLORS.grisMedioTexto },
  importe: { fontFamily: "Oswald-Bold", fontSize: 16, color: "#333333" },

  // Panel de filtros: .filtros-panel
  filtros: {
    padding: 14,
    marginBottom: 14,
    backgroundColor: COLORS.blanco,
    borderRadius: 12,
    ...sombra,
  },
  filtrosCabecera: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingBottom: 10,
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.grisClaro,
  },
  filtrosTitulo: {
    fontFamily: "Oswald-Bold",
    fontSize: 16,
    color: "#333333",
    textTransform: "uppercase",
  },

  // Tablas: .tabla. El tamaño de letra es el de la web en pantallas chicas.
  tablaTitulo: { fontFamily: "Oswald-Bold", fontSize: 18, color: "#333333", marginBottom: 8 },
  tablaCabecera: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: COLORS.grisOscuro,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  tablaCabeceraTexto: {
    fontFamily: "Oswald-Bold",
    fontSize: 12,
    color: COLORS.blanco,
    textTransform: "uppercase",
  },
  tablaFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: COLORS.blanco,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grisClaro,
  },
  tablaTexto: { fontSize: 12, color: "#4A4A4A" },
  tablaNombre: { fontSize: 13, fontWeight: "600", color: "#333333" },
  tablaDetalle: { fontSize: 11, color: COLORS.grisMedioTexto, marginTop: 1 },
  tablaImagen: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#FFF8E7",
    alignItems: "center",
    justifyContent: "center",
  },
  tablaAcciones: { flexDirection: "row", gap: 4 },
  tablaVacia: {
    padding: 28,
    textAlign: "center",
    fontSize: 13,
    fontStyle: "italic",
    color: "#9CA3AF",
    backgroundColor: COLORS.blanco,
  },
  tablaPie: {
    height: 10,
    backgroundColor: COLORS.blanco,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },

  // Botones de ícono: .btn-icon
  botonIconoTabla: {
    width: 30,
    height: 30,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },

  // Etiquetas de estado: .badge
  etiqueta: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  etiquetaTexto: { fontFamily: "Oswald-Bold", fontSize: 11, textTransform: "uppercase", textAlign: "center" },
  etiquetaSi: { backgroundColor: "#D1FAE5" },
  etiquetaNo: { backgroundColor: "#FEE2E2" },
  textoSi: { color: "#065F46" },
  textoNo: { color: "#991B1B" },

  // Opciones seleccionables
  opciones: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  opcion: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: COLORS.blanco,
    borderWidth: 2,
    borderColor: COLORS.bordeClaro,
    borderRadius: 8,
  },
  // Botón de mesa: mismo ancho para todos y fácil de tocar
  opcionMesa: { minWidth: 52, minHeight: 44, alignItems: "center", justifyContent: "center", paddingHorizontal: 6 },
  opcionActiva: { backgroundColor: COLORS.naranja, borderColor: COLORS.naranja },
  opcionTexto: { fontSize: 13, fontWeight: "600", color: "#4A4A4A" },
  opcionTextoActivo: { color: COLORS.blanco },

  // Campos: .input-buscar y .form-control
  buscador: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    paddingHorizontal: 10,
    marginBottom: 12,
    backgroundColor: COLORS.blanco,
    borderWidth: 2,
    borderColor: COLORS.bordeClaro,
    borderRadius: 8,
  },
  buscadorInput: { flex: 1, paddingVertical: 8, paddingHorizontal: 8, fontSize: 13, color: "#2D3748" },
  input: {
    minHeight: 46,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: "#2D3748",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
  },

  // Botones
  boton: { ...botonBase, backgroundColor: COLORS.naranja },
  botonTexto: { ...textoBoton, color: COLORS.blanco },
  botonSecundario: {
    ...botonBase,
    backgroundColor: COLORS.blanco,
    borderWidth: 2,
    borderColor: COLORS.bordeClaro,
  },
  botonSecundarioTexto: { ...textoBoton, color: "#333333" },
  botonPeligro: { ...botonBase, backgroundColor: COLORS.rojo },
  botonPeligroTexto: { ...textoBoton, color: COLORS.blanco },
  botonDesactivado: { opacity: 0.5 },
  botonIcono: { padding: 6 },

  // Mensajes: .alert
  mensaje: { fontSize: 14, color: "#4A4A4A", textAlign: "center" },
  errorCaja: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    marginTop: 12,
    backgroundColor: "#FEE2E2",
    borderLeftWidth: 4,
    borderLeftColor: COLORS.rojo,
    borderRadius: 8,
  },
  errorTexto: { flex: 1, fontSize: 13, color: "#991B1B" },
  avisoCaja: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#FEF3C7",
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
    borderRadius: 8,
  },
  avisoTexto: { flex: 1, fontSize: 13, color: "#92400E" },

  // Productos de la comanda: dos columnas en un recuadro, igual que .grilla-productos
  grillaContenedor: { maxHeight: 400 },
  grillaProductos: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 },
  productoCard: {
    width: "48.5%",
    minHeight: 92,
    flexDirection: "row",
    gap: 4,
    padding: 10,
    backgroundColor: COLORS.blanco,
    borderWidth: 1,
    borderColor: "#EDF2F7",
    borderRadius: 8,
  },
  productoPrecio: { marginTop: 4, fontFamily: "Oswald-Bold", fontSize: 14, color: COLORS.naranjaOscuro },
  productoAgregar: { alignItems: "center", gap: 2 },
  productoCantidad: { fontSize: 13, fontWeight: "bold", color: "#333333" },

  // Carrito de la comanda
  itemCarrito: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grisClaro,
  },
  cantidadBoton: {
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    backgroundColor: COLORS.grisClaro,
    borderWidth: 1,
    borderColor: COLORS.bordeClaro,
    borderRadius: 8,
  },
  cantidadTexto: { minWidth: 28, fontSize: 15, fontWeight: "bold", textAlign: "center", color: "#333333" },
  pie: {
    gap: 10,
    padding: 14,
    backgroundColor: COLORS.blanco,
    borderTopWidth: 1,
    borderTopColor: COLORS.bordeClaro,
  },
});
