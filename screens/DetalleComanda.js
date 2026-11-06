import React, { useCallback, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import {
  cambiarEstadoComanda,
  eliminarComanda,
  listarMetodosParaCobro,
  obtenerComanda,
  obtenerPermisos,
  registrarPagoComanda,
} from "../src/config/firestore";
import { COLORES_ESTADO, confirmar, formatearDinero, formatearFecha, mostrarAviso } from "../src/utils/ayudas";
import { COLORS } from "../styles/colors";
import { gestionStyles as g } from "../styles/gestionStyles";

const ESTADOS = [
  { valor: "pendiente", nombre: "Pendiente" },
  { valor: "en_preparacion", nombre: "En preparación" },
  { valor: "entregado", nombre: "Entregado" },
];

export default function DetalleComanda({ route, navigation }) {
  const { id } = route.params;
  const [comanda, setComanda] = useState(null);
  const [permisos, setPermisos] = useState([]);
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);

  // Panel abierto: null, "pago" o "anular"
  const [panel, setPanel] = useState(null);
  const [tipoPago, setTipoPago] = useState("total");
  const [metodos, setMetodos] = useState([]);
  const [metodo, setMetodo] = useState(null);
  const [monto, setMonto] = useState("");
  const [motivo, setMotivo] = useState("");
  const [errorPanel, setErrorPanel] = useState("");

  const cargar = useCallback(async () => {
    try {
      setError("");
      const [datos, permisosUsuario, metodosActivos] = await Promise.all([
        obtenerComanda(id),
        obtenerPermisos(),
        listarMetodosParaCobro(),
      ]);
      setComanda(datos);
      setPermisos(permisosUsuario);
      setMetodos(metodosActivos);
    } catch (e) {
      setError(e.message);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  const cambiarEstado = (estado) => {
    if (estado === comanda.estado_comanda) return;
    const nombre = ESTADOS.find((e) => e.valor === estado).nombre;
    confirmar("Cambiar estado", `¿Pasar la comanda a "${nombre}"?`, async () => {
      setOcupado(true);
      try {
        setComanda(await cambiarEstadoComanda(id, estado));
      } catch (e) {
        mostrarAviso("No se pudo cambiar", e.message);
      } finally {
        setOcupado(false);
      }
    });
  };

  const eliminar = () => {
    confirmar("Eliminar comanda", `¿Querés eliminar la comanda #${id}? La mesa se liberará y no se puede deshacer.`, async () => {
      setOcupado(true);
      try {
        await eliminarComanda(id);
        navigation.goBack();
      } catch (e) {
        mostrarAviso("No se pudo eliminar", e.message);
        setOcupado(false);
      }
    });
  };

  const abrirPanel = (nombre) => {
    setErrorPanel("");
    setPanel(panel === nombre ? null : nombre);
  };

  const registrarPago = async () => {
    setErrorPanel("");
    if (!metodo) {
      setErrorPanel("Seleccioná un método de pago.");
      return;
    }
    const montoTexto = monto.trim().replace(",", ".");
    if (tipoPago === "parcial" && !(Number(montoTexto) > 0)) {
      setErrorPanel("Ingresá un monto mayor a 0.");
      return;
    }
    setOcupado(true);
    try {
      setComanda(
        await registrarPagoComanda(id, { tipoPago, metodoPago: metodo, montoTexto }),
      );
      setPanel(null);
      setMonto("");
      setMetodo(null);
      setTipoPago("total");
    } catch (e) {
      setErrorPanel(e.message);
    } finally {
      setOcupado(false);
    }
  };

  const anular = async () => {
    setErrorPanel("");
    if (!motivo.trim()) {
      setErrorPanel("Escribí el motivo de la anulación.");
      return;
    }
    setOcupado(true);
    try {
      setComanda(await cambiarEstadoComanda(id, "anulado", motivo));
      setPanel(null);
    } catch (e) {
      setErrorPanel(e.message);
    } finally {
      setOcupado(false);
    }
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

  if (!comanda) {
    return (
      <View style={g.centro}>
        <ActivityIndicator size="large" color={COLORS.naranja} />
      </View>
    );
  }

  const colores = COLORES_ESTADO[comanda.estado_comanda] || COLORES_ESTADO.pendiente;
  const puedeModificar = permisos.includes("comandas:modificar");
  const abierta = comanda.esta_abierta;

  return (
    <ScrollView style={g.pantalla} contentContainerStyle={g.contenido} keyboardShouldPersistTaps="handled">
      <View style={g.tarjeta}>
        <View style={g.filaEntre}>
          <Text style={g.titulo}>Comanda #{comanda.id_comanda}</Text>
          <View style={[g.etiqueta, { backgroundColor: colores.fondo }]}>
            <Text style={[g.etiquetaTexto, { color: colores.texto }]}>{comanda.estado_nombre}</Text>
          </View>
        </View>
        <Text style={g.texto}>Mesa {comanda.mesa_numero}</Text>
        <Text style={g.textoSuave}>{comanda.mozo} · {formatearFecha(comanda.fecha_hora)}</Text>
        {comanda.observaciones_comanda ? (
          <Text style={[g.texto, { marginTop: 8 }]}>Observaciones: {comanda.observaciones_comanda}</Text>
        ) : null}
        {comanda.motivo_anulacion ? (
          <Text style={[g.texto, { marginTop: 8 }]}>Motivo de anulación: {comanda.motivo_anulacion}</Text>
        ) : null}
      </View>

      <View style={g.tarjeta}>
        <Text style={[g.seccion, { marginTop: 0 }]}>Productos</Text>
        {comanda.items.map((item) => (
          <View key={`${item.tipo}-${item.id}`} style={[g.filaEntre, { paddingVertical: 4 }]}>
            <Text style={[g.texto, { flex: 1 }]}>
              {item.cantidad} x {item.nombre}
              {!item.disponible ? " (no disponible)" : ""}
            </Text>
            <Text style={g.texto}>{formatearDinero(Number(item.precio) * item.cantidad)}</Text>
          </View>
        ))}
        {!comanda.items.length ? <Text style={g.textoSuave}>Sin productos.</Text> : null}
        <View style={[g.filaEntre, { marginTop: 8 }]}>
          <Text style={g.nombre}>Total</Text>
          <Text style={g.importe}>{formatearDinero(comanda.total_comanda)}</Text>
        </View>
        {Number(comanda.total_pagado) > 0 ? (
          <>
            <View style={g.filaEntre}>
              <Text style={g.textoSuave}>Abonado</Text>
              <Text style={g.textoSuave}>{formatearDinero(comanda.total_pagado)}</Text>
            </View>
            <View style={g.filaEntre}>
              <Text style={g.texto}>Saldo</Text>
              <Text style={g.importe}>{formatearDinero(comanda.saldo_pendiente)}</Text>
            </View>
          </>
        ) : null}
      </View>

      {comanda.pagos.length ? (
        <View style={g.tarjeta}>
          <Text style={[g.seccion, { marginTop: 0 }]}>Pagos</Text>
          {comanda.pagos.map((pago) => (
            <View key={pago.id_pago} style={[g.filaEntre, { paddingVertical: 4 }]}>
              <Text style={[g.textoSuave, { flex: 1 }]}>{formatearFecha(pago.fecha_hora)} · {pago.metodo}</Text>
              <Text style={g.texto}>{formatearDinero(pago.monto)}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={[g.fila, { marginBottom: 12 }]}>
        <TouchableOpacity style={[g.botonSecundario, { flex: 1 }]} onPress={() => navigation.navigate("ComprobanteComanda", { id, tipo: "ticket" })}>
          <MaterialIcons name="receipt" size={18} color="#333333" />
          <Text style={g.botonSecundarioTexto}>Ticket</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[g.botonSecundario, { flex: 1 }]} onPress={() => navigation.navigate("ComprobanteComanda", { id, tipo: "comprobante" })}>
          <MaterialIcons name="description" size={18} color="#333333" />
          <Text style={g.botonSecundarioTexto}>Comprobante</Text>
        </TouchableOpacity>
      </View>

      {comanda.puede_modificarse && permisos.includes("comandas:eliminar") ? (
        <TouchableOpacity style={[g.botonPeligro, { marginBottom: 12 }]} onPress={eliminar} disabled={ocupado}>
          <MaterialIcons name="delete" size={18} color={COLORS.blanco} />
          <Text style={g.botonPeligroTexto}>Eliminar comanda</Text>
        </TouchableOpacity>
      ) : null}

      {abierta && puedeModificar ? (
        <>
          <Text style={g.seccion}>Estado</Text>
          <View style={[g.opciones, { marginBottom: 12 }]}>
            {ESTADOS.map((estado) => (
              <TouchableOpacity
                key={estado.valor}
                style={[g.opcion, comanda.estado_comanda === estado.valor && g.opcionActiva]}
                onPress={() => cambiarEstado(estado.valor)}
                disabled={ocupado}
              >
                <Text style={[g.opcionTexto, comanda.estado_comanda === estado.valor && g.opcionTextoActivo]}>
                  {estado.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ gap: 10 }}>
            <TouchableOpacity style={g.boton} onPress={() => abrirPanel("pago")}>
              <MaterialIcons name="payments" size={18} color={COLORS.blanco} />
              <Text style={g.botonTexto}>Registrar pago</Text>
            </TouchableOpacity>
            <TouchableOpacity style={g.botonSecundario} onPress={() => navigation.navigate("FormularioComanda", { id })}>
              <MaterialIcons name="edit" size={18} color="#333333" />
              <Text style={g.botonSecundarioTexto}>Editar productos</Text>
            </TouchableOpacity>
            {comanda.puede_modificarse ? (
              <TouchableOpacity style={g.botonPeligro} onPress={() => abrirPanel("anular")}>
                <MaterialIcons name="cancel" size={18} color={COLORS.blanco} />
                <Text style={g.botonPeligroTexto}>Anular comanda</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </>
      ) : null}

      {panel === "pago" && abierta ? (
        <View style={[g.tarjeta, { marginTop: 14 }]}>
          <Text style={[g.seccion, { marginTop: 0 }]}>Registrar pago</Text>
          <Text style={g.texto}>Saldo a pagar: {formatearDinero(comanda.saldo_pendiente)}</Text>
          <Text style={g.seccion}>¿Cómo va a abonar?</Text>
          <View style={g.opciones}>
            {[
              { valor: "total", nombre: "Todo de una vez" },
              { valor: "parcial", nombre: "Por partes" },
            ].map((opcion) => (
              <TouchableOpacity key={opcion.valor} style={[g.opcion, tipoPago === opcion.valor && g.opcionActiva]} onPress={() => setTipoPago(opcion.valor)}>
                <Text style={[g.opcionTexto, tipoPago === opcion.valor && g.opcionTextoActivo]}>{opcion.nombre}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {tipoPago === "parcial" ? (
            <>
              <Text style={g.seccion}>Monto *</Text>
              <TextInput style={g.input} value={monto} onChangeText={setMonto} keyboardType="decimal-pad" placeholder="Ej. 1500" placeholderTextColor={COLORS.grisMedio} />
            </>
          ) : null}
          <Text style={g.seccion}>Método de pago *</Text>
          <View style={g.opciones}>
            {metodos.map((opcion) => (
              <TouchableOpacity key={opcion.valor} style={[g.opcion, metodo === opcion.valor && g.opcionActiva]} onPress={() => setMetodo(opcion.valor)}>
                <Text style={[g.opcionTexto, metodo === opcion.valor && g.opcionTextoActivo]}>{opcion.nombre}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {errorPanel ? (
            <View style={g.errorCaja}>
              <MaterialIcons name="error-outline" size={18} color={COLORS.rojo} />
              <Text style={g.errorTexto}>{errorPanel}</Text>
            </View>
          ) : null}
          <TouchableOpacity style={[g.boton, { marginTop: 14 }, ocupado && g.botonDesactivado]} onPress={registrarPago} disabled={ocupado}>
            <Text style={g.botonTexto}>{ocupado ? "Guardando..." : "Confirmar pago"}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {panel === "anular" && abierta ? (
        <View style={[g.tarjeta, { marginTop: 14 }]}>
          <Text style={[g.seccion, { marginTop: 0 }]}>Anular comanda</Text>
          <Text style={g.texto}>La comanda quedará anulada y la mesa se liberará.</Text>
          <Text style={g.seccion}>Motivo *</Text>
          <TextInput style={[g.input, { height: 70, textAlignVertical: "top" }]} value={motivo} onChangeText={setMotivo} multiline maxLength={250} placeholder="Ej. el cliente se retiró" placeholderTextColor={COLORS.grisMedio} />
          {errorPanel ? (
            <View style={g.errorCaja}>
              <MaterialIcons name="error-outline" size={18} color={COLORS.rojo} />
              <Text style={g.errorTexto}>{errorPanel}</Text>
            </View>
          ) : null}
          <TouchableOpacity style={[g.botonPeligro, { marginTop: 14 }, ocupado && g.botonDesactivado]} onPress={anular} disabled={ocupado}>
            <Text style={g.botonPeligroTexto}>{ocupado ? "Anulando..." : "Confirmar anulación"}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </ScrollView>
  );
}
