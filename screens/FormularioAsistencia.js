import React, { useEffect, useLayoutEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import {
  cambiarTurnoAsistencia,
  listarCatalogo,
  listarEmpleadosActivos,
  registrarAsistencia,
} from "../src/config/catalogos";
import { COLORS } from "../styles/colors";
import { gestionStyles as g } from "../styles/gestionStyles";

function Opciones({ lista, activa, alElegir }) {
  return (
    <View style={g.opciones}>
      {lista.map((opcion) => (
        <TouchableOpacity
          key={opcion.id}
          style={[g.opcion, activa === opcion.id && g.opcionActiva]}
          onPress={() => alElegir(opcion.id)}
          accessibilityRole="radio"
          accessibilityState={{ selected: activa === opcion.id }}
        >
          <Text style={[g.opcionTexto, activa === opcion.id && g.opcionTextoActivo]}>{opcion.nombre}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// Registra la asistencia de hoy, o cambia el turno si llega route.params.asistencia.
// La fecha no se elige: siempre es la de hoy.
export default function FormularioAsistencia({ route, navigation }) {
  const asistencia = route.params?.asistencia;
  const [empleados, setEmpleados] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [empleado, setEmpleado] = useState(asistencia?.empleado ?? null);
  const [turno, setTurno] = useState(asistencia?.tipo ?? null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({ title: asistencia ? "Cambiar turno" : "Registrar asistencia" });
  }, [asistencia, navigation]);

  useEffect(() => {
    (async () => {
      try {
        const [listaTurnos, listaEmpleados] = await Promise.all([
          listarCatalogo("tipoAsistencia"),
          asistencia ? [] : listarEmpleadosActivos(),
        ]);
        setTurnos(listaTurnos);
        setEmpleados(listaEmpleados);
      } catch (e) {
        setError(e.message);
      } finally {
        setCargando(false);
      }
    })();
  }, [asistencia]);

  const guardar = async () => {
    setError("");
    if (!empleado || !turno) {
      setError("Debe seleccionar un empleado y un turno.");
      return;
    }
    setGuardando(true);
    try {
      if (asistencia) await cambiarTurnoAsistencia(asistencia, turno);
      else await registrarAsistencia({ empleado, tipo: turno });
      navigation.goBack();
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <View style={g.centro}>
        <ActivityIndicator size="large" color={COLORS.naranja} />
      </View>
    );
  }

  return (
    <ScrollView style={g.pantalla} contentContainerStyle={g.contenidoFormulario}>
      {asistencia ? (
        <Text style={g.titulo}>{asistencia.empleado_nombre}</Text>
      ) : (
        <>
          <Text style={[g.seccion, { marginTop: 0 }]}>Empleado *</Text>
          <Opciones lista={empleados} activa={empleado} alElegir={setEmpleado} />
          {!empleados.length ? <Text style={g.textoSuave}>No hay empleados activos.</Text> : null}
        </>
      )}

      <Text style={g.seccion}>Turno *</Text>
      <Opciones lista={turnos} activa={turno} alElegir={setTurno} />
      {!turnos.length ? <Text style={g.textoSuave}>Todavía no hay turnos cargados.</Text> : null}

      {error ? (
        <View style={g.errorCaja}>
          <MaterialIcons name="error-outline" size={18} color={COLORS.rojo} />
          <Text style={g.errorTexto}>{error}</Text>
        </View>
      ) : null}

      <TouchableOpacity style={[g.boton, { marginTop: 20 }, guardando && g.botonDesactivado]} onPress={guardar} disabled={guardando}>
        <MaterialIcons name="save" size={18} color={COLORS.blanco} />
        <Text style={g.botonTexto}>{guardando ? "Guardando..." : "Guardar"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
