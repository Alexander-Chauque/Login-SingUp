import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

import { obtenerPermisos } from "../src/config/firestore";
import { cambiarEstadoEmpleado, obtenerEmpleado } from "../src/config/personal";
import { confirmar, mostrarAviso } from "../src/utils/ayudas";
import { COLORS } from "../styles/colors";
import { gestionStyles as g } from "../styles/gestionStyles";
import { Etiqueta } from "./ComponentesSistema";

// Muestra una fecha del servidor sin cambiarla de día. Ejemplo: 2026-11-05 -> 05/11/2026
const formatearDia = (fecha) => (fecha ? fecha.split("-").reverse().join("/") : "-");

// Una fila con ícono, nombre del dato y valor
function Dato({ icono, nombre, valor }) {
  return (
    <View style={[g.filaEntre, { paddingVertical: 8 }]}>
      <View style={g.fila}>
        <MaterialIcons name={icono} size={20} color={COLORS.naranja} />
        <Text style={g.texto}>{nombre}</Text>
      </View>
      <Text style={[g.texto, { flexShrink: 1, textAlign: "right", fontWeight: "600" }]}>{valor || "-"}</Text>
    </View>
  );
}

export default function DetalleEmpleado({ route, navigation }) {
  const { id } = route.params;
  const [empleado, setEmpleado] = useState(null);
  const [permisos, setPermisos] = useState([]);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    try {
      setError("");
      const [datos, permisosUsuario] = await Promise.all([obtenerEmpleado(id), obtenerPermisos()]);
      setEmpleado(datos);
      setPermisos(permisosUsuario);
    } catch (e) {
      setError(e.message);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  const cambiarEstado = () => {
    const nombre = `${empleado.nombre_empleado} ${empleado.apellido_empleado}`;
    const mensaje = empleado.estado
      ? `¿Querés dar de baja a ${nombre}? No va a poder usar la app.`
      : `¿Querés reactivar a ${nombre}?`;
    confirmar(empleado.estado ? "Dar de baja" : "Reactivar", mensaje, async () => {
      try {
        setEmpleado(await cambiarEstadoEmpleado(id));
      } catch (e) {
        mostrarAviso("No se pudo cambiar", e.message);
      }
    });
  };

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

  if (!empleado) {
    return (
      <View style={g.centro}>
        <ActivityIndicator size="large" color={COLORS.naranja} />
      </View>
    );
  }

  const gestionable = empleado.puede_gestionar;
  const puedeEditar = gestionable && permisos.includes("empleados:modificar");
  const puedeCambiarEstado =
    gestionable &&
    (empleado.estado
      ? permisos.includes("empleados:eliminar") && !empleado.es_yo
      : permisos.includes("empleados:modificar"));

  return (
    <ScrollView style={g.pantalla} contentContainerStyle={g.contenido}>
      <View style={g.tarjeta}>
        <View style={g.filaEntre}>
          <View style={{ flex: 1 }}>
            <Text style={g.titulo}>{empleado.nombre_empleado} {empleado.apellido_empleado}</Text>
            <Text style={g.textoSuave}>{empleado.user_auto}</Text>
          </View>
          <Etiqueta activo={empleado.estado} texto={empleado.estado ? "Activo" : "Inactivo"} />
        </View>
      </View>

      <View style={g.tarjeta}>
        <Dato icono="badge" nombre="DNI" valor={empleado.dni} />
        <Dato icono="work-outline" nombre="Cargo" valor={empleado.cargo_nombre || "Sin cargo"} />
        <Dato icono="mail-outline" nombre="Correo" valor={empleado.correo} />
        <Dato icono="phone" nombre="Teléfono" valor={empleado.telefono} />
        <Dato icono="event" nombre="Ingreso" valor={formatearDia(empleado.fecha_ingreso)} />
        {empleado.fecha_baja ? <Dato icono="event-busy" nombre="Baja" valor={formatearDia(empleado.fecha_baja)} /> : null}
      </View>

      <View style={{ gap: 10 }}>
        {puedeEditar ? (
          <>
            <TouchableOpacity style={g.boton} onPress={() => navigation.navigate("FormularioEmpleado", { id })}>
              <MaterialIcons name="edit" size={18} color={COLORS.blanco} />
              <Text style={g.botonTexto}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={g.botonSecundario} onPress={() => navigation.navigate("RestablecerContrasena", { empleado })}>
              <MaterialIcons name="key" size={18} color="#333333" />
              <Text style={g.botonSecundarioTexto}>Restablecer contraseña</Text>
            </TouchableOpacity>
          </>
        ) : null}
        {puedeCambiarEstado ? (
          <TouchableOpacity
            style={empleado.estado ? g.botonPeligro : g.botonSecundario}
            onPress={cambiarEstado}
          >
            <MaterialIcons
              name={empleado.estado ? "person-off" : "how-to-reg"}
              size={18}
              color={empleado.estado ? COLORS.blanco : "#333333"}
            />
            <Text style={empleado.estado ? g.botonPeligroTexto : g.botonSecundarioTexto}>
              {empleado.estado ? "Dar de baja" : "Reactivar"}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </ScrollView>
  );
}
