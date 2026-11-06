import React, { useCallback, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

import { listarComandas, obtenerPermisos } from "../src/config/firestore";
import { COLORES_ESTADO, formatearDinero, formatearFecha } from "../src/utils/ayudas";
import { COLORS } from "../styles/colors";
import { gestionStyles as g } from "../styles/gestionStyles";
import { CabeceraTabla, EncabezadoPagina, PanelFiltros } from "./ComponentesSistema";

// Ancho de cada columna. flex: 1 reparte el espacio que sobra.
const COLUMNAS = {
  comanda: { flex: 1 },
  total: { width: 74 },
  estado: { width: 84 },
};

// Se usa en la pestaña Comandas y también para el historial de una mesa (route.params.mesa)
export default function ListaComandas({ route, navigation }) {
  const mesa = route.params?.mesa;
  const numeroMesa = route.params?.numero;

  const [comandas, setComandas] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");
  // En el historial de una mesa se muestran todas. En la pestaña, primero las abiertas.
  const [soloAbiertas, setSoloAbiertas] = useState(!mesa);

  const cargar = useCallback(async () => {
    try {
      setError("");
      const [lista, permisosUsuario] = await Promise.all([
        listarComandas({ mesa, soloAbiertas }),
        obtenerPermisos(),
      ]);
      setComandas(lista);
      setPermisos(permisosUsuario);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, [mesa, soloAbiertas]);

  // También se vuelve a ejecutar al cambiar el filtro, porque cambia cargar
  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  const renderItem = ({ item }) => {
    const colores = COLORES_ESTADO[item.estado_comanda] || COLORES_ESTADO.pendiente;
    const tieneSaldoParcial =
      item.esta_abierta && Number(item.total_pagado) > 0 && Number(item.saldo_pendiente) > 0;
    return (
      <TouchableOpacity
        style={g.tablaFila}
        onPress={() => navigation.navigate("DetalleComanda", { id: item.id_comanda })}
      >
        <View style={COLUMNAS.comanda}>
          <Text style={g.tablaNombre}>#{item.id_comanda} · Mesa {item.mesa_numero}</Text>
          <Text style={g.tablaDetalle}>{item.mozo}</Text>
          <Text style={g.tablaDetalle}>{formatearFecha(item.fecha_hora)}</Text>
        </View>
        <View style={COLUMNAS.total}>
          <Text style={g.tablaTexto}>{formatearDinero(item.total_comanda)}</Text>
          {tieneSaldoParcial ? (
            <Text style={g.tablaDetalle}>Saldo: {formatearDinero(item.saldo_pendiente)}</Text>
          ) : null}
        </View>
        <View style={COLUMNAS.estado}>
          <View style={[g.etiqueta, { backgroundColor: colores.fondo }]}>
            <Text style={[g.etiquetaTexto, { color: colores.texto }]}>{item.estado_nombre}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (cargando) {
    return (
      <View style={g.centro}>
        <ActivityIndicator size="large" color={COLORS.naranja} />
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
    <View style={g.pantalla}>
      <FlatList
        contentContainerStyle={g.contenido}
        data={comandas}
        keyExtractor={(item) => String(item.id_comanda)}
        renderItem={renderItem}
        refreshing={actualizando}
        onRefresh={() => {
          setActualizando(true);
          cargar();
        }}
        ListHeaderComponent={
          <View>
            <EncabezadoPagina
              icono="receipt-long"
              titulo={mesa ? `Mesa ${numeroMesa}` : "Comandas"}
              subtitulo={mesa ? "Comandas de esta mesa" : "Pedidos del restaurante"}
            >
              {!mesa && permisos.includes("comandas:escribir") ? (
                <TouchableOpacity style={g.boton} onPress={() => navigation.navigate("FormularioComanda")}>
                  <MaterialIcons name="add" size={18} color={COLORS.blanco} />
                  <Text style={g.botonTexto}>Nueva</Text>
                </TouchableOpacity>
              ) : null}
            </EncabezadoPagina>

            <PanelFiltros>
              <View style={g.opciones}>
                {[
                  { nombre: "Abiertas", valor: true },
                  { nombre: "Últimas 100", valor: false },
                ].map((opcion) => (
                  <TouchableOpacity
                    key={opcion.nombre}
                    style={[g.opcion, soloAbiertas === opcion.valor && g.opcionActiva]}
                    onPress={() => {
                      if (soloAbiertas === opcion.valor) return;
                      setCargando(true);
                      setSoloAbiertas(opcion.valor);
                    }}
                  >
                    <Text style={[g.opcionTexto, soloAbiertas === opcion.valor && g.opcionTextoActivo]}>
                      {opcion.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </PanelFiltros>

            <Text style={g.tablaTitulo}>Listado de comandas ({comandas.length})</Text>
            <CabeceraTabla
              columnas={[
                { texto: "Comanda", estilo: COLUMNAS.comanda },
                { texto: "Total", estilo: COLUMNAS.total },
                { texto: "Estado", estilo: COLUMNAS.estado },
              ]}
            />
          </View>
        }
        ListEmptyComponent={<Text style={g.tablaVacia}>No hay comandas para mostrar.</Text>}
        ListFooterComponent={<View style={g.tablaPie} />}
      />
    </View>
  );
}
