import React, { useCallback, useMemo, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import { obtenerPermisos } from "../src/config/firestore";
import { eliminarCargo, listarCargos } from "../src/config/personal";
import { confirmar, formatearDinero, mostrarAviso, normalizar } from "../src/utils/ayudas";
import { COLORS } from "../styles/colors";
import { gestionStyles as g } from "../styles/gestionStyles";
import { BotonIcono, CabeceraTabla, EncabezadoPagina } from "./ComponentesSistema";

// Ancho de cada columna. flex: 1 reparte el espacio que sobra.
const COLUMNAS = {
  cargo: { flex: 1 },
  nivel: { width: 38, textAlign: "center" },
  acciones: { width: 98 },
};

export default function ListaCargos({ navigation }) {
  const [cargos, setCargos] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const cargar = useCallback(async () => {
    try {
      setError("");
      const [lista, permisosUsuario] = await Promise.all([listarCargos(), obtenerPermisos()]);
      setCargos(lista);
      setPermisos(permisosUsuario);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, []);

  // Recarga cada vez que se vuelve a esta pantalla
  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  const visibles = useMemo(() => {
    const texto = normalizar(busqueda.trim());
    return cargos.filter((c) => normalizar(c.nombre_cargo).includes(texto));
  }, [cargos, busqueda]);

  const puedeCrear = permisos.includes("cargos:escribir");
  const puedeEditar = permisos.includes("cargos:modificar");
  const puedeEliminar = permisos.includes("cargos:eliminar");

  const eliminar = (cargo) => {
    confirmar("Eliminar cargo", `¿Querés eliminar "${cargo.nombre_cargo}"? No se puede deshacer.`, async () => {
      try {
        await eliminarCargo(cargo.id_cargo);
        setCargos((lista) => lista.filter((c) => c.id_cargo !== cargo.id_cargo));
      } catch (e) {
        mostrarAviso("No se pudo eliminar", e.message);
      }
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={g.tablaFila}
      onPress={() => navigation.navigate("PermisosCargo", { id: item.id_cargo })}
    >
      <View style={COLUMNAS.cargo}>
        <Text style={g.tablaNombre}>{item.nombre_cargo}</Text>
        <Text style={g.tablaDetalle}>{formatearDinero(item.sueldo_cargo)}</Text>
        <Text style={g.tablaDetalle}>
          {item.total_empleados} {item.total_empleados === 1 ? "empleado" : "empleados"} · {item.total_permisos} {item.total_permisos === 1 ? "permiso" : "permisos"}
        </Text>
      </View>
      <Text style={[g.tablaNombre, COLUMNAS.nivel]}>{item.nivel_acceso}</Text>
      <View style={[g.tablaAcciones, COLUMNAS.acciones]}>
        <BotonIcono
          icono="verified-user"
          tipo="detalle"
          etiqueta={`Permisos de ${item.nombre_cargo}`}
          onPress={() => navigation.navigate("PermisosCargo", { id: item.id_cargo })}
        />
        {puedeEditar && item.gestionable ? (
          <BotonIcono
            icono="edit"
            tipo="editar"
            etiqueta={`Editar ${item.nombre_cargo}`}
            onPress={() => navigation.navigate("FormularioCargo", { id: item.id_cargo })}
          />
        ) : null}
        {/* Un cargo con empleados no se puede eliminar */}
        {puedeEliminar && item.gestionable && item.total_empleados === 0 ? (
          <BotonIcono
            icono="delete"
            tipo="baja"
            etiqueta={`Eliminar ${item.nombre_cargo}`}
            onPress={() => eliminar(item)}
          />
        ) : null}
      </View>
    </TouchableOpacity>
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
        keyExtractor={(item) => String(item.id_cargo)}
        renderItem={renderItem}
        refreshing={actualizando}
        onRefresh={() => {
          setActualizando(true);
          cargar();
        }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <EncabezadoPagina icono="work" titulo="Cargos" subtitulo="Puestos, niveles y permisos del personal">
              {puedeCrear ? (
                <TouchableOpacity style={g.boton} onPress={() => navigation.navigate("FormularioCargo")}>
                  <MaterialIcons name="add" size={18} color={COLORS.blanco} />
                  <Text style={g.botonTexto}>Nuevo cargo</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity style={g.botonSecundario} onPress={() => navigation.navigate("ListaPermisos")}>
                <MaterialIcons name="verified-user" size={18} color="#333333" />
                <Text style={g.botonSecundarioTexto}>Ver todos los permisos</Text>
              </TouchableOpacity>
            </EncabezadoPagina>

            <View style={g.buscador}>
              <Ionicons name="search" size={18} color="#9CA3AF" />
              <TextInput
                style={g.buscadorInput}
                placeholder="Buscar cargo..."
                placeholderTextColor="#9CA3AF"
                value={busqueda}
                onChangeText={setBusqueda}
                autoCorrect={false}
              />
            </View>

            <Text style={g.tablaTitulo}>Listado de cargos ({visibles.length})</Text>
            <CabeceraTabla
              columnas={[
                { texto: "Cargo", estilo: COLUMNAS.cargo },
                { texto: "Nivel", estilo: COLUMNAS.nivel },
                { texto: "Acciones", estilo: COLUMNAS.acciones },
              ]}
            />
          </View>
        }
        ListEmptyComponent={<Text style={g.tablaVacia}>No hay cargos para mostrar.</Text>}
        ListFooterComponent={<View style={g.tablaPie} />}
      />
    </View>
  );
}
