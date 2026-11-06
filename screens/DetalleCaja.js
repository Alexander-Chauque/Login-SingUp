import React, { useCallback, useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

import { cerrarCaja, obtenerCaja, realizarArqueo } from "../src/config/finanzas";
import { obtenerPermisos } from "../src/config/firestore";
import { confirmar, formatearDinero, formatearFecha } from "../src/utils/ayudas";
import { COLORS } from "../styles/colors";
import { gestionStyles as g } from "../styles/gestionStyles";
import { Etiqueta } from "./ComponentesSistema";

function Dato({ nombre, valor, fuerte }) {
  return (
    <View style={[g.filaEntre, { paddingVertical: 3 }]}>
      <Text style={g.textoSuave}>{nombre}</Text>
      <Text style={fuerte ? g.importe : g.texto}>{valor}</Text>
    </View>
  );
}

export default function DetalleCaja({ route, navigation }) {
  const { id } = route.params;
  const [datos, setDatos] = useState(null);
  const [permisos, setPermisos] = useState([]);
  const [error, setError] = useState("");
  const [panel, setPanel] = useState(null);
  const [contado, setContado] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [errorPanel, setErrorPanel] = useState("");
  const [ocupado, setOcupado] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setError("");
      const [caja, permisosUsuario] = await Promise.all([obtenerCaja(id), obtenerPermisos()]);
      setDatos(caja);
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

  const abrirPanel = (nombre) => {
    setErrorPanel("");
    setObservaciones("");
    setContado("");
    setPanel(panel === nombre ? null : nombre);
  };

  const ejecutar = async (accion) => {
    setErrorPanel("");
    setOcupado(true);
    try {
      await accion();
      setPanel(null);
      await cargar();
    } catch (e) {
      setErrorPanel(e.message);
    } finally {
      setOcupado(false);
    }
  };

  const confirmarCierre = () => {
    confirmar("Cerrar caja", "¿Querés cerrar la caja? Después no se pueden cambiar sus gastos.", () =>
      ejecutar(() => cerrarCaja(id, { observaciones })),
    );
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

  if (!datos) {
    return (
      <View style={g.centro}>
        <ActivityIndicator size="large" color={COLORS.naranja} />
      </View>
    );
  }

  const { caja, gastos } = datos;
  const abierta = caja.estado_caja === "abierto";
  const puedeModificar = permisos.includes("caja:modificar");

  return (
    <ScrollView style={g.pantalla} contentContainerStyle={g.contenido} keyboardShouldPersistTaps="handled">
      <View style={g.tarjeta}>
        <View style={g.filaEntre}>
          <Text style={g.titulo}>Caja N.º {caja.id_caja}</Text>
          <Etiqueta activo={abierta} texto={abierta ? "Abierta" : "Cerrada"} />
        </View>
        <Text style={g.textoSuave}>Abrió: {caja.empleado_apertura_nombre} · {formatearFecha(caja.fecha_apertura)}</Text>
        {caja.observaciones_apertura ? <Text style={[g.texto, { marginTop: 6 }]}>{caja.observaciones_apertura}</Text> : null}
      </View>

      <View style={g.tarjeta}>
        <Dato nombre="Saldo inicial" valor={formatearDinero(caja.saldo_inicial)} />
        <Dato nombre="Gastos" valor={`- ${formatearDinero(caja.total_egresos)}`} />
        <Dato
          nombre={abierta ? "Saldo esperado" : "Saldo final"}
          valor={formatearDinero(abierta ? caja.saldo_calculado : caja.saldo_final)}
          fuerte
        />
      </View>

      {caja.fecha_arqueo ? (
        <View style={g.tarjeta}>
          <Text style={[g.seccion, { marginTop: 0 }]}>Último arqueo</Text>
          <Text style={g.textoSuave}>{caja.empleado_arqueo_nombre} · {formatearFecha(caja.fecha_arqueo)}</Text>
          <Dato nombre="Esperado" valor={formatearDinero(caja.saldo_esperado)} />
          <Dato nombre="Contado" valor={formatearDinero(caja.saldo_contado)} />
          <Dato
            nombre="Diferencia"
            valor={`${caja.diferencia_caja < 0 ? "- " : ""}${formatearDinero(Math.abs(caja.diferencia_caja))}`}
            fuerte
          />
          {caja.observaciones_arqueo ? <Text style={g.texto}>{caja.observaciones_arqueo}</Text> : null}
        </View>
      ) : null}

      {caja.fecha_cierre ? (
        <View style={g.tarjeta}>
          <Text style={[g.seccion, { marginTop: 0 }]}>Cierre</Text>
          <Text style={g.textoSuave}>{caja.empleado_cierre_nombre} · {formatearFecha(caja.fecha_cierre)}</Text>
          {caja.observaciones_cierre ? <Text style={g.texto}>{caja.observaciones_cierre}</Text> : null}
        </View>
      ) : null}

      <View style={g.tarjeta}>
        <Text style={[g.seccion, { marginTop: 0 }]}>Gastos de esta caja ({gastos.length})</Text>
        {!gastos.length ? <Text style={g.textoSuave}>Todavía no hay gastos.</Text> : null}
        {gastos.map((gasto) => (
          <TouchableOpacity
            key={gasto.id_gasto}
            style={[g.filaEntre, { paddingVertical: 6 }]}
            onPress={() => navigation.navigate("FormularioGasto", { id: gasto.id_gasto })}
            disabled={!abierta || !puedeModificar}
          >
            <View style={{ flex: 1 }}>
              <Text style={g.texto}>{gasto.descripcion}</Text>
              <Text style={g.textoSuave}>{gasto.categoria_nombre} · {formatearFecha(gasto.fecha_hora)}</Text>
            </View>
            <Text style={g.texto}>{formatearDinero(gasto.monto)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {abierta ? (
        <View style={{ gap: 10 }}>
          {permisos.includes("caja:escribir") ? (
            <TouchableOpacity style={g.boton} onPress={() => navigation.navigate("FormularioGasto")}>
              <MaterialIcons name="add" size={18} color={COLORS.blanco} />
              <Text style={g.botonTexto}>Registrar gasto</Text>
            </TouchableOpacity>
          ) : null}
          {puedeModificar ? (
            <>
              <TouchableOpacity style={g.botonSecundario} onPress={() => abrirPanel("arqueo")}>
                <MaterialIcons name="calculate" size={18} color="#333333" />
                <Text style={g.botonSecundarioTexto}>Realizar arqueo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={g.botonPeligro} onPress={() => abrirPanel("cierre")}>
                <MaterialIcons name="lock" size={18} color={COLORS.blanco} />
                <Text style={g.botonPeligroTexto}>Cerrar caja</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      ) : null}

      {panel && abierta ? (
        <View style={[g.tarjeta, { marginTop: 14 }]}>
          <Text style={[g.seccion, { marginTop: 0 }]}>{panel === "arqueo" ? "Arqueo" : "Cierre"}</Text>
          <Text style={g.texto}>Saldo esperado: {formatearDinero(caja.saldo_calculado)}</Text>
          {panel === "arqueo" ? (
            <>
              <Text style={g.seccion}>Saldo contado ($) *</Text>
              <TextInput style={g.input} value={contado} onChangeText={setContado} keyboardType="decimal-pad" placeholderTextColor={COLORS.grisMedio} />
            </>
          ) : null}
          <Text style={g.seccion}>Observaciones (opcional)</Text>
          <TextInput style={[g.input, { height: 70, textAlignVertical: "top" }]} value={observaciones} onChangeText={setObservaciones} multiline maxLength={1000} placeholderTextColor={COLORS.grisMedio} />
          {errorPanel ? (
            <View style={g.errorCaja}>
              <MaterialIcons name="error-outline" size={18} color={COLORS.rojo} />
              <Text style={g.errorTexto}>{errorPanel}</Text>
            </View>
          ) : null}
          <TouchableOpacity
            style={[panel === "arqueo" ? g.boton : g.botonPeligro, { marginTop: 14 }, ocupado && g.botonDesactivado]}
            disabled={ocupado}
            onPress={panel === "arqueo" ? () => ejecutar(() => realizarArqueo(id, { saldoContado: contado, observaciones })) : confirmarCierre}
          >
            <Text style={panel === "arqueo" ? g.botonTexto : g.botonPeligroTexto}>
              {ocupado ? "Guardando..." : panel === "arqueo" ? "Guardar arqueo" : "Confirmar cierre"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </ScrollView>
  );
}
