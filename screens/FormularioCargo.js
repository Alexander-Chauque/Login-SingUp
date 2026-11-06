import React, { useEffect, useLayoutEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { obtenerUsuarioActual } from "../src/config/firestore";
import { guardarCargo, obtenerCargo } from "../src/config/personal";
import { COLORS } from "../styles/colors";
import { gestionStyles as g } from "../styles/gestionStyles";

const NIVELES = [
  { valor: 1, nombre: "1 - Básico" },
  { valor: 2, nombre: "2 - Operador" },
  { valor: 3, nombre: "3 - Supervisor" },
  { valor: 4, nombre: "4 - Gerente" },
  { valor: 5, nombre: "5 - Administrador" },
];

// Crea un cargo, o lo edita si llega route.params.id
export default function FormularioCargo({ route, navigation }) {
  const id = route.params?.id;
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [nivel, setNivel] = useState(null);
  const [sueldo, setSueldo] = useState("");
  const [miNivel, setMiNivel] = useState(0);

  useLayoutEffect(() => {
    navigation.setOptions({ title: id ? "Editar cargo" : "Nuevo cargo" });
  }, [id, navigation]);

  useEffect(() => {
    (async () => {
      try {
        const [yo, cargo] = await Promise.all([obtenerUsuarioActual(), id ? obtenerCargo(id) : null]);
        setMiNivel(yo.nivel);
        if (cargo) {
          setNombre(cargo.nombre_cargo);
          setDescripcion(cargo.descripcion_cargo);
          setNivel(cargo.nivel_acceso);
          setSueldo(String(Number(cargo.sueldo_cargo)));
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setCargando(false);
      }
    })();
  }, [id]);

  // Solo se ofrecen niveles menores al propio. El administrador puede elegir todos.
  const nivelesDisponibles = NIVELES.filter((n) => miNivel >= 5 || n.valor < miNivel);

  const guardar = async () => {
    setError("");
    const sueldoTexto = sueldo.trim().replace(",", ".");
    if (!nombre.trim() || !nivel || !sueldoTexto) {
      setError("Completá el nombre, el nivel y el sueldo.");
      return;
    }
    const sueldoNumero = Number(sueldoTexto);
    if (!Number.isFinite(sueldoNumero) || sueldoNumero < 0) {
      setError("Ingresá un sueldo válido, igual o mayor a 0.");
      return;
    }
    setGuardando(true);
    try {
      await guardarCargo(
        {
          nombre_cargo: nombre,
          descripcion_cargo: descripcion,
          nivel_acceso: nivel,
          sueldo_cargo: sueldoNumero,
        },
        id,
      );
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
    <ScrollView style={g.pantalla} contentContainerStyle={g.contenidoFormulario} keyboardShouldPersistTaps="handled">
      <Text style={[g.seccion, { marginTop: 0 }]}>Nombre *</Text>
      <TextInput style={g.input} value={nombre} onChangeText={setNombre} placeholder="Ej. Cajero" placeholderTextColor={COLORS.grisMedio} maxLength={100} />

      <Text style={g.seccion}>Nivel de acceso *</Text>
      <View style={g.opciones}>
        {nivelesDisponibles.map((n) => {
          const activo = nivel === n.valor;
          return (
            <TouchableOpacity
              key={n.valor}
              style={[g.opcion, activo && g.opcionActiva]}
              onPress={() => setNivel(n.valor)}
              accessibilityRole="radio"
              accessibilityState={{ selected: activo }}
            >
              <Text style={[g.opcionTexto, activo && g.opcionTextoActivo]}>{n.nombre}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={g.seccion}>Sueldo ($) *</Text>
      <TextInput style={g.input} value={sueldo} onChangeText={setSueldo} placeholder="Ej. 450000" placeholderTextColor={COLORS.grisMedio} keyboardType="decimal-pad" />

      <Text style={g.seccion}>Descripción (opcional)</Text>
      <TextInput style={[g.input, { height: 80, textAlignVertical: "top" }]} value={descripcion} onChangeText={setDescripcion} multiline placeholder="Qué hace este cargo" placeholderTextColor={COLORS.grisMedio} />

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
