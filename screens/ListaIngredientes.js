import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import {
  cambiarEstadoIngrediente,
  listarIngredientes,
  obtenerPermisos,
} from "../src/config/firestore";
import { COLORS } from "../styles/colors";
import { gestionStyles as g } from "../styles/gestionStyles";
import {
  BotonIcono,
  CabeceraTabla,
  EncabezadoPagina,
  Etiqueta,
  PanelFiltros,
} from "./ComponentesSistema";

// Quita mayúsculas y acentos para que "azucar" también encuentre "Azúcar"
const normalizar = (texto) =>
  (texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

// Muestra el costo con formato argentino. Ejemplo: 1500 -> $ 1.500,00
const formatearCosto = (valor) =>
  `$ ${Number(valor).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;

// Ancho de cada columna. flex: 1 reparte el espacio que sobra.
const COLUMNAS = {
  nombre: { flex: 1 },
  costo: { width: 66 },
  estado: { width: 74 },
  acciones: { width: 64 },
};

export default function ListaIngredientes({ navigation }) {
  const [ingredientes, setIngredientes] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");
  const [filtroActivo, setFiltroActivo] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");

  const cargar = useCallback(async () => {
    try {
      setError("");
      // Promise.all hace los dos pedidos a la vez y espera que terminen ambos
      const [lista, permisosUsuario] = await Promise.all([
        listarIngredientes(),
        obtenerPermisos(),
      ]);
      setIngredientes(lista);
      setPermisos(permisosUsuario);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, []);

  // useFocusEffect recarga la lista cada vez que se vuelve a esta pantalla,
  // por ejemplo, después de guardar en el formulario
  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  const recargarManual = () => {
    setActualizando(true);
    cargar();
  };

  // useMemo recalcula la lista solo cuando cambian estos datos, no en cada dibujo
  const ingredientesFiltrados = useMemo(() => {
    const texto = normalizar(busqueda.trim());
    return ingredientes.filter((ing) => {
      if (filtroActivo === "Disponible" && !ing.estado_ingrediente) return false;
      if (filtroActivo === "No disponible" && ing.estado_ingrediente) return false;
      return normalizar(ing.nombre_ingrediente).includes(texto);
    });
  }, [ingredientes, filtroActivo, busqueda]);

  const puedeCrear = permisos.includes("ingredientes:escribir");
  const puedeEditar = permisos.includes("ingredientes:modificar");

  const cambiarEstado = async (item) => {
    try {
      const actualizado = await cambiarEstadoIngrediente(item);
      // Reemplaza solo el ingrediente que cambió, sin volver a pedir toda la lista
      setIngredientes((lista) =>
        lista.map((ing) =>
          ing.id_ingrediente === actualizado.id_ingrediente ? actualizado : ing,
        ),
      );
    } catch (e) {
      mostrarAviso("Error", e.message);
    }
  };

  const confirmarCambioEstado = (item) => {
    const accion = item.estado_ingrediente ? "desactivar" : "activar";
    const mensaje = `¿Querés ${accion} "${item.nombre_ingrediente}"? También cambiará el estado de los platos que lo usan.`;

    // Alert con botones no funciona en la versión web de Expo
    if (Platform.OS === "web") {
      if (window.confirm(mensaje)) cambiarEstado(item);
      return;
    }
    Alert.alert("Cambiar estado", mensaje, [
      { text: "Cancelar", style: "cancel" },
      { text: "Confirmar", onPress: () => cambiarEstado(item) },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={g.tablaFila}>
      <View style={[COLUMNAS.nombre, g.fila]}>
        {/* La foto está guardada dentro del documento. Sin foto, se muestra un ícono. */}
        {item.imagen_ingrediente ? (
          <Image source={{ uri: item.imagen_ingrediente }} style={g.tablaImagen} />
        ) : (
          <View style={g.tablaImagen}>
            <MaterialIcons name="image" size={20} color={COLORS.naranja} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={g.tablaNombre}>{item.nombre_ingrediente}</Text>
          <Text style={g.tablaDetalle}>{item.unidad_nombre}</Text>
        </View>
      </View>

      <Text style={[g.tablaTexto, COLUMNAS.costo]}>{formatearCosto(item.costo_unitario)}</Text>

      <View style={COLUMNAS.estado}>
        <Etiqueta
          activo={item.estado_ingrediente}
          texto={item.estado_ingrediente ? "Disponible" : "No disponible"}
        />
      </View>

      <View style={[g.tablaAcciones, COLUMNAS.acciones]}>
        {puedeEditar ? (
          <>
            <BotonIcono
              icono="edit"
              tipo="editar"
              etiqueta={`Editar ${item.nombre_ingrediente}`}
              onPress={() => navigation.navigate("FormularioIngrediente", { ingrediente: item })}
            />
            <BotonIcono
              icono={item.estado_ingrediente ? "block" : "check-circle"}
              tipo={item.estado_ingrediente ? "baja" : "reactivar"}
              etiqueta={`Cambiar estado de ${item.nombre_ingrediente}`}
              onPress={() => confirmarCambioEstado(item)}
            />
          </>
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
        <TouchableOpacity style={g.boton} onPress={recargarManual}>
          <Text style={g.botonTexto}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={g.pantalla}>
      <FlatList
        contentContainerStyle={g.contenido}
        data={ingredientesFiltrados}
        keyExtractor={(item) => String(item.id_ingrediente)}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        // Deslizar hacia abajo vuelve a pedir la lista
        refreshing={actualizando}
        onRefresh={recargarManual}
        ListHeaderComponent={
          <View>
            <EncabezadoPagina
              icono="eco"
              titulo="Ingredientes"
              subtitulo="Gestiona los ingredientes del inventario"
            >
              {puedeCrear ? (
                <TouchableOpacity
                  style={g.boton}
                  onPress={() => navigation.navigate("FormularioIngrediente")}
                >
                  <MaterialIcons name="add" size={18} color={COLORS.blanco} />
                  <Text style={g.botonTexto}>Nuevo</Text>
                </TouchableOpacity>
              ) : null}
            </EncabezadoPagina>

            <PanelFiltros>
              <View style={g.buscador}>
                <Ionicons name="search" size={18} color="#9CA3AF" />
                <TextInput
                  placeholder="Buscar ingrediente..."
                  style={g.buscadorInput}
                  placeholderTextColor="#9CA3AF"
                  value={busqueda}
                  onChangeText={setBusqueda}
                  autoCorrect={false}
                />
              </View>
              <View style={g.opciones}>
                {["Todos", "Disponible", "No disponible"].map((filtro) => (
                  <TouchableOpacity
                    key={filtro}
                    style={[g.opcion, filtroActivo === filtro && g.opcionActiva]}
                    onPress={() => setFiltroActivo(filtro)}
                  >
                    <Text style={[g.opcionTexto, filtroActivo === filtro && g.opcionTextoActivo]}>
                      {filtro}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </PanelFiltros>

            <Text style={g.tablaTitulo}>Listado de ingredientes ({ingredientesFiltrados.length})</Text>
            <CabeceraTabla
              columnas={[
                { texto: "Nombre", estilo: COLUMNAS.nombre },
                { texto: "Costo", estilo: COLUMNAS.costo },
                { texto: "Estado", estilo: COLUMNAS.estado },
                { texto: "Acciones", estilo: COLUMNAS.acciones },
              ]}
            />
          </View>
        }
        ListEmptyComponent={
          <Text style={g.tablaVacia}>
            {ingredientes.length
              ? "Ningún ingrediente coincide con la búsqueda."
              : "Todavía no hay ingredientes cargados."}
          </Text>
        }
        ListFooterComponent={<View style={g.tablaPie} />}
      />
    </View>
  );
}

// Alert no muestra nada en la versión web de Expo
function mostrarAviso(titulo, mensaje) {
  if (Platform.OS === "web") {
    window.alert(`${titulo}: ${mensaje}`);
  } else {
    Alert.alert(titulo, mensaje);
  }
}
