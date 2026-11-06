import React, { useCallback, useMemo, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import { anularAsistencia, listarAsistencias } from "../src/config/catalogos";
import { obtenerPermisos } from "../src/config/firestore";
import { PERIODOS } from "../src/config/reportes";
import { confirmar, mostrarAviso, normalizar } from "../src/utils/ayudas";
import { COLORS } from "../styles/colors";
import { gestionStyles as g } from "../styles/gestionStyles";
import { BotonIcono, CabeceraTabla, EncabezadoPagina, PanelFiltros } from "./ComponentesSistema";

const COLUMNAS = {
  empleado: { flex: 1 },
  acciones: { width: 76 },
};

// Ejemplo: 2026-11-06 -> 06/11/2026
const fechaVisible = (fecha) => fecha.split("-").reverse().join("/");

export default function ListaAsistencias({ navigation }) {
  const [asistencias, setAsistencias] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [periodo, setPeriodo] = useState("mes");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    try {
      setError("");
      const [lista, permisosUsuario] = await Promise.all([listarAsistencias(periodo), obtenerPermisos()]);
      setAsistencias(lista);
      setPermisos(permisosUsuario);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, [periodo]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  const visibles = useMemo(() => {
    const texto = normalizar(busqueda.trim());
    return asistencias.filter((a) => normalizar(a.empleado_nombre).includes(texto));
  }, [asistencias, busqueda]);

  const anular = (asistencia) => {
    confirmar(
      "Anular asistencia",
      `¿Querés anular la asistencia de ${asistencia.empleado_nombre} del ${fechaVisible(asistencia.fecha)}?`,
      async () => {
        try {
          await anularAsistencia(asistencia);
          cargar();
        } catch (e) {
          mostrarAviso("No se pudo anular", e.message);
        }
      },
    );
  };

  const renderItem = ({ item }) => (
    <View style={g.tablaFila}>
      <View style={COLUMNAS.empleado}>
        <Text style={g.tablaNombre}>{item.empleado_nombre}</Text>
        <Text style={g.tablaDetalle}>{fechaVisible(item.fecha)} · {item.tipo_nombre}</Text>
      </View>
      <View style={[g.tablaAcciones, COLUMNAS.acciones]}>
        {permisos.includes("empleados:modificar") ? (
          <BotonIcono
            icono="edit"
            tipo="editar"
            etiqueta={`Cambiar turno de ${item.empleado_nombre}`}
            onPress={() => navigation.navigate("FormularioAsistencia", { asistencia: item })}
          />
        ) : null}
        {permisos.includes("empleados:eliminar") ? (
          <BotonIcono icono="delete" tipo="baja" etiqueta={`Anular asistencia de ${item.empleado_nombre}`} onPress={() => anular(item)} />
        ) : null}
      </View>
    </View>
  );

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

  if (cargando) {
    return (
      <View style={g.centro}>
        <ActivityIndicator size="large" color={COLORS.naranja} />
      </View>
    );
  }

  return (
    <View style={g.pantalla}>
      <FlatList
        contentContainerStyle={g.contenido}
        data={visibles}
        keyExtractor={(item) => item.id_asistencia}
        renderItem={renderItem}
        refreshing={actualizando}
        onRefresh={() => {
          setActualizando(true);
          cargar();
        }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <EncabezadoPagina icono="event-available" titulo="Asistencias" subtitulo="Registro diario del personal">
              {permisos.includes("empleados:escribir") ? (
                <TouchableOpacity style={g.boton} onPress={() => navigation.navigate("FormularioAsistencia")}>
                  <MaterialIcons name="add" size={18} color={COLORS.blanco} />
                  <Text style={g.botonTexto}>Registrar hoy</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity style={g.botonSecundario} onPress={() => navigation.navigate("ListaCatalogo", { tipo: "tipoAsistencia" })}>
                <MaterialIcons name="schedule" size={18} color="#333333" />
                <Text style={g.botonSecundarioTexto}>Turnos</Text>
              </TouchableOpacity>
            </EncabezadoPagina>

            <PanelFiltros>
              <View style={g.buscador}>
                <Ionicons name="search" size={18} color="#9CA3AF" />
                <TextInput
                  style={g.buscadorInput}
                  placeholder="Buscar empleado..."
                  placeholderTextColor="#9CA3AF"
                  value={busqueda}
                  onChangeText={setBusqueda}
                  autoCorrect={false}
                />
              </View>
              <View style={g.opciones}>
                {PERIODOS.map((opcion) => (
                  <TouchableOpacity
                    key={opcion.valor}
                    style={[g.opcion, periodo === opcion.valor && g.opcionActiva]}
                    onPress={() => {
                      setCargando(true);
                      setPeriodo(opcion.valor);
                    }}
                  >
                    <Text style={[g.opcionTexto, periodo === opcion.valor && g.opcionTextoActivo]}>{opcion.nombre}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </PanelFiltros>

            <Text style={g.tablaTitulo}>Listado de asistencias ({visibles.length})</Text>
            <CabeceraTabla
              columnas={[
                { texto: "Empleado", estilo: COLUMNAS.empleado },
                { texto: "Acciones", estilo: COLUMNAS.acciones },
              ]}
            />
          </View>
        }
        ListEmptyComponent={<Text style={g.tablaVacia}>No hay asistencias en este período.</Text>}
        ListFooterComponent={<View style={g.tablaPie} />}
      />
    </View>
  );
}
