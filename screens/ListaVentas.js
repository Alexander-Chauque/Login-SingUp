import React, { useCallback, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

import { obtenerPermisos } from "../src/config/firestore";
import { listarVentas, PERIODOS } from "../src/config/reportes";
import { formatearDinero, formatearFecha } from "../src/utils/ayudas";
import { COLORS } from "../styles/colors";
import { gestionStyles as g } from "../styles/gestionStyles";
import { CabeceraTabla, EncabezadoPagina, PanelFiltros } from "./ComponentesSistema";

const COLUMNAS = {
  comanda: { flex: 1 },
  total: { width: 92, textAlign: "right" },
};

// Las comandas ya cobradas, por período
export default function ListaVentas({ navigation }) {
  const [periodo, setPeriodo] = useState("mes");
  const [datos, setDatos] = useState(null);
  const [permitido, setPermitido] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    try {
      setError("");
      const permisos = await obtenerPermisos();
      if (!permisos.includes("ventas:leer")) {
        setPermitido(false);
        return;
      }
      setDatos(await listarVentas(periodo));
    } catch (e) {
      setError(e.message);
    } finally {
      setActualizando(false);
    }
  }, [periodo]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  const cambiarPeriodo = (valor) => {
    setDatos(null);
    setPeriodo(valor);
  };

  if (!permitido) {
    return (
      <View style={g.centro}>
        <MaterialIcons name="lock-outline" size={36} color={COLORS.naranja} />
        <Text style={g.mensaje}>No tenés permiso para ver las ventas.</Text>
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

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={g.tablaFila}
      onPress={() => navigation.navigate("DetalleComanda", { id: item.id_comanda })}
    >
      <View style={COLUMNAS.comanda}>
        <Text style={g.tablaNombre}>#{item.id_comanda} · Mesa {item.mesa_numero}</Text>
        <Text style={g.tablaDetalle}>{item.mozo}</Text>
        <Text style={g.tablaDetalle}>{formatearFecha(item.fecha_hora)}</Text>
      </View>
      <Text style={[g.tablaTexto, COLUMNAS.total]}>{formatearDinero(item.total_comanda)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={g.pantalla}>
      <FlatList
        contentContainerStyle={g.contenido}
        data={datos?.comandas || []}
        keyExtractor={(item) => String(item.id_comanda)}
        renderItem={renderItem}
        refreshing={actualizando}
        onRefresh={() => {
          setActualizando(true);
          cargar();
        }}
        ListHeaderComponent={
          <View>
            <EncabezadoPagina icono="point-of-sale" titulo="Ventas" subtitulo="Comandas cobradas del restaurante" />
            <PanelFiltros>
              <View style={g.opciones}>
                {PERIODOS.map((opcion) => (
                  <TouchableOpacity
                    key={opcion.valor}
                    style={[g.opcion, periodo === opcion.valor && g.opcionActiva]}
                    onPress={() => cambiarPeriodo(opcion.valor)}
                  >
                    <Text style={[g.opcionTexto, periodo === opcion.valor && g.opcionTextoActivo]}>{opcion.nombre}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </PanelFiltros>

            {datos ? (
              <View style={g.tarjeta}>
                <View style={g.filaEntre}>
                  <Text style={g.texto}>Total vendido</Text>
                  <Text style={g.importe}>{formatearDinero(datos.total)}</Text>
                </View>
                <View style={[g.filaEntre, { marginTop: 6 }]}>
                  <Text style={g.textoSuave}>Comandas cobradas</Text>
                  <Text style={g.texto}>{datos.cantidad}</Text>
                </View>
              </View>
            ) : (
              <ActivityIndicator size="large" color={COLORS.naranja} style={{ marginVertical: 24 }} />
            )}

            <CabeceraTabla
              columnas={[
                { texto: "Comanda", estilo: COLUMNAS.comanda },
                { texto: "Total", estilo: COLUMNAS.total },
              ]}
            />
          </View>
        }
        ListEmptyComponent={datos ? <Text style={g.tablaVacia}>No hay ventas en este período.</Text> : null}
        ListFooterComponent={<View style={g.tablaPie} />}
      />
    </View>
  );
}
