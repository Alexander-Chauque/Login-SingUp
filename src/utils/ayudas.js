// Funciones pequeñas que usan varias pantallas
import { Alert, Platform } from "react-native";

// Muestra un importe con formato argentino. Ejemplo: 1500 -> $ 1.500,00
export const formatearDinero = (valor) =>
  `$ ${Number(valor || 0).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// Quita mayúsculas y acentos para que "azucar" también encuentre "Azúcar"
export const normalizar = (texto) =>
  (texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

// Muestra una fecha del servidor con la hora del teléfono. Ejemplo: 04/11/2026 12:30
export const formatearFecha = (fecha) =>
  new Date(fecha).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

// Colores de cada estado de una comanda
export const COLORES_ESTADO = {
  pendiente: { fondo: "#FEF3C7", texto: "#92400E" },
  en_preparacion: { fondo: "#FFEDD5", texto: "#9A3412" },
  entregado: { fondo: "#DBEAFE", texto: "#1E40AF" },
  pagado: { fondo: "#D1FAE5", texto: "#065F46" },
  anulado: { fondo: "#FEE2E2", texto: "#991B1B" },
  cancelado: { fondo: "#FEE2E2", texto: "#991B1B" },
};

// Alert no muestra nada en la versión web de Expo, por eso se usa window
export function mostrarAviso(titulo, mensaje) {
  if (Platform.OS === "web") {
    window.alert(`${titulo}: ${mensaje}`);
  } else {
    Alert.alert(titulo, mensaje);
  }
}

// Pide confirmación y, si la persona acepta, ejecuta alConfirmar
export function confirmar(titulo, mensaje, alConfirmar) {
  if (Platform.OS === "web") {
    if (window.confirm(`${titulo}\n\n${mensaje}`)) alConfirmar();
    return;
  }
  Alert.alert(titulo, mensaje, [
    { text: "Cancelar", style: "cancel" },
    { text: "Confirmar", onPress: alConfirmar },
  ]);
}
