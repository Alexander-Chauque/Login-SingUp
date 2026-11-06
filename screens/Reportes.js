import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

import { obtenerPermisos } from "../src/config/firestore";
import { obtenerReportes, PERIODOS } from "../src/config/reportes";
import { formatearDinero, mostrarAviso } from "../src/utils/ayudas";
import { compartirPDF } from "../src/utils/exportar";
import { COLORS } from "../styles/colors";
import { gestionStyles as g } from "../styles/gestionStyles";
import { EncabezadoPagina, PanelFiltros } from "./ComponentesSistema";

const SECCIONES = [
  { valor: "ventas", nombre: "Ventas" },
  { valor: "top", nombre: "Top 5" },
  { valor: "categorias", nombre: "Categorías" },
  { valor: "mozos", nombre: "Mozos" },
  { valor: "metodos", nombre: "Métodos de pago" },
];

// Una opción por cada elemento de la lista, en una fila que se acomoda sola
function Opciones({ lista, activa, alElegir }) {
  return (
    <View style={g.opciones}>
      {lista.map((opcion) => (
        <TouchableOpacity
          key={opcion.valor}
          style={[g.opcion, activa === opcion.valor && g.opcionActiva]}
          onPress={() => alElegir(opcion.valor)}
          accessibilityRole="radio"
          accessibilityState={{ selected: activa === opcion.valor }}
        >
          <Text style={[g.opcionTexto, activa === opcion.valor && g.opcionTextoActivo]}>{opcion.nombre}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// Cada fila muestra el nombre, el valor y una barra proporcional al mayor de la lista
function Barras({ titulo, filas, texto, vacio = "No hay datos en este período." }) {
  const mayor = Math.max(...filas.map((fila) => fila.total), 0);
  return (
    <View style={g.tarjeta}>
      <Text style={[g.seccion, { marginTop: 0 }]}>{titulo}</Text>
      {!filas.length ? <Text style={g.textoSuave}>{vacio}</Text> : null}
      {filas.map((fila) => (
        <View key={fila.nombre} style={{ marginBottom: 10 }}>
          <View style={g.filaEntre}>
            <Text style={[g.texto, { flex: 1 }]}>{fila.nombre}</Text>
            <Text style={[g.texto, { fontWeight: "600" }]}>{texto(fila)}</Text>
          </View>
          <View style={{ height: 8, borderRadius: 4, backgroundColor: COLORS.grisClaro, marginTop: 4 }}>
            <View
              style={{
                height: 8,
                borderRadius: 4,
                backgroundColor: COLORS.naranja,
                width: `${mayor ? (fila.total / mayor) * 100 : 0}%`,
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const fechaCorta = (milisegundos) =>
  new Date(milisegundos).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });

const enPesos = (fila) => formatearDinero(fila.total);

export default function Reportes() {
  const [periodo, setPeriodo] = useState("mes");
  const [seccion, setSeccion] = useState("ventas");
  const [datos, setDatos] = useState(null);
  const [permitido, setPermitido] = useState(true);
  const [error, setError] = useState("");
  const [exportando, setExportando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setError("");
      const permisos = await obtenerPermisos();
      if (!permisos.includes("reportes:leer")) {
        setPermitido(false);
        return;
      }
      setDatos(await obtenerReportes(periodo));
    } catch (e) {
      setError(e.message);
    }
  }, [periodo]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  const exportar = async () => {
    setExportando(true);
    try {
      const filas = (lista, conCantidad) =>
        lista.map((fila) => [fila.nombre, conCantidad ? `${fila.total} u.` : formatearDinero(fila.total)]);
      await compartirPDF("Reportes", `Período: ${PERIODOS.find((p) => p.valor === periodo).nombre}`, [
        {
          titulo: "Resumen de ventas",
          columnas: ["Concepto", "Valor"],
          filas: [
            ["Ventas totales", formatearDinero(datos.ventas.total)],
            ["Comandas cobradas", datos.ventas.cantidad],
            ["Ticket promedio", formatearDinero(datos.ventas.ticket)],
          ],
        },
        {
          titulo: "Ventas por día",
          columnas: ["Día", "Total"],
          filas: datos.ventas.porDia.map((fila) => [fechaCorta(fila.dia), formatearDinero(fila.total)]),
        },
        { titulo: "Platos más vendidos", columnas: ["Plato", "Cantidad"], filas: filas(datos.topPlatos, true) },
        { titulo: "Bebidas más vendidas", columnas: ["Bebida", "Cantidad"], filas: filas(datos.topBebidas, true) },
        { titulo: "Ingresos por categoría", columnas: ["Categoría", "Total"], filas: filas(datos.categorias) },
        {
          titulo: "Ventas por mozo",
          columnas: ["Mozo", "Comandas", "Total"],
          filas: datos.mozos.map((m) => [m.nombre, m.cantidad, formatearDinero(m.total)]),
        },
        { titulo: "Cobrado por método de pago", columnas: ["Método", "Total"], filas: filas(datos.metodos) },
      ]);
    } catch (e) {
      mostrarAviso("No se pudo exportar", e.message);
    } finally {
      setExportando(false);
    }
  };

  if (!permitido) {
    return (
      <View style={g.centro}>
        <MaterialIcons name="lock-outline" size={36} color={COLORS.naranja} />
        <Text style={g.mensaje}>No tenés permiso para ver los reportes.</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={g.centro}>
        <MaterialIcons name="error-outline" size={36} color={COLORS.rojo} />
        <Text style={g.mensaje}>{error}</Text>
        <TouchableOpacity style={g.boton} onPress={cargar}>
          <Text style={g.botonTexto}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={g.pantalla} contentContainerStyle={g.contenido}>
      <EncabezadoPagina icono="bar-chart" titulo="Reportes" subtitulo="Cómo le va al restaurante" />

      <PanelFiltros>
        <Text style={[g.seccion, { marginTop: 0 }]}>Período</Text>
        <Opciones
          lista={PERIODOS}
          activa={periodo}
          alElegir={(valor) => {
            setDatos(null);
            setPeriodo(valor);
          }}
        />
        <Text style={g.seccion}>Reporte</Text>
        <Opciones lista={SECCIONES} activa={seccion} alElegir={setSeccion} />
      </PanelFiltros>

      {!datos ? <ActivityIndicator size="large" color={COLORS.naranja} style={{ marginVertical: 24 }} /> : null}

      {datos && seccion === "ventas" ? (
        <>
          <View style={g.tarjeta}>
            <View style={g.filaEntre}>
              <Text style={g.texto}>Ventas totales</Text>
              <Text style={g.importe}>{formatearDinero(datos.ventas.total)}</Text>
            </View>
            <View style={[g.filaEntre, { marginTop: 6 }]}>
              <Text style={g.textoSuave}>Comandas cobradas</Text>
              <Text style={g.texto}>{datos.ventas.cantidad}</Text>
            </View>
            <View style={[g.filaEntre, { marginTop: 6 }]}>
              <Text style={g.textoSuave}>Ticket promedio</Text>
              <Text style={g.texto}>{formatearDinero(datos.ventas.ticket)}</Text>
            </View>
          </View>
          <Barras
            titulo="Ventas por día"
            filas={datos.ventas.porDia.map((fila) => ({ nombre: fechaCorta(fila.dia), total: fila.total }))}
            texto={enPesos}
          />
        </>
      ) : null}

      {datos && seccion === "top" ? (
        <>
          <Barras titulo="Platos más vendidos" filas={datos.topPlatos} texto={(fila) => `${fila.total} u.`} />
          <Barras titulo="Bebidas más vendidas" filas={datos.topBebidas} texto={(fila) => `${fila.total} u.`} />
        </>
      ) : null}

      {datos && seccion === "categorias" ? (
        <Barras titulo="Ingresos por categoría de plato" filas={datos.categorias} texto={enPesos} />
      ) : null}

      {datos && seccion === "mozos" ? (
        <Barras
          titulo="Ventas por mozo"
          filas={datos.mozos}
          texto={(fila) => `${formatearDinero(fila.total)} · ${fila.cantidad} ${fila.cantidad === 1 ? "comanda" : "comandas"}`}
        />
      ) : null}

      {datos && seccion === "metodos" ? (
        <Barras titulo="Cobrado por método de pago" filas={datos.metodos} texto={enPesos} />
      ) : null}

      {datos ? (
        <TouchableOpacity style={[g.botonSecundario, exportando && g.botonDesactivado]} onPress={exportar} disabled={exportando}>
          <MaterialIcons name="picture-as-pdf" size={18} color="#333333" />
          <Text style={g.botonSecundarioTexto}>{exportando ? "Preparando..." : "Exportar todo a PDF"}</Text>
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );
}
