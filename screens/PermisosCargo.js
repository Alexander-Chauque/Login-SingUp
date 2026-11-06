import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

import { obtenerUsuarioActual } from "../src/config/firestore";
import { guardarPermisosCargo, listarPermisos, obtenerCargo } from "../src/config/personal";
import { COLORS } from "../styles/colors";
import { gestionStyles as g } from "../styles/gestionStyles";

// Muestra los permisos de un cargo y permite cambiarlos. route.params.id es el cargo.
export default function PermisosCargo({ route, navigation }) {
  const { id } = route.params;
  const [cargo, setCargo] = useState(null);
  const [catalogo, setCatalogo] = useState([]);
  const [yo, setYo] = useState(null);
  // Un Set guarda los ids elegidos sin repetir
  const [elegidos, setElegidos] = useState(new Set());
  const [originales, setOriginales] = useState(new Set());
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [errorCarga, setErrorCarga] = useState("");
  const [aviso, setAviso] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({ title: "Permisos del cargo" });
  }, [navigation]);

  const cargar = useCallback(async () => {
    try {
      setErrorCarga("");
      const [datosCargo, datosPermisos, datosYo] = await Promise.all([
        obtenerCargo(id),
        listarPermisos(),
        obtenerUsuarioActual(),
      ]);
      setCargo(datosCargo);
      setCatalogo(datosPermisos.permisos);
      setYo(datosYo);
      setElegidos(new Set(datosCargo.permisos));
      setOriginales(new Set(datosCargo.permisos));
    } catch (e) {
      setErrorCarga(e.message);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  // Agrupa los permisos por módulo: [["Platos", [permiso, ...]], ...]
  const grupos = useMemo(() => {
    const mapa = new Map();
    catalogo.forEach((p) => {
      if (!mapa.has(p.modulo_nombre)) mapa.set(p.modulo_nombre, []);
      mapa.get(p.modulo_nombre).push(p);
    });
    return [...mapa.entries()];
  }, [catalogo]);

  if (errorCarga) {
    return (
      <View style={g.centro}>
        <MaterialIcons name="error-outline" size={36} color={COLORS.rojo} />
        <Text style={g.mensaje}>{errorCarga}</Text>
        <TouchableOpacity style={g.boton} onPress={cargar}>
          <Text style={g.botonTexto}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!cargo || !yo) {
    return (
      <View style={g.centro}>
        <ActivityIndicator size="large" color={COLORS.naranja} />
      </View>
    );
  }

  const soyAdministrador = yo.nivel >= 5;
  const editable = cargo.gestionable && yo.permisos.includes("cargos:modificar");

  // Solo el administrador agrega permisos que no tiene. Quitarlos sí está permitido.
  const puedeTocar = (permiso) =>
    editable &&
    (soyAdministrador ||
      originales.has(permiso.id_tipo_permiso) ||
      yo.permisos.includes(`${permiso.modulo}:${permiso.accion}`));

  const alternar = (idPermiso) => {
    setAviso("");
    setElegidos((actual) => {
      const nuevo = new Set(actual);
      if (nuevo.has(idPermiso)) nuevo.delete(idPermiso);
      else nuevo.add(idPermiso);
      return nuevo;
    });
  };

  const hayCambios =
    elegidos.size !== originales.size || [...elegidos].some((i) => !originales.has(i));

  const guardar = async () => {
    setError("");
    setAviso("");
    setGuardando(true);
    try {
      await guardarPermisosCargo(id, [...elegidos]);
      setOriginales(new Set(elegidos));
      setAviso("Permisos guardados.");
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <View style={g.pantalla}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={g.contenido}>
        <View style={g.tarjeta}>
          <Text style={g.titulo}>{cargo.nombre_cargo}</Text>
          <Text style={g.textoSuave}>
            Nivel {cargo.nivel_acceso} · {cargo.total_empleados} {cargo.total_empleados === 1 ? "empleado" : "empleados"} · {elegidos.size} {elegidos.size === 1 ? "permiso" : "permisos"}
          </Text>
        </View>

        {/* El nivel 5 entra a todo, sin importar la lista: se aclara para evitar confusiones */}
        {cargo.nivel_acceso >= 5 ? (
          <View style={g.avisoCaja}>
            <MaterialIcons name="info-outline" size={18} color="#92400E" />
            <Text style={g.avisoTexto}>Este cargo es de administrador: tiene todos los permisos, aunque no estén marcados.</Text>
          </View>
        ) : null}

        {!editable ? (
          <View style={g.avisoCaja}>
            <MaterialIcons name="lock-outline" size={18} color="#92400E" />
            <Text style={g.avisoTexto}>Solo lectura: no podés cambiar los permisos de este cargo.</Text>
          </View>
        ) : !soyAdministrador ? (
          <View style={g.avisoCaja}>
            <MaterialIcons name="info-outline" size={18} color="#92400E" />
            <Text style={g.avisoTexto}>Solo podés agregar permisos que vos también tenés.</Text>
          </View>
        ) : null}

        {grupos.map(([modulo, lista]) => (
          <View key={modulo} style={g.tarjeta}>
            <Text style={[g.seccion, { marginTop: 0 }]}>{modulo}</Text>
            <View style={g.opciones}>
              {lista.map((permiso) => {
                const activo = elegidos.has(permiso.id_tipo_permiso);
                const habilitado = puedeTocar(permiso);
                return (
                  <TouchableOpacity
                    key={permiso.id_tipo_permiso}
                    style={[g.opcion, activo && g.opcionActiva, !habilitado && g.botonDesactivado]}
                    disabled={!habilitado}
                    onPress={() => alternar(permiso.id_tipo_permiso)}
                    accessibilityRole="checkbox"
                    accessibilityLabel={`${modulo}: ${permiso.accion_nombre}`}
                    accessibilityState={{ checked: activo, disabled: !habilitado }}
                  >
                    <Text style={[g.opcionTexto, activo && g.opcionTextoActivo]}>{permiso.accion_nombre}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
        {!grupos.length ? <Text style={g.mensaje}>Todavía no hay permisos creados.</Text> : null}
      </ScrollView>

      {editable ? (
        <View style={g.pie}>
          {error ? (
            <View style={[g.errorCaja, { marginTop: 0 }]}>
              <MaterialIcons name="error-outline" size={18} color={COLORS.rojo} />
              <Text style={g.errorTexto}>{error}</Text>
            </View>
          ) : null}
          {aviso ? <Text style={[g.mensaje, { color: "#065F46" }]}>{aviso}</Text> : null}
          <TouchableOpacity
            style={[g.boton, (guardando || !hayCambios) && g.botonDesactivado]}
            onPress={guardar}
            disabled={guardando || !hayCambios}
          >
            <MaterialIcons name="save" size={18} color={COLORS.blanco} />
            <Text style={g.botonTexto}>{guardando ? "Guardando..." : "Guardar permisos"}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}
