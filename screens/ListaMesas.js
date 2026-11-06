import React, { useCallback, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

import { eliminarMesa } from "../src/config/catalogos";
import { cambiarEstadoMesa, listarMesas, obtenerPermisos } from "../src/config/firestore";
import { confirmar, mostrarAviso } from "../src/utils/ayudas";
import { COLORS } from "../styles/colors";
import { gestionStyles as g } from "../styles/gestionStyles";
import {
  BotonIcono,
  CabeceraTabla,
  EncabezadoPagina,
  Etiqueta,
  PanelFiltros,
} from "./ComponentesSistema";

// Ancho de cada columna. flex: 1 reparte el espacio que sobra.
const COLUMNAS = {
  numero: { width: 24 },
  ubicacion: { flex: 1 },
  estado: { width: 74 },
  acciones: { width: 98, flexWrap: "wrap" },
};

export default function ListaMesas({ navigation }) {
  const [mesas, setMesas] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState("Todas");

  const cargar = useCallback(async () => {
    try {
      setError("");
      const [lista, permisosUsuario] = await Promise.all([listarMesas(), obtenerPermisos()]);
      setMesas(lista);
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

  const puedeCambiar = permisos.includes("mesas:modificar");
  const puedeCrearComanda = permisos.includes("comandas:escribir");
  const puedeVerComandas = permisos.includes("comandas:leer");

  const cambiarEstado = (mesa) => {
    const accion = mesa.estado_mesa ? "marcar como ocupada" : "liberar";
    confirmar("Cambiar estado", `¿Querés ${accion} la mesa ${mesa.numero_mesa}?`, async () => {
      try {
        const actualizada = await cambiarEstadoMesa(mesa);
        setMesas((lista) => lista.map((m) => (m.id_mesa === actualizada.id_mesa ? actualizada : m)));
      } catch (e) {
        mostrarAviso("No se pudo cambiar", e.message);
      }
    });
  };

  const eliminar = (mesa) => {
    confirmar("Eliminar mesa", `¿Querés eliminar la mesa ${mesa.numero_mesa}? No se puede deshacer.`, async () => {
      try {
        await eliminarMesa(mesa);
        cargar();
      } catch (e) {
        mostrarAviso("No se pudo eliminar", e.message);
      }
    });
  };

  const visibles = mesas.filter(
    (m) =>
      filtro === "Todas" ||
      (filtro === "Disponibles" && m.estado_mesa) ||
      (filtro === "Ocupadas" && !m.estado_mesa),
  );

  const renderItem = ({ item }) => (
    <View style={g.tablaFila}>
      <Text style={[g.tablaNombre, COLUMNAS.numero]}>{item.numero_mesa}</Text>
      <Text style={[g.tablaTexto, COLUMNAS.ubicacion]}>{item.ubicacion_nombre}</Text>
      <View style={COLUMNAS.estado}>
        <Etiqueta activo={item.estado_mesa} texto={item.estado_mesa ? "Disponible" : "Ocupada"} />
      </View>

      <View style={[g.tablaAcciones, COLUMNAS.acciones]}>
        {item.comanda_abierta && puedeVerComandas ? (
          <BotonIcono
            icono="receipt-long"
            tipo="detalle"
            etiqueta={`Ver comanda ${item.comanda_abierta}`}
            onPress={() => navigation.navigate("DetalleComanda", { id: item.comanda_abierta })}
          />
        ) : null}
        {item.estado_mesa && !item.comanda_abierta && puedeCrearComanda ? (
          <BotonIcono
            icono="add"
            tipo="reactivar"
            etiqueta={`Nueva comanda en la mesa ${item.numero_mesa}`}
            onPress={() => navigation.navigate("FormularioComanda", { mesa: item.id_mesa })}
          />
        ) : null}
        {puedeVerComandas ? (
          <BotonIcono
            icono="history"
            tipo="clave"
            etiqueta={`Historial de la mesa ${item.numero_mesa}`}
            onPress={() => navigation.navigate("ComandasMesa", { mesa: item.id_mesa, numero: item.numero_mesa })}
          />
        ) : null}
        {puedeCambiar && !item.comanda_abierta ? (
          <BotonIcono
            icono={item.estado_mesa ? "block" : "check-circle"}
            tipo={item.estado_mesa ? "baja" : "reactivar"}
            etiqueta={item.estado_mesa ? `Ocupar la mesa ${item.numero_mesa}` : `Liberar la mesa ${item.numero_mesa}`}
            onPress={() => cambiarEstado(item)}
          />
        ) : null}
        {puedeCambiar ? (
          <BotonIcono
            icono="edit"
            tipo="editar"
            etiqueta={`Editar la mesa ${item.numero_mesa}`}
            onPress={() => navigation.navigate("FormularioMesa", { id: item.id_mesa })}
          />
        ) : null}
        {permisos.includes("mesas:eliminar") && !item.comanda_abierta ? (
          <BotonIcono
            icono="delete"
            tipo="baja"
            etiqueta={`Eliminar la mesa ${item.numero_mesa}`}
            onPress={() => eliminar(item)}
          />
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

  const ocupadas = mesas.filter((m) => !m.estado_mesa).length;

  return (
    <View style={g.pantalla}>
      <FlatList
        contentContainerStyle={g.contenido}
        data={visibles}
        keyExtractor={(item) => String(item.id_mesa)}
        renderItem={renderItem}
        refreshing={actualizando}
        onRefresh={() => {
          setActualizando(true);
          cargar();
        }}
        ListHeaderComponent={
          <View>
            <EncabezadoPagina
              icono="table-restaurant"
              titulo="Mesas"
              subtitulo={`${ocupadas} de ${mesas.length} ocupadas`}
            >
              {permisos.includes("mesas:escribir") ? (
                <TouchableOpacity style={g.boton} onPress={() => navigation.navigate("FormularioMesa")}>
                  <MaterialIcons name="add" size={18} color={COLORS.blanco} />
                  <Text style={g.botonTexto}>Nueva mesa</Text>
                </TouchableOpacity>
              ) : null}
            </EncabezadoPagina>
            <PanelFiltros>
              <View style={g.opciones}>
                {["Todas", "Disponibles", "Ocupadas"].map((nombre) => (
                  <TouchableOpacity
                    key={nombre}
                    style={[g.opcion, filtro === nombre && g.opcionActiva]}
                    onPress={() => setFiltro(nombre)}
                  >
                    <Text style={[g.opcionTexto, filtro === nombre && g.opcionTextoActivo]}>{nombre}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </PanelFiltros>

            <Text style={g.tablaTitulo}>Listado de mesas ({visibles.length})</Text>
            <CabeceraTabla
              columnas={[
                { texto: "#", estilo: COLUMNAS.numero },
                { texto: "Ubicación", estilo: COLUMNAS.ubicacion },
                { texto: "Estado", estilo: COLUMNAS.estado },
                { texto: "Acciones", estilo: COLUMNAS.acciones },
              ]}
            />
          </View>
        }
        ListEmptyComponent={<Text style={g.tablaVacia}>No hay mesas para mostrar.</Text>}
        ListFooterComponent={<View style={g.tablaPie} />}
      />
    </View>
  );
}
