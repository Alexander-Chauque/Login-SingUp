import React, { useCallback, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

import { listarCajas } from "../src/config/finanzas";
import { obtenerPermisos } from "../src/config/firestore";
import { PERIODOS } from "../src/config/reportes";
import { formatearDinero, formatearFecha } from "../src/utils/ayudas";
import { COLORS } from "../styles/colors";
import { gestionStyles as g } from "../styles/gestionStyles";
import { CabeceraTabla, EncabezadoPagina, Etiqueta, PanelFiltros } from "./ComponentesSistema";

const COLUMNAS = {
  caja: { flex: 1 },
  saldo: { width: 88, textAlign: "right" },
  estado: { width: 70, marginLeft: 8 },
};

const ESTADOS = [
  { valor: "", nombre: "Todas" },
  { valor: "abierto", nombre: "Abiertas" },
  { valor: "cerrado", nombre: "Cerradas" },
];

export default function ListaCajas({ navigation }) {
  const [cajas, setCajas] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [periodo, setPeriodo] = useState("todo");
  const [estado, setEstado] = useState("");
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    try {
      setError("");
      const [lista, permisosUsuario] = await Promise.all([listarCajas({ periodo, estado }), obtenerPermisos()]);
      setCajas(lista);
      setPermisos(permisosUsuario);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, [periodo, estado]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  const renderItem = ({ item }) => {
    const abierta = item.estado_caja === "abierto";
    return (
      <TouchableOpacity style={g.tablaFila} onPress={() => navigation.navigate("DetalleCaja", { id: item.id_caja })}>
        <View style={COLUMNAS.caja}>
          <Text style={g.tablaNombre}>Caja N.º {item.id_caja}</Text>
          <Text style={g.tablaDetalle}>{item.empleado_apertura_nombre}</Text>
          <Text style={g.tablaDetalle}>{formatearFecha(item.fecha_apertura)}</Text>
        </View>
        <Text style={[g.tablaTexto, COLUMNAS.saldo]}>
          {formatearDinero(abierta ? item.saldo_calculado : item.saldo_final)}
        </Text>
        <View style={COLUMNAS.estado}>
          <Etiqueta activo={abierta} texto={abierta ? "Abierta" : "Cerrada"} />
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

  const elegir = (accion, valor) => {
    setCargando(true);
    accion(valor);
  };

  return (
    <View style={g.pantalla}>
      <FlatList
        contentContainerStyle={g.contenido}
        data={cajas}
        keyExtractor={(item) => item.id_caja}
        renderItem={renderItem}
        refreshing={actualizando}
        onRefresh={() => {
          setActualizando(true);
          cargar();
        }}
        ListHeaderComponent={
          <View>
            <EncabezadoPagina icono="point-of-sale" titulo="Caja" subtitulo="Solo puede haber una caja abierta">
              {permisos.includes("caja:escribir") ? (
                <TouchableOpacity style={g.boton} onPress={() => navigation.navigate("FormularioCaja")}>
                  <MaterialIcons name="lock-open" size={18} color={COLORS.blanco} />
                  <Text style={g.botonTexto}>Abrir caja</Text>
                </TouchableOpacity>
              ) : null}
            </EncabezadoPagina>
            <PanelFiltros>
              <View style={g.opciones}>
                {ESTADOS.map((opcion) => (
                  <TouchableOpacity
                    key={opcion.nombre}
                    style={[g.opcion, estado === opcion.valor && g.opcionActiva]}
                    onPress={() => elegir(setEstado, opcion.valor)}
                  >
                    <Text style={[g.opcionTexto, estado === opcion.valor && g.opcionTextoActivo]}>{opcion.nombre}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={[g.opciones, { marginTop: 8 }]}>
                {PERIODOS.map((opcion) => (
                  <TouchableOpacity
                    key={opcion.valor}
                    style={[g.opcion, periodo === opcion.valor && g.opcionActiva]}
                    onPress={() => elegir(setPeriodo, opcion.valor)}
                  >
                    <Text style={[g.opcionTexto, periodo === opcion.valor && g.opcionTextoActivo]}>{opcion.nombre}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </PanelFiltros>
            <Text style={g.tablaTitulo}>Listado de cajas ({cajas.length})</Text>
            <CabeceraTabla
              columnas={[
                { texto: "Caja", estilo: COLUMNAS.caja },
                { texto: "Saldo", estilo: COLUMNAS.saldo },
                { texto: "Estado", estilo: COLUMNAS.estado },
              ]}
            />
          </View>
        }
        ListEmptyComponent={<Text style={g.tablaVacia}>No hay cajas para mostrar.</Text>}
        ListFooterComponent={<View style={g.tablaPie} />}
      />
    </View>
  );
}
