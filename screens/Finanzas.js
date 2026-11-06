import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { COLORS } from "../styles/colors";
import { gestionStyles as g } from "../styles/gestionStyles";
import { EncabezadoPagina } from "./ComponentesSistema";

const SECCIONES = [
  { titulo: "Caja", texto: "Abrir, arquear y cerrar la caja.", icono: "point-of-sale", destino: ["ListaCajas"] },
  { titulo: "Gastos", texto: "Registrar lo que sale de la caja.", icono: "payments", destino: ["ListaGastos"] },
  {
    titulo: "Categorías de gasto",
    texto: "Agrupan los gastos del restaurante.",
    icono: "category",
    destino: ["ListaCatalogo", { tipo: "categoriaGasto" }],
  },
  {
    titulo: "Métodos de pago",
    texto: "Las formas de pago del restaurante.",
    icono: "credit-card",
    destino: ["ListaCatalogo", { tipo: "metodoPago" }],
  },
];

export default function Finanzas({ navigation }) {
  return (
    <ScrollView style={g.pantalla} contentContainerStyle={g.contenido}>
      <EncabezadoPagina icono="account-balance-wallet" titulo="Finanzas" subtitulo="Caja, gastos y formas de pago" />
      {SECCIONES.map((seccion) => (
        <TouchableOpacity key={seccion.titulo} style={g.tarjeta} onPress={() => navigation.navigate(...seccion.destino)}>
          <View style={g.filaEntre}>
            <View style={[g.fila, { flex: 1 }]}>
              <MaterialIcons name={seccion.icono} size={26} color={COLORS.naranja} />
              <View style={{ flex: 1 }}>
                <Text style={g.nombre}>{seccion.titulo}</Text>
                <Text style={g.textoSuave}>{seccion.texto}</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={COLORS.grisMedio} />
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
