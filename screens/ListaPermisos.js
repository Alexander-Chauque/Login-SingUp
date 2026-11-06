import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import { obtenerPermisos } from "../src/config/firestore";
import { eliminarPermiso, listarPermisos } from "../src/config/personal";
import { confirmar, mostrarAviso, normalizar } from "../src/utils/ayudas";
import { COLORS } from "../styles/colors";
import { gestionStyles as g } from "../styles/gestionStyles";
import { BotonIcono, EncabezadoPagina } from "./ComponentesSistema";

// Todos los permisos del sistema, para crearlos o eliminarlos.
export default function ListaPermisos({ navigation }) {
  const [permisos, setPermisos] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [acciones, setAcciones] = useState([]);
  const [misPermisos, setMisPermisos] = useState([]);
  const [soyAdministrador, setSoyAdministrador] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({ title: "Permisos" });
  }, [navigation]);

  const cargar = useCallback(async () => {
    try {
      setError("");
      const [datos, permisosUsuario] = await Promise.all([listarPermisos(), obtenerPermisos()]);
      setPermisos(datos.permisos);
      setModulos(datos.modulos);
      setAcciones(datos.acciones);
      setSoyAdministrador(datos.es_administrador);
      setMisPermisos(permisosUsuario);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  // Agrupa por módulo los permisos que coinciden con la búsqueda
  const grupos = useMemo(() => {
    const texto = normalizar(busqueda.trim());
    const mapa = new Map();
    permisos
      .filter((p) => normalizar(`${p.modulo_nombre} ${p.accion_nombre}`).includes(texto))
      .forEach((p) => {
        if (!mapa.has(p.modulo_nombre)) mapa.set(p.modulo_nombre, []);
        mapa.get(p.modulo_nombre).push(p);
      });
    return [...mapa.entries()];
  }, [permisos, busqueda]);

  const eliminar = (permiso) => {
    const nombre = `${permiso.modulo_nombre}: ${permiso.accion_nombre}`;
    confirmar(
      "Eliminar permiso",
      `¿Querés eliminar "${nombre}"? Se le quita a todos los cargos que lo tengan y no se puede deshacer.`,
      async () => {
        try {
          await eliminarPermiso(permiso.id_tipo_permiso);
          setPermisos((lista) => lista.filter((p) => p.id_tipo_permiso !== permiso.id_tipo_permiso));
        } catch (e) {
          mostrarAviso("No se pudo eliminar", e.message);
        }
      },
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
    <ScrollView style={g.pantalla} contentContainerStyle={g.contenido} keyboardShouldPersistTaps="handled">
      <EncabezadoPagina icono="verified-user" titulo="Permisos" subtitulo="Acciones que se pueden asignar a los cargos">
        {misPermisos.includes("cargos:escribir") ? (
          <TouchableOpacity
            style={g.boton}
            onPress={() => navigation.navigate("FormularioPermiso", { modulos, acciones, permisos })}
          >
            <MaterialIcons name="add" size={18} color={COLORS.blanco} />
            <Text style={g.botonTexto}>Nuevo permiso</Text>
          </TouchableOpacity>
        ) : null}
      </EncabezadoPagina>

      <View style={g.buscador}>
        <Ionicons name="search" size={18} color="#9CA3AF" />
        <TextInput
          style={g.buscadorInput}
          placeholder="Buscar por módulo o acción..."
          placeholderTextColor="#9CA3AF"
          value={busqueda}
          onChangeText={setBusqueda}
          autoCorrect={false}
        />
      </View>

      {grupos.map(([modulo, lista]) => (
        <View key={modulo} style={g.tarjeta}>
          <Text style={[g.seccion, { marginTop: 0 }]}>{modulo}</Text>
          {lista.map((permiso) => (
            <View key={permiso.id_tipo_permiso} style={[g.filaEntre, { paddingVertical: 5 }]}>
              <Text style={g.texto}>{permiso.accion_nombre}</Text>
              {/* Eliminar se lo quita a todos los cargos: solo se le permite al administrador */}
              {soyAdministrador && misPermisos.includes("cargos:eliminar") ? (
                <BotonIcono
                  icono="delete"
                  tipo="baja"
                  etiqueta={`Eliminar ${modulo}: ${permiso.accion_nombre}`}
                  onPress={() => eliminar(permiso)}
                />
              ) : null}
            </View>
          ))}
        </View>
      ))}
      {!grupos.length ? <Text style={g.mensaje}>No hay permisos para mostrar.</Text> : null}
    </ScrollView>
  );
}
