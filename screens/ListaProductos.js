import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import { cambiarEstadoProducto, listarProductos, obtenerPermisos } from "../src/config/firestore";
import { confirmar, formatearDinero, mostrarAviso, normalizar } from "../src/utils/ayudas";
import { COLORS } from "../styles/colors";
import { gestionStyles as g } from "../styles/gestionStyles";
import {
  BotonIcono,
  CabeceraTabla,
  EncabezadoPagina,
  Etiqueta,
  PanelFiltros,
} from "./ComponentesSistema";

// Platos y bebidas se ven igual: esta tabla indica qué cambia entre uno y otro
const CONFIG = {
  plato: {
    titulo: "Platos",
    subtitulo: "Los platos del menú del restaurante",
    icono: "restaurant",
    modulo: "platos",
    campoEstado: "estado_plato",
    formulario: "FormularioPlato",
    id: (x) => x.id_plato,
    nombre: (x) => x.nombre_plato,
    precio: (x) => x.precio_plato,
    grupo: (x) => x.categoria_nombre,
    disponible: (x) => x.estado_plato,
  },
  bebida: {
    titulo: "Bebidas",
    subtitulo: "Las bebidas del restaurante",
    icono: "local-bar",
    modulo: "bebidas",
    campoEstado: "disponible_bebida",
    formulario: "FormularioBebida",
    id: (x) => x.id_bebida,
    nombre: (x) => x.nombre_bebida,
    precio: (x) => x.precio_bebida,
    grupo: (x) => x.tipo_nombre,
    disponible: (x) => x.disponible_bebida,
  },
};

// Ancho de cada columna. flex: 1 reparte el espacio que sobra.
const COLUMNAS = {
  nombre: { flex: 1 },
  precio: { width: 68 },
  estado: { width: 74 },
  acciones: { width: 64 },
};

export default function ListaProductos({ route, navigation }) {
  const tipo = route.params.tipo;
  const config = CONFIG[tipo];

  const [productos, setProductos] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [grupo, setGrupo] = useState("Todos");

  const cargar = useCallback(async () => {
    try {
      setError("");
      const [lista, permisosUsuario] = await Promise.all([listarProductos(tipo), obtenerPermisos()]);
      setProductos(lista);
      setPermisos(permisosUsuario);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, [tipo]);

  // Recarga cada vez que se vuelve a esta pantalla
  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  // Lista de categorías o tipos que existen, sin repetir
  const grupos = useMemo(
    () => ["Todos", ...new Set(productos.map(config.grupo))],
    [productos, config],
  );

  const filtrados = useMemo(() => {
    const texto = normalizar(busqueda.trim());
    return productos.filter(
      (p) =>
        (grupo === "Todos" || config.grupo(p) === grupo) &&
        normalizar(config.nombre(p)).includes(texto),
    );
  }, [productos, busqueda, grupo, config]);

  const puedeCrear = permisos.includes(`${config.modulo}:escribir`);
  const puedeEditar = permisos.includes(`${config.modulo}:modificar`);

  const cambiarEstado = (item) => {
    const accion = config.disponible(item) ? "desactivar" : "activar";
    confirmar("Cambiar estado", `¿Querés ${accion} "${config.nombre(item)}"?`, async () => {
      try {
        const disponible = config.disponible(item);
        await cambiarEstadoProducto(tipo, config.id(item), disponible);
        // Reemplaza solo el producto que cambió, sin volver a pedir toda la lista
        setProductos((lista) =>
          lista.map((p) =>
            config.id(p) === config.id(item) ? { ...p, [config.campoEstado]: !disponible } : p,
          ),
        );
      } catch (e) {
        mostrarAviso("Error", e.message);
      }
    });
  };

  const renderItem = ({ item }) => {
    const disponible = config.disponible(item);
    return (
      <TouchableOpacity
        style={g.tablaFila}
        onPress={() => navigation.navigate("DetalleProducto", { tipo, id: config.id(item) })}
      >
        <View style={COLUMNAS.nombre}>
          <Text style={g.tablaNombre}>{config.nombre(item)}</Text>
          <Text style={g.tablaDetalle}>{config.grupo(item)}</Text>
        </View>
        <Text style={[g.tablaTexto, COLUMNAS.precio]}>{formatearDinero(config.precio(item))}</Text>
        <View style={COLUMNAS.estado}>
          <Etiqueta activo={disponible} texto={disponible ? "Disponible" : "No disponible"} />
        </View>
        <View style={[g.tablaAcciones, COLUMNAS.acciones]}>
          {puedeEditar ? (
            <>
              <BotonIcono
                icono="edit"
                tipo="editar"
                etiqueta={`Editar ${config.nombre(item)}`}
                onPress={() => navigation.navigate(config.formulario, { id: config.id(item) })}
              />
              <BotonIcono
                icono={disponible ? "block" : "check-circle"}
                tipo={disponible ? "baja" : "reactivar"}
                etiqueta={`Cambiar estado de ${config.nombre(item)}`}
                onPress={() => cambiarEstado(item)}
              />
            </>
          ) : null}
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
        data={filtrados}
        keyExtractor={(item) => String(config.id(item))}
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
                <TouchableOpacity style={g.boton} onPress={() => navigation.navigate(config.formulario)}>
                  <MaterialIcons name="add" size={18} color={COLORS.blanco} />
                  <Text style={g.botonTexto}>Nuevo</Text>
                </TouchableOpacity>
              ) : null}
            </EncabezadoPagina>

            <PanelFiltros>
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
              <View style={g.opciones}>
                {grupos.map((nombre) => (
                  <TouchableOpacity
                    key={nombre}
                    style={[g.opcion, grupo === nombre && g.opcionActiva]}
                    onPress={() => setGrupo(nombre)}
                  >
                    <Text style={[g.opcionTexto, grupo === nombre && g.opcionTextoActivo]}>{nombre}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </PanelFiltros>

            <Text style={g.tablaTitulo}>
              Listado de {config.titulo.toLowerCase()} ({filtrados.length})
            </Text>
            <CabeceraTabla
              columnas={[
                { texto: "Nombre", estilo: COLUMNAS.nombre },
                { texto: "Precio", estilo: COLUMNAS.precio },
                { texto: "Estado", estilo: COLUMNAS.estado },
                { texto: "Acciones", estilo: COLUMNAS.acciones },
              ]}
            />
          </View>
        }
        ListEmptyComponent={<Text style={g.tablaVacia}>No hay resultados.</Text>}
        ListFooterComponent={<View style={g.tablaPie} />}
      />
    </View>
  );
}
