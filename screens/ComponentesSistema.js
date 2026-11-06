import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { COLORS } from "../styles/colors";
import { gestionStyles as g } from "../styles/gestionStyles";

const COLORES_BOTON = {
  detalle: { fondo: "#DBEAFE", icono: "#1E40AF" },
  editar: { fondo: "#FEF3C7", icono: "#92400E" },
  baja: { fondo: "#FEE2E2", icono: "#991B1B" },
  reactivar: { fondo: "#D1FAE5", icono: "#065F46" },
  clave: { fondo: "#F3F4F6", icono: "#4B5563" },
};

// Ícono redondo, título y subtítulo.
export function EncabezadoPagina({ icono, titulo, subtitulo, children }) {
  return (
    <View style={g.encabezado}>
      <View style={g.encabezadoInfo}>
        <View style={g.encabezadoIcono}>
          <MaterialIcons name={icono} size={30} color={COLORS.naranja} />
        </View>
        <View style={g.encabezadoTexto}>
          <Text style={g.titulo}>{titulo}</Text>
          {subtitulo ? <Text style={g.subtitulo}>{subtitulo}</Text> : null}
        </View>
      </View>
      {children}
    </View>
  );
}

export function PanelFiltros({ children }) {
  return (
    <View style={g.filtros}>
      <View style={g.filtrosCabecera}>
        <MaterialIcons name="filter-alt" size={22} color={COLORS.naranja} />
        <Text style={g.filtrosTitulo}>Filtros</Text>
      </View>
      {children}
    </View>
  );
}

// columnas
export function CabeceraTabla({ columnas }) {
  return (
    <View style={g.tablaCabecera}>
      {columnas.map((columna) => (
        <Text key={columna.texto} style={[g.tablaCabeceraTexto, columna.estilo]}>
          {columna.texto}
        </Text>
      ))}
    </View>
  );
}

// Estado Sí/No: verde cuando activo es true y rojo cuando es false
export function Etiqueta({ activo, texto }) {
  return (
    <View style={[g.etiqueta, activo ? g.etiquetaSi : g.etiquetaNo]}>
      <Text style={[g.etiquetaTexto, activo ? g.textoSi : g.textoNo]}>{texto}</Text>
    </View>
  );
}

// tipo: detalle, editar, baja, reactivar o clave
export function BotonIcono({ icono, tipo, etiqueta, onPress }) {
  const colores = COLORES_BOTON[tipo];
  return (
    <TouchableOpacity
      style={[g.botonIconoTabla, { backgroundColor: colores.fondo }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
    >
      <MaterialIcons name={icono} size={18} color={colores.icono} />
    </TouchableOpacity>
  );
}
