import React, { useCallback, useMemo, useState } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import { eliminarGasto, listarGastos, obtenerCajaAbierta } from "../src/config/finanzas";
import { obtenerPermisos } from "../src/config/firestore";
import { confirmar, formatearDinero, formatearFecha, mostrarAviso, normalizar } from "../src/utils/ayudas";
import { COLORS } from "../styles/colors";
import { gestionStyles as g } from "../styles/gestionStyles";
import { BotonIcono, CabeceraTabla, EncabezadoPagina } from "./ComponentesSistema";

const COLUMNAS = {
  gasto: { flex: 1 },
  monto: { width: 86, textAlign: "right" },
  acciones: { width: 76, marginLeft: 6 },
};

export default function ListaGastos({ navigation }) {
  const [gastos, setGastos] = useState([]);
  const [cajaAbierta, setCajaAbierta] = useState(null);
  const [permisos, setPermisos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    try {
      setError("");
      const [lista, caja, permisosUsuario] = await Promise.all([
        listarGastos(),
        obtenerCajaAbierta(),
        obtenerPermisos(),
      ]);
      setGastos(lista);
      setCajaAbierta(caja);
      setPermisos(permisosUsuario);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  const visibles = useMemo(() => {
    const texto = normalizar(busqueda.trim());
    return gastos.filter((gasto) => normalizar(`${gasto.descripcion} ${gasto.categoria_nombre}`).includes(texto));
  }, [gastos, busqueda]);

  const eliminar = (gasto) => {
    confirmar("Eliminar gasto", `¿Querés eliminar "${gasto.descripcion}"? No se puede deshacer.`, async () => {
      try {
        await eliminarGasto(gasto.id_gasto);
        cargar();
      } catch (e) {
        mostrarAviso("No se pudo eliminar", e.message);
      }
    });
  };

  const renderItem = ({ item }) => {
    const editable = cajaAbierta?.id_caja === item.caja;
    return (
      <View style={g.tablaFila}>
        <View style={COLUMNAS.gasto}>
          <Text style={g.tablaNombre}>{item.descripcion}</Text>
          <Text style={g.tablaDetalle}>{item.categoria_nombre} · Caja N.º {item.caja}</Text>
          <Text style={g.tablaDetalle}>{item.empleado_nombre} · {formatearFecha(item.fecha_hora)}</Text>
        </View>
        <Text style={[g.tablaTexto, COLUMNAS.monto]}>{formatearDinero(item.monto)}</Text>
        <View style={[g.tablaAcciones, COLUMNAS.acciones]}>
          {editable && permisos.includes("caja:modificar") ? (
            <BotonIcono
              icono="edit"
              tipo="editar"
              etiqueta={`Editar ${item.descripcion}`}
              onPress={() => navigation.navigate("FormularioGasto", { id: item.id_gasto })}
            />
          ) : null}
          {editable && permisos.includes("caja:eliminar") ? (
            <BotonIcono icono="delete" tipo="baja" etiqueta={`Eliminar ${item.descripcion}`} onPress={() => eliminar(item)} />
          ) : null}
        </View>
      </View>
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
        data={visibles}
        keyExtractor={(item) => item.id_gasto}
        renderItem={renderItem}
        refreshing={actualizando}
        onRefresh={() => {
          setActualizando(true);
          cargar();
        }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <EncabezadoPagina
              icono="payments"
              titulo="Gastos"
              subtitulo={cajaAbierta ? `Caja abierta: N.º ${cajaAbierta.id_caja}` : "No hay una caja abierta"}
            >
              {cajaAbierta && permisos.includes("caja:escribir") ? (
                <TouchableOpacity style={g.boton} onPress={() => navigation.navigate("FormularioGasto")}>
                  <MaterialIcons name="add" size={18} color={COLORS.blanco} />
                  <Text style={g.botonTexto}>Nuevo gasto</Text>
                </TouchableOpacity>
              ) : null}
            </EncabezadoPagina>
            <View style={g.buscador}>
              <Ionicons name="search" size={18} color="#9CA3AF" />
              <TextInput
                style={g.buscadorInput}
                placeholder="Buscar por descripción o categoría..."
                placeholderTextColor="#9CA3AF"
                value={busqueda}
                onChangeText={setBusqueda}
                autoCorrect={false}
              />
            </View>
            <Text style={g.tablaTitulo}>Listado de gastos ({visibles.length})</Text>
            <CabeceraTabla
              columnas={[
                { texto: "Gasto", estilo: COLUMNAS.gasto },
                { texto: "Monto", estilo: COLUMNAS.monto },
                { texto: "Acciones", estilo: COLUMNAS.acciones },
              ]}
            />
          </View>
        }
        ListEmptyComponent={<Text style={g.tablaVacia}>No hay gastos para mostrar.</Text>}
        ListFooterComponent={<View style={g.tablaPie} />}
      />
    </View>
  );
}
