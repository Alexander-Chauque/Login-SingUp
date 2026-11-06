import React, { useCallback, useMemo, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import { obtenerPermisos } from "../src/config/firestore";
import { cambiarEstadoEmpleado, listarEmpleados } from "../src/config/personal";
import { confirmar, mostrarAviso, normalizar } from "../src/utils/ayudas";
import { COLORS } from "../styles/colors";
import { gestionStyles as g } from "../styles/gestionStyles";
import { BotonIcono, CabeceraTabla, EncabezadoPagina, Etiqueta, PanelFiltros } from "./ComponentesSistema";

// Ancho de cada columna. flex: 1 reparte el espacio que sobra.
const COLUMNAS = {
  empleado: { flex: 1 },
  estado: { width: 66 },
  acciones: { width: 98 },
};

export default function ListaEmpleados({ navigation }) {
  const [empleados, setEmpleados] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [filtroCargo, setFiltroCargo] = useState("Todos");

  const cargar = useCallback(async () => {
    try {
      setError("");
      const [lista, permisosUsuario] = await Promise.all([listarEmpleados(), obtenerPermisos()]);
      setEmpleados(lista);
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

  // Los cargos que tienen los empleados, sin repetir
  const cargos = useMemo(
    () => ["Todos", ...new Set(empleados.map((e) => e.cargo_nombre || "Sin cargo"))],
    [empleados],
  );

  // Busca por nombre, apellido, usuario o DNI, igual que la web
  const visibles = useMemo(() => {
    const texto = normalizar(busqueda.trim());
    return empleados.filter((e) => {
      if (filtroEstado === "Activos" && !e.estado) return false;
      if (filtroEstado === "Inactivos" && e.estado) return false;
      if (filtroCargo !== "Todos" && (e.cargo_nombre || "Sin cargo") !== filtroCargo) return false;
      return normalizar(`${e.nombre_empleado} ${e.apellido_empleado} ${e.user_auto} ${e.dni}`).includes(texto);
    });
  }, [empleados, busqueda, filtroEstado, filtroCargo]);

  const puedeCrear = permisos.includes("empleados:escribir");
  const puedeEditar = permisos.includes("empleados:modificar");
  const puedeDarBaja = permisos.includes("empleados:eliminar");

  const cambiarEstado = (empleado) => {
    const nombre = `${empleado.nombre_empleado} ${empleado.apellido_empleado}`;
    const mensaje = empleado.estado
      ? `¿Querés dar de baja a ${nombre}? No va a poder usar la app.`
      : `¿Querés reactivar a ${nombre}?`;
    confirmar(empleado.estado ? "Dar de baja" : "Reactivar", mensaje, async () => {
      try {
        const actualizado = await cambiarEstadoEmpleado(empleado.id_empleado);
        setEmpleados((lista) =>
          lista.map((e) => (e.id_empleado === actualizado.id_empleado ? actualizado : e)),
        );
      } catch (e) {
        mostrarAviso("No se pudo cambiar", e.message);
      }
    });
  };

  const renderItem = ({ item }) => {
    const gestionable = item.puede_gestionar;
    // La baja usa un permiso distinto al de reactivar, igual que en la web
    const puedeCambiarEstado =
      gestionable && (item.estado ? puedeDarBaja && !item.es_yo : puedeEditar);
    return (
      <TouchableOpacity
        style={g.tablaFila}
        onPress={() => navigation.navigate("DetalleEmpleado", { id: item.id_empleado })}
      >
        <View style={COLUMNAS.empleado}>
          <Text style={g.tablaNombre}>{item.nombre_empleado} {item.apellido_empleado}</Text>
          <Text style={g.tablaDetalle}>{item.user_auto}</Text>
          <Text style={g.tablaDetalle}>{item.cargo_nombre || "Sin cargo"}</Text>
        </View>
        <View style={COLUMNAS.estado}>
          <Etiqueta activo={item.estado} texto={item.estado ? "Activo" : "Inactivo"} />
        </View>
        <View style={[g.tablaAcciones, COLUMNAS.acciones]}>
          {puedeEditar && gestionable ? (
            <>
              <BotonIcono
                icono="edit"
                tipo="editar"
                etiqueta={`Editar a ${item.nombre_empleado} ${item.apellido_empleado}`}
                onPress={() => navigation.navigate("FormularioEmpleado", { id: item.id_empleado })}
              />
              <BotonIcono
                icono="key"
                tipo="clave"
                etiqueta={`Restablecer contraseña de ${item.nombre_empleado} ${item.apellido_empleado}`}
                onPress={() => navigation.navigate("RestablecerContrasena", { empleado: item })}
              />
            </>
          ) : null}
          {puedeCambiarEstado ? (
            <BotonIcono
              icono={item.estado ? "person-off" : "how-to-reg"}
              tipo={item.estado ? "baja" : "reactivar"}
              etiqueta={`${item.estado ? "Dar de baja" : "Reactivar"} a ${item.nombre_empleado} ${item.apellido_empleado}`}
              onPress={() => cambiarEstado(item)}
            />
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
        data={visibles}
        keyExtractor={(item) => String(item.id_empleado)}
        renderItem={renderItem}
        refreshing={actualizando}
        onRefresh={() => {
          setActualizando(true);
          cargar();
        }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <EncabezadoPagina icono="groups" titulo="Empleados" subtitulo="Gestiona el personal del restaurante">
              {puedeCrear ? (
                <TouchableOpacity style={g.boton} onPress={() => navigation.navigate("FormularioEmpleado")}>
                  <MaterialIcons name="person-add" size={18} color={COLORS.blanco} />
                  <Text style={g.botonTexto}>Nuevo empleado</Text>
                </TouchableOpacity>
              ) : null}
              {permisos.includes("cargos:leer") ? (
                <TouchableOpacity style={g.botonSecundario} onPress={() => navigation.navigate("ListaCargos")}>
                  <MaterialIcons name="work" size={18} color="#333333" />
                  <Text style={g.botonSecundarioTexto}>Cargos y permisos</Text>
                </TouchableOpacity>
              ) : null}
            </EncabezadoPagina>

            <PanelFiltros>
              <View style={g.buscador}>
                <Ionicons name="search" size={18} color="#9CA3AF" />
                <TextInput
                  style={g.buscadorInput}
                  placeholder="Buscar por nombre, usuario o DNI..."
                  placeholderTextColor="#9CA3AF"
                  value={busqueda}
                  onChangeText={setBusqueda}
                  autoCorrect={false}
                />
              </View>
              <Text style={[g.seccion, { marginTop: 0 }]}>Estado</Text>
              <View style={g.opciones}>
                {["Todos", "Activos", "Inactivos"].map((nombre) => (
                  <TouchableOpacity
                    key={nombre}
                    style={[g.opcion, filtroEstado === nombre && g.opcionActiva]}
                    onPress={() => setFiltroEstado(nombre)}
                  >
                    <Text style={[g.opcionTexto, filtroEstado === nombre && g.opcionTextoActivo]}>{nombre}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={g.seccion}>Cargo</Text>
              <View style={g.opciones}>
                {cargos.map((nombre) => (
                  <TouchableOpacity
                    key={nombre}
                    style={[g.opcion, filtroCargo === nombre && g.opcionActiva]}
                    onPress={() => setFiltroCargo(nombre)}
                  >
                    <Text style={[g.opcionTexto, filtroCargo === nombre && g.opcionTextoActivo]}>{nombre}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </PanelFiltros>

            <Text style={g.tablaTitulo}>Listado de empleados ({visibles.length})</Text>
            <CabeceraTabla
              columnas={[
                { texto: "Empleado", estilo: COLUMNAS.empleado },
                { texto: "Estado", estilo: COLUMNAS.estado },
                { texto: "Acciones", estilo: COLUMNAS.acciones },
              ]}
            />
          </View>
        }
        ListEmptyComponent={<Text style={g.tablaVacia}>No hay empleados para mostrar.</Text>}
        ListFooterComponent={<View style={g.tablaPie} />}
      />
    </View>
  );
}
