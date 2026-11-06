import React, { useLayoutEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { crearPermiso } from "../src/config/personal";
import { COLORS } from "../styles/colors";
import { gestionStyles as g } from "../styles/gestionStyles";

// Crea un permiso. Las opciones llegan desde ListaPermisos.
export default function FormularioPermiso({ route, navigation }) {
  const { modulos, acciones, permisos } = route.params;
  const [modulo, setModulo] = useState(null);
  const [accion, setAccion] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({ title: "Nuevo permiso" });
  }, [navigation]);

  const yaExiste = (valorModulo, valorAccion) =>
    permisos.some((p) => p.modulo === valorModulo && p.accion === valorAccion);

  const guardar = async () => {
    setError("");
    if (!modulo || !accion) {
      setError("Elegí el módulo y la acción.");
      return;
    }
    if (yaExiste(modulo, accion)) {
      setError("Este permiso ya existe.");
      return;
    }
    setGuardando(true);
    try {
      await crearPermiso({ modulo, accion });
      navigation.goBack();
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ScrollView style={g.pantalla} contentContainerStyle={g.contenidoFormulario}>
      <Text style={[g.seccion, { marginTop: 0 }]}>Módulo *</Text>
      <View style={g.opciones}>
        {modulos.map((m) => (
          <TouchableOpacity key={m.valor} style={[g.opcion, modulo === m.valor && g.opcionActiva]} onPress={() => setModulo(m.valor)}>
            <Text style={[g.opcionTexto, modulo === m.valor && g.opcionTextoActivo]}>{m.nombre}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={g.seccion}>Acción *</Text>
      <View style={g.opciones}>
        {acciones.map((a) => (
          <TouchableOpacity key={a.valor} style={[g.opcion, accion === a.valor && g.opcionActiva]} onPress={() => setAccion(a.valor)}>
            <Text style={[g.opcionTexto, accion === a.valor && g.opcionTextoActivo]}>{a.nombre}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[g.avisoCaja, { marginTop: 16, marginBottom: 0 }]}>
        <MaterialIcons name="info-outline" size={18} color="#92400E" />
        <Text style={g.avisoTexto}>Crear un permiso no se lo da a nadie: después hay que asignarlo a un cargo.</Text>
      </View>

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
