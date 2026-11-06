import React, { useEffect, useLayoutEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import {
  actualizarEmpleado,
  crearEmpleado,
  listarCargosParaEmpleado,
  obtenerEmpleado,
} from "../src/config/personal";
import { mostrarAviso } from "../src/utils/ayudas";
import { COLORS } from "../styles/colors";
import { gestionStyles as g } from "../styles/gestionStyles";

// Crea un empleado, o lo edita si llega route.params.id
export default function FormularioEmpleado({ route, navigation }) {
  const id = route.params?.id;
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [dni, setDni] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [cargo, setCargo] = useState(null);
  const [cargos, setCargos] = useState([]);
  const [contrasena, setContrasena] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [verContrasena, setVerContrasena] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: id ? "Editar empleado" : "Nuevo empleado" });
  }, [id, navigation]);

  useEffect(() => {
    (async () => {
      try {
        const [listaCargos, empleado] = await Promise.all([
          listarCargosParaEmpleado(),
          id ? obtenerEmpleado(id) : null,
        ]);
        // Solo los cargos de nivel menor al propio. El cargo actual siempre se muestra.
        setCargos(listaCargos.filter((c) => c.gestionable || c.id_cargo === empleado?.cargo));
        if (empleado) {
          setNombre(empleado.nombre_empleado);
          setApellido(empleado.apellido_empleado);
          setDni(empleado.dni);
          setTelefono(empleado.telefono || "");
          setCorreo(empleado.correo);
          setCargo(empleado.cargo);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setCargando(false);
      }
    })();
  }, [id]);

  const guardar = async () => {
    setError("");
    if (!nombre.trim() || !apellido.trim() || !dni.trim() || !correo.trim() || !cargo) {
      setError("Completá el nombre, el apellido, el DNI, el correo y el cargo.");
      return;
    }
    if (!id && (!contrasena || !confirmacion)) {
      setError("Ingresá la contraseña y su confirmación.");
      return;
    }
    if (!id && contrasena !== confirmacion) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setGuardando(true);
    try {
      const datos = {
        nombre_empleado: nombre.trim(),
        apellido_empleado: apellido.trim(),
        dni: dni.trim(),
        telefono: telefono.trim(),
        correo: correo.trim(),
        cargo,
      };
      if (id) {
        await actualizarEmpleado(id, datos);
      } else {
        const { cuentaExistente, usuario } = await crearEmpleado(datos, contrasena, confirmacion);
        mostrarAviso(
          "Empleado creado",
          cuentaExistente
            ? `Usuario: ${usuario}. Ese correo ya tenía una cuenta: entra con su contraseña actual, y deberá cambiarla al ingresar.`
            : `Usuario: ${usuario}. Debe verificar su correo con el enlace que le enviamos, entrar con la contraseña temporal y cambiarla.`,
        );
      }
      navigation.goBack();
    } catch (e) {
      // Por ejemplo, un DNI repetido o una contraseña débil
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
      <TextInput style={g.input} value={nombre} onChangeText={setNombre} placeholder="Ej. Juan" placeholderTextColor={COLORS.grisMedio} maxLength={100} />

      <Text style={g.seccion}>Apellido *</Text>
      <TextInput style={g.input} value={apellido} onChangeText={setApellido} placeholder="Ej. Pérez" placeholderTextColor={COLORS.grisMedio} maxLength={100} />

      <Text style={g.seccion}>DNI *</Text>
      <TextInput style={g.input} value={dni} onChangeText={setDni} placeholder="Ej. 38765432" placeholderTextColor={COLORS.grisMedio} keyboardType="number-pad" maxLength={10} />

      <Text style={g.seccion}>Teléfono (opcional)</Text>
      <TextInput style={g.input} value={telefono} onChangeText={setTelefono} placeholder="Ej. 387 456 7890" placeholderTextColor={COLORS.grisMedio} keyboardType="phone-pad" maxLength={20} />

      <Text style={g.seccion}>Correo *</Text>
      <TextInput style={[g.input, id && g.botonDesactivado]} value={correo} onChangeText={setCorreo} editable={!id} placeholder="correo@ejemplo.com" placeholderTextColor={COLORS.grisMedio} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} maxLength={80} />
      {id ? <Text style={[g.textoSuave, { marginTop: 6 }]}>El correo identifica la cuenta del empleado y no se puede cambiar.</Text> : null}

      <Text style={g.seccion}>Cargo *</Text>
      <View style={g.opciones}>
        {cargos.map((c) => {
          const activo = cargo === c.id_cargo;
          return (
            <TouchableOpacity
              key={c.id_cargo}
              style={[g.opcion, activo && g.opcionActiva]}
              onPress={() => setCargo(c.id_cargo)}
              accessibilityRole="radio"
              accessibilityState={{ selected: activo }}
            >
              <Text style={[g.opcionTexto, activo && g.opcionTextoActivo]}>{c.nombre_cargo}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* La contraseña solo se define al crear. Para cambiarla está Restablecer contraseña. */}
      {!id ? (
        <>
          <Text style={g.seccion}>Contraseña temporal *</Text>
          <TextInput style={g.input} value={contrasena} onChangeText={setContrasena} secureTextEntry={!verContrasena} autoCapitalize="none" autoComplete="new-password" />

          <Text style={g.seccion}>Confirmar contraseña *</Text>
          <TextInput style={g.input} value={confirmacion} onChangeText={setConfirmacion} secureTextEntry={!verContrasena} autoCapitalize="none" autoComplete="new-password" />

          <TouchableOpacity
            style={[g.fila, { marginTop: 10 }]}
            onPress={() => setVerContrasena(!verContrasena)}
            accessibilityRole="button"
          >
            <MaterialIcons name={verContrasena ? "visibility-off" : "visibility"} size={20} color={COLORS.grisMedio} />
            <Text style={g.textoSuave}>{verContrasena ? "Ocultar contraseñas" : "Mostrar contraseñas"}</Text>
          </TouchableOpacity>

          <View style={[g.avisoCaja, { marginTop: 14, marginBottom: 0 }]}>
            <MaterialIcons name="info-outline" size={18} color="#92400E" />
            <Text style={g.avisoTexto}>
              Mínimo 8 caracteres, con mayúscula, número y carácter especial. El empleado debe verificar su correo y cambiarla en su primer ingreso.
            </Text>
          </View>
        </>
      ) : null}

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
