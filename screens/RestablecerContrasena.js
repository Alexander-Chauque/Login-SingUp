import React, { useLayoutEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { enviarRestablecimiento } from "../src/config/personal";
import { mostrarAviso } from "../src/utils/ayudas";
import { COLORS } from "../styles/colors";
import { gestionStyles as g } from "../styles/gestionStyles";

// Envía un enlace para que el empleado elija una contraseña nueva. route.params.empleado es el elegido.
export default function RestablecerContrasena({ route, navigation }) {
  const { empleado } = route.params;
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({ title: "Restablecer contraseña" });
  }, [navigation]);

  const enviar = async () => {
    setError("");
    setEnviando(true);
    try {
      await enviarRestablecimiento(empleado);
      mostrarAviso("Listo", `Enviamos el enlace a ${empleado.correo}.`);
      navigation.goBack();
    } catch (e) {
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ScrollView style={g.pantalla} contentContainerStyle={g.contenidoFormulario}>
      <Text style={g.titulo}>{empleado.nombre_empleado} {empleado.apellido_empleado}</Text>
      <Text style={[g.textoSuave, { marginBottom: 6 }]}>{empleado.correo}</Text>

      <View style={[g.avisoCaja, { marginTop: 14, marginBottom: 0 }]}>
        <MaterialIcons name="info-outline" size={18} color="#92400E" />
        <Text style={g.avisoTexto}>
          Por seguridad, Firebase no permite escribir la contraseña de otra persona. El empleado recibe un correo con un enlace para elegir una nueva.
        </Text>
      </View>

      {error ? (
        <View style={g.errorCaja}>
          <MaterialIcons name="error-outline" size={18} color={COLORS.rojo} />
          <Text style={g.errorTexto}>{error}</Text>
        </View>
      ) : null}

      <TouchableOpacity style={[g.boton, { marginTop: 20 }, enviando && g.botonDesactivado]} onPress={enviar} disabled={enviando}>
        <MaterialIcons name="mail-outline" size={18} color={COLORS.blanco} />
        <Text style={g.botonTexto}>{enviando ? "Enviando..." : "Enviar enlace"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
