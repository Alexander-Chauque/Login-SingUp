import React, { useCallback, useMemo, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import {
  CATALOGOS,
  cambiarEstadoCatalogo,
  eliminarElementoCatalogo,
  listarCatalogo,
} from "../src/config/catalogos";
import { obtenerPermisos } from "../src/config/firestore";
import { confirmar, mostrarAviso, normalizar } from "../src/utils/ayudas";
import { COLORS } from "../styles/colors";
import { gestionStyles as g } from "../styles/gestionStyles";
import { BotonIcono, CabeceraTabla, EncabezadoPagina, Etiqueta } from "./ComponentesSistema";

const COLUMNAS = {
  nombre: { flex: 1 },
  estado: { width: 66 },
  acciones: { width: 98, flexWrap: "wrap" },
};

// Lista de categorías, tipos de bebida o turnos. route.params.tipo indica cuál.
export default function ListaCatalogo({ route, navigation }) {
  const { tipo } = route.params;
  const config = CATALOGOS[tipo];
  const conEstado = !!config.campoEstado;

  const [elementos, setElementos] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const cargar = useCallback(async () => {
    try {
      setError("");
      const [lista, permisosUsuario] = await Promise.all([listarCatalogo(tipo), obtenerPermisos()]);
      setElementos(lista);
      setPermisos(permisosUsuario);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, [tipo]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  const visibles = useMemo(() => {
    const texto = normalizar(busqueda.trim());
    return elementos.filter((e) => normalizar(e.nombre).includes(texto));
  }, [elementos, busqueda]);

  const puedeCrear = permisos.includes(`${config.modulo}:escribir`);
  const puedeEditar = permisos.includes(`${config.modulo}:modificar`);
  const puedeEliminar = permisos.includes(`${config.modulo}:eliminar`);

  const cambiarEstado = (elemento) => {
    const accion = elemento.activo ? "desactivar" : "activar";
    confirmar("Cambiar estado", `¿Querés ${accion} "${elemento.nombre}"?`, async () => {
      try {
        await cambiarEstadoCatalogo(tipo, elemento);
        cargar();
      } catch (e) {
        mostrarAviso("No se pudo cambiar", e.message);
      }
    });
  };

  const eliminar = (elemento) => {
    confirmar("Eliminar", `¿Querés eliminar "${elemento.nombre}"? No se puede deshacer.`, async () => {
      try {
        await eliminarElementoCatalogo(tipo, elemento);
        cargar();
      } catch (e) {
        mostrarAviso("No se pudo eliminar", e.message);
      }
    });
  };

  const renderItem = ({ item }) => (
    <View style={g.tablaFila}>
      <View style={COLUMNAS.nombre}>
        <Text style={g.tablaNombre}>{item.nombre}</Text>
        {item.descripcion ? <Text style={g.tablaDetalle}>{item.descripcion}</Text> : null}
      </View>
      {conEstado ? (
        <View style={COLUMNAS.estado}>
          <Etiqueta activo={item.activo} texto={item.activo ? "Activo" : "Inactivo"} />
        </View>
      ) : null}
      <View style={[g.tablaAcciones, COLUMNAS.acciones]}>
        {puedeEditar ? (
          <BotonIcono
            icono="edit"
            tipo="editar"
            etiqueta={`Editar ${item.nombre}`}
            onPress={() => navigation.navigate("FormularioCatalogo", { tipo, id: item.id })}
          />
        ) : null}
        {puedeEditar && conEstado ? (
          <BotonIcono
            icono={item.activo ? "block" : "check-circle"}
            tipo={item.activo ? "baja" : "reactivar"}
            etiqueta={`Cambiar estado de ${item.nombre}`}
            onPress={() => cambiarEstado(item)}
          />
        ) : null}
        {puedeEliminar ? (
          <BotonIcono icono="delete" tipo="baja" etiqueta={`Eliminar ${item.nombre}`} onPress={() => eliminar(item)} />
        ) : null}
      </View>
    </View>
  );

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
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        refreshing={actualizando}
        onRefresh={() => {
          setActualizando(true);
          cargar();
        }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <EncabezadoPagina icono={config.icono} titulo={config.titulo} subtitulo={config.subtitulo}>
              {puedeCrear ? (
                <TouchableOpacity style={g.boton} onPress={() => navigation.navigate("FormularioCatalogo", { tipo })}>
                  <MaterialIcons name="add" size={18} color={COLORS.blanco} />
                  <Text style={g.botonTexto}>Nuevo</Text>
                </TouchableOpacity>
              ) : null}
            </EncabezadoPagina>
            <View style={g.buscador}>
              <Ionicons name="search" size={18} color="#9CA3AF" />
              <TextInput
                style={g.buscadorInput}
                placeholder="Buscar..."
                placeholderTextColor="#9CA3AF"
                value={busqueda}
                onChangeText={setBusqueda}
                autoCorrect={false}
              />
            </View>
            <Text style={g.tablaTitulo}>Listado ({visibles.length})</Text>
            <CabeceraTabla
              columnas={[
                { texto: "Nombre", estilo: COLUMNAS.nombre },
                ...(conEstado ? [{ texto: "Estado", estilo: COLUMNAS.estado }] : []),
                { texto: "Acciones", estilo: { width: COLUMNAS.acciones.width } },
              ]}
            />
          </View>
        }
        ListEmptyComponent={<Text style={g.tablaVacia}>No hay nada para mostrar.</Text>}
        ListFooterComponent={<View style={g.tablaPie} />}
      />
    </View>
  );
}
