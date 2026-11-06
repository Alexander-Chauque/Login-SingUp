import React, { useEffect, useLayoutEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { obtenerComanda } from "../src/config/firestore";
import { formatearDinero, formatearFecha, mostrarAviso } from "../src/utils/ayudas";
import { compartirPDF } from "../src/utils/exportar";
import { COLORS } from "../styles/colors";
import { gestionStyles as g } from "../styles/gestionStyles";

// Ticket de cocina o comprobante de pago. route.params: { id, tipo: "ticket" | "comprobante" }
export default function ComprobanteComanda({ route, navigation }) {
  const { id, tipo } = route.params;
  const esTicket = tipo === "ticket";
  const titulo = esTicket ? "Ticket" : "Comprobante";
  const [comanda, setComanda] = useState(null);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: `${titulo} #${id}` });
  }, [titulo, id, navigation]);

  useEffect(() => {
    obtenerComanda(id).then(setComanda).catch((e) => setError(e.message));
  }, [id]);

  const compartir = async () => {
    setEnviando(true);
    try {
      const secciones = [
        {
          titulo: "Productos",
          columnas: esTicket ? ["Cantidad", "Producto"] : ["Cantidad", "Producto", "Importe"],
          filas: comanda.items.map((item) =>
            esTicket
              ? [item.cantidad, item.nombre]
              : [item.cantidad, item.nombre, formatearDinero(item.precio * item.cantidad)],
          ),
        },
      ];
      if (!esTicket) {
        secciones.push({
          titulo: "Totales",
          columnas: ["Concepto", "Importe"],
          filas: [
            ["Total", formatearDinero(comanda.total_comanda)],
            ["Abonado", formatearDinero(comanda.total_pagado)],
            ["Saldo", formatearDinero(comanda.saldo_pendiente)],
          ],
        });
      }
      const observacion = comanda.observaciones_comanda ? ` · Obs.: ${comanda.observaciones_comanda}` : "";
      await compartirPDF(
        `${titulo} #${comanda.id_comanda}`,
        `Mesa ${comanda.mesa_numero} · ${comanda.mozo} · ${formatearFecha(comanda.fecha_hora)}${observacion}`,
        secciones,
      );
    } catch (e) {
      mostrarAviso("No se pudo compartir", e.message);
    } finally {
      setEnviando(false);
    }
  };

  if (error) {
    return (
      <View style={g.centro}>
        <MaterialIcons name="error-outline" size={36} color={COLORS.rojo} />
        <Text style={g.mensaje}>{error}</Text>
      </View>
    );
  }

  if (!comanda) {
    return (
      <View style={g.centro}>
        <ActivityIndicator size="large" color={COLORS.naranja} />
      </View>
    );
  }

  return (
    <ScrollView style={g.pantalla} contentContainerStyle={g.contenido}>
      <View style={g.tarjeta}>
        <Text style={[g.titulo, { textAlign: "center" }]}>Los Cardones</Text>
        <Text style={[g.textoSuave, { textAlign: "center" }]}>{titulo} · Comanda #{comanda.id_comanda}</Text>
        <Text style={[g.texto, { marginTop: 10 }]}>Mesa {comanda.mesa_numero}</Text>
        <Text style={g.textoSuave}>{comanda.mozo} · {formatearFecha(comanda.fecha_hora)}</Text>

        <Text style={g.seccion}>Productos</Text>
        {comanda.items.map((item) => (
          <View key={`${item.tipo}-${item.id}`} style={[g.filaEntre, { paddingVertical: 3 }]}>
            <Text style={[g.texto, { flex: 1 }]}>{item.cantidad} x {item.nombre}</Text>
            {!esTicket ? <Text style={g.texto}>{formatearDinero(item.precio * item.cantidad)}</Text> : null}
          </View>
        ))}

        {comanda.observaciones_comanda ? (
          <Text style={[g.texto, { marginTop: 10 }]}>Observaciones: {comanda.observaciones_comanda}</Text>
        ) : null}

        {!esTicket ? (
          <View style={{ marginTop: 10 }}>
            <View style={g.filaEntre}>
              <Text style={g.nombre}>Total</Text>
              <Text style={g.importe}>{formatearDinero(comanda.total_comanda)}</Text>
            </View>
            {comanda.pagos.map((pago) => (
              <View key={pago.id_pago} style={g.filaEntre}>
                <Text style={g.textoSuave}>{pago.metodo}</Text>
                <Text style={g.textoSuave}>{formatearDinero(pago.monto)}</Text>
              </View>
            ))}
            <View style={g.filaEntre}>
              <Text style={g.texto}>Saldo</Text>
              <Text style={g.texto}>{formatearDinero(comanda.saldo_pendiente)}</Text>
            </View>
          </View>
        ) : null}
      </View>

      <TouchableOpacity style={[g.boton, enviando && g.botonDesactivado]} onPress={compartir} disabled={enviando}>
        <MaterialIcons name="share" size={18} color={COLORS.blanco} />
        <Text style={g.botonTexto}>{enviando ? "Preparando..." : "Compartir PDF"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
