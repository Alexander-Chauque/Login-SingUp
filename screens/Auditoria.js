import React, { useCallback, useMemo, useState } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import { obtenerPermisos } from "../src/config/firestore";
import { listarAuditoria } from "../src/config/reportes";
import { formatearFecha, mostrarAviso, normalizar } from "../src/utils/ayudas";
import { compartirPDF } from "../src/utils/exportar";
import { COLORS } from "../styles/colors";
import { gestionStyles as g } from "../styles/gestionStyles";
import { EncabezadoPagina, PanelFiltros } from "./ComponentesSistema";

const COLORES_ACCION = {
  CREAR: { fondo: "#D1FAE5", texto: "#065F46" },
  MODIFICAR: { fondo: "#FEF3C7", texto: "#92400E" },
  ANULAR: { fondo: "#FEE2E2", texto: "#991B1B" },
  ELIMINAR: { fondo: "#FEE2E2", texto: "#991B1B" },
};

function Opciones({ lista, activa, alElegir }) {
  return (
    <View style={g.opciones}>
      {lista.map((nombre) => (
        <TouchableOpacity
          key={nombre}
          style={[g.opcion, activa === nombre && g.opcionActiva]}
          onPress={() => alElegir(nombre)}
        >
          <Text style={[g.opcionTexto, activa === nombre && g.opcionTextoActivo]}>{nombre}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// Registro de los cambios del sistema. Solo se puede consultar.
export default function Auditoria() {
  const [registros, setRegistros] = useState([]);
  const [permitido, setPermitido] = useState(true);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [tabla, setTabla] = useState("Todas");
  const [accion, setAccion] = useState("Todas");
  const [exportando, setExportando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setError("");
      const permisos = await obtenerPermisos();
      if (!permisos.includes("auditoria:leer")) {
        setPermitido(false);
        return;
      }
      setRegistros(await listarAuditoria());
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

  const tablas = useMemo(() => ["Todas", ...new Set(registros.map((r) => r.tabla))], [registros]);
  const acciones = useMemo(() => ["Todas", ...new Set(registros.map((r) => r.accion))], [registros]);

  const visibles = useMemo(() => {
    const texto = normalizar(busqueda.trim());
    return registros.filter((r) => {
      if (tabla !== "Todas" && r.tabla !== tabla) return false;
      if (accion !== "Todas" && r.accion !== accion) return false;
      return normalizar(
        `${r.empleado_nombre} ${r.valores_anteriores || ""} ${r.valores_actuales || ""}`,
      ).includes(texto);
    });
  }, [registros, tabla, accion, busqueda]);

  // Exporta lo que está filtrado en pantalla
  const exportar = async () => {
    setExportando(true);
    try {
      await compartirPDF("Auditoría", `${visibles.length} registros`, [
        {
          titulo: "Registro de cambios",
          columnas: ["Fecha", "Usuario", "Tabla", "Acción", "Antes", "Ahora"],
          filas: visibles.map((r) => [
            formatearFecha(r.fecha_hora),
            r.empleado_nombre,
            `${r.tabla} #${r.registro_id}`,
            r.accion,
            r.valores_anteriores,
            r.valores_actuales,
          ]),
        },
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
        <Text style={g.mensaje}>No tenés permiso para ver la auditoría.</Text>
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

  const renderItem = ({ item }) => {
    const colores = COLORES_ACCION[item.accion] || COLORES_ACCION.MODIFICAR;
    return (
      <View style={g.tarjeta}>
        <View style={g.filaEntre}>
          <Text style={[g.nombre, { flex: 1 }]}>{item.tabla} · #{item.registro_id}</Text>
          <View style={[g.etiqueta, { backgroundColor: colores.fondo }]}>
            <Text style={[g.etiquetaTexto, { color: colores.texto }]}>{item.accion}</Text>
          </View>
        </View>
        <Text style={g.textoSuave}>{item.empleado_nombre} · {formatearFecha(item.fecha_hora)}</Text>
        {item.valores_anteriores ? (
          <Text style={[g.textoSuave, { marginTop: 6 }]}>Antes: {item.valores_anteriores}</Text>
        ) : null}
        {item.valores_actuales ? (
          <Text style={[g.texto, { marginTop: 4 }]}>Ahora: {item.valores_actuales}</Text>
        ) : null}
      </View>
    );
  };

  return (
    <View style={g.pantalla}>
      <FlatList
        contentContainerStyle={g.contenido}
        data={visibles}
        keyExtractor={(item) => item.id_log}
        renderItem={renderItem}
        refreshing={actualizando}
        onRefresh={() => {
          setActualizando(true);
          cargar();
        }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <EncabezadoPagina icono="history" titulo="Auditoría" subtitulo="Registro de los cambios del sistema">
              <TouchableOpacity style={[g.botonSecundario, exportando && g.botonDesactivado]} onPress={exportar} disabled={exportando}>
                <MaterialIcons name="picture-as-pdf" size={18} color="#333333" />
                <Text style={g.botonSecundarioTexto}>{exportando ? "Preparando..." : "Exportar a PDF"}</Text>
              </TouchableOpacity>
            </EncabezadoPagina>
            <PanelFiltros>
              <View style={g.buscador}>
                <Ionicons name="search" size={18} color="#9CA3AF" />
                <TextInput
                  style={g.buscadorInput}
                  placeholder="Buscar por usuario o detalle..."
                  placeholderTextColor="#9CA3AF"
                  value={busqueda}
                  onChangeText={setBusqueda}
                  autoCorrect={false}
                />
              </View>
              <Text style={[g.seccion, { marginTop: 0 }]}>Tabla</Text>
              <Opciones lista={tablas} activa={tabla} alElegir={setTabla} />
              <Text style={g.seccion}>Acción</Text>
              <Opciones lista={acciones} activa={accion} alElegir={setAccion} />
            </PanelFiltros>
            <Text style={g.tablaTitulo}>Registros ({visibles.length})</Text>
          </View>
        }
        ListEmptyComponent={<Text style={g.tablaVacia}>No hay registros para mostrar.</Text>}
      />
    </View>
  );
}
