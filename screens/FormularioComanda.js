import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import {
  actualizarComanda,
  crearComanda,
  listarMesas,
  listarProductosParaComanda,
  obtenerComanda,
} from "../src/config/firestore";
import { formatearDinero, normalizar } from "../src/utils/ayudas";
import { COLORS } from "../styles/colors";
import { gestionStyles as g } from "../styles/gestionStyles";

// Crea una comanda, o la edita si llega route.params.id.
// Si llega route.params.mesa, esa mesa queda elegida.
export default function FormularioComanda({ route, navigation }) {
  const id = route.params?.id;
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [mesa, setMesa] = useState(route.params?.mesa ?? null);
  const [mesas, setMesas] = useState([]);
  const [observaciones, setObservaciones] = useState("");
  const [productos, setProductos] = useState([]);
  const [tienePagos, setTienePagos] = useState(false);
  const [numeroMesa, setNumeroMesa] = useState(null);
  // Cada producto del carrito: { tipo, id, nombre, precio, cantidad, minimo, maximo }
  const [carrito, setCarrito] = useState([]);

  const [busquedaMesa, setBusquedaMesa] = useState("");
  const [busqueda, setBusqueda] = useState("");
  // "todos", "plato" o "bebida", igual que las pestañas de la web
  const [tipoActivo, setTipoActivo] = useState("todos");
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");

  useLayoutEffect(() => {
    navigation.setOptions({ title: id ? `Editar Comanda #${id}` : "Nueva Comanda" });
  }, [id, navigation]);

  useEffect(() => {
    (async () => {
      try {
        const [listaProductos, listaMesas, comanda] = await Promise.all([
          listarProductosParaComanda(),
          id ? [] : listarMesas(),
          id ? obtenerComanda(id) : null,
        ]);
        setProductos(listaProductos);
        setMesas(listaMesas.filter((m) => m.estado_mesa && !m.comanda_abierta));
        if (comanda) {
          const conPagos = comanda.pagos.length > 0;
          setTienePagos(conPagos);
          setNumeroMesa(comanda.mesa_numero);
          setObservaciones(comanda.observaciones_comanda);
          setCarrito(
            comanda.items.map((item) => ({
              ...item,
              precio: Number(item.precio),
              // Con pagos, lo que ya estaba no se puede reducir ni quitar
              minimo: conPagos ? item.cantidad : 0,
              // Lo que ya no se vende no se puede aumentar
              maximo: item.disponible ? null : item.cantidad,
            })),
          );
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setCargando(false);
      }
    })();
  }, [id]);

  // Mesas cuyo número empieza con lo escrito, agrupadas por ubicación
  const gruposMesas = useMemo(() => {
    const texto = busquedaMesa.trim();
    const grupos = new Map();
    [...mesas]
      .sort((a, b) => a.numero_mesa - b.numero_mesa)
      .filter((m) => String(m.numero_mesa).startsWith(texto))
      .forEach((m) => {
        if (!grupos.has(m.ubicacion_nombre)) grupos.set(m.ubicacion_nombre, []);
        grupos.get(m.ubicacion_nombre).push(m);
      });
    return [...grupos.entries()];
  }, [mesas, busquedaMesa]);

  const mesaElegida = mesas.find((m) => m.id_mesa === mesa);

  const categorias = useMemo(
    () => [
      "Todas",
      ...new Set(productos.filter((p) => p.tipo === tipoActivo).map((p) => p.categoria)),
    ],
    [productos, tipoActivo],
  );

  const visibles = useMemo(() => {
    const texto = normalizar(busqueda.trim());
    return productos.filter(
      (p) =>
        (tipoActivo === "todos" || p.tipo === tipoActivo) &&
        (categoriaActiva === "Todas" || p.categoria === categoriaActiva) &&
        normalizar(p.nombre).includes(texto),
    );
  }, [productos, tipoActivo, categoriaActiva, busqueda]);

  const total = carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0);

  const agregar = (producto) => {
    setCarrito((actual) => {
      const existe = actual.find((i) => i.tipo === producto.tipo && i.id === producto.id);
      if (existe) {
        return actual.map((i) => (i === existe ? { ...i, cantidad: i.cantidad + 1 } : i));
      }
      return [
        ...actual,
        {
          tipo: producto.tipo,
          id: producto.id,
          nombre: producto.nombre,
          precio: Number(producto.precio),
          cantidad: 1,
          minimo: 0,
          maximo: null,
          disponible: true,
        },
      ];
    });
  };

  const cambiarCantidad = (item, cambio) => {
    setCarrito((actual) =>
      actual
        .map((i) => (i === item ? { ...i, cantidad: i.cantidad + cambio } : i))
        // Al llegar a 0, el producto sale del carrito
        .filter((i) => i.cantidad > 0),
    );
  };

  const guardar = async () => {
    setError("");
    if (!id && !mesa) {
      setError("Seleccioná una mesa.");
      return;
    }
    if (!carrito.length) {
      setError("Agregá al menos un plato o una bebida.");
      return;
    }
    setGuardando(true);
    try {
      const items = carrito.map((i) => ({ tipo: i.tipo, id: i.id, cantidad: i.cantidad }));
      if (id) {
        await actualizarComanda(id, { observaciones, items });
        navigation.goBack();
      } else {
        const idNueva = await crearComanda({ mesa, observaciones, items });
        // replace evita volver a este formulario con el botón de atrás
        navigation.replace("DetalleComanda", { id: idNueva });
      }
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
    <View style={g.pantalla}>
      {/* flex: 1 hace que la lista use solo el espacio libre y deje visible el pie */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={g.contenido} keyboardShouldPersistTaps="handled">
        {id ? (
          <Text style={g.titulo}>Mesa {numeroMesa}</Text>
        ) : (
          <>
            <Text style={[g.seccion, { marginTop: 0 }]}>Mesa *</Text>
            {mesas.length ? (
              <>
                <View style={g.buscador}>
                  <Ionicons name="search" size={18} color="#9CA3AF" />
                  <TextInput
                    style={g.buscadorInput}
                    value={busquedaMesa}
                    onChangeText={setBusquedaMesa}
                    placeholder="Buscar por número de mesa"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
                <Text style={[g.texto, { fontWeight: "600", marginBottom: 8 }]}>
                  {mesaElegida
                    ? `Mesa elegida: ${mesaElegida.numero_mesa} · ${mesaElegida.ubicacion_nombre}`
                    : "Todavía no elegiste una mesa."}
                </Text>
                {/* nestedScrollEnabled permite desplazar la grilla dentro de la pantalla en Android */}
                <ScrollView style={{ maxHeight: 220 }} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                  {gruposMesas.map(([ubicacion, lista]) => (
                    <View key={ubicacion} style={{ marginBottom: 10 }}>
                      <Text style={[g.textoSuave, { marginBottom: 6 }]}>{ubicacion}</Text>
                      <View style={g.opciones}>
                        {lista.map((m) => (
                          <TouchableOpacity
                            key={m.id_mesa}
                            style={[g.opcion, g.opcionMesa, mesa === m.id_mesa && g.opcionActiva]}
                            onPress={() => setMesa(m.id_mesa)}
                            accessibilityRole="radio"
                            accessibilityLabel={`Mesa ${m.numero_mesa}`}
                            accessibilityState={{ selected: mesa === m.id_mesa }}
                          >
                            <Text style={[g.opcionTexto, mesa === m.id_mesa && g.opcionTextoActivo]}>
                              {m.numero_mesa}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ))}
                  {!gruposMesas.length ? (
                    <Text style={g.tablaVacia}>No hay mesas disponibles con ese número.</Text>
                  ) : null}
                </ScrollView>
              </>
            ) : (
              <Text style={g.textoSuave}>No hay mesas disponibles.</Text>
            )}
          </>
        )}

        {tienePagos ? (
          <View style={[g.avisoCaja, { marginTop: 12 }]}>
            <MaterialIcons name="info-outline" size={18} color={COLORS.naranjaOscuro} />
            <Text style={g.avisoTexto}>
              Esta comanda tiene pagos: podés agregar productos, pero no quitar ni reducir los que ya tenía.
            </Text>
          </View>
        ) : null}

        <Text style={g.seccion}>Observaciones (opcional)</Text>
        <TextInput
          style={[g.input, { height: 64, textAlignVertical: "top" }]}
          value={observaciones}
          onChangeText={setObservaciones}
          multiline
          placeholder="Ej. sin cebolla, bien cocida..."
          placeholderTextColor={COLORS.grisMedio}
        />

        <Text style={g.seccion}>Pedido</Text>
        <View style={g.tarjeta}>
          {!carrito.length ? <Text style={g.textoSuave}>Todavía no agregaste productos.</Text> : null}
          {carrito.map((item) => (
            <View key={`${item.tipo}-${item.id}`} style={g.itemCarrito}>
              <View style={g.filaEntre}>
                <Text style={[g.texto, { flex: 1, fontWeight: "600" }]}>{item.nombre}</Text>
                <Text style={g.texto}>{formatearDinero(item.precio * item.cantidad)}</Text>
              </View>
              {item.maximo !== null ? <Text style={[g.etiquetaTexto, g.textoNo]}>No disponible</Text> : null}
              <View style={[g.fila, { marginTop: 6 }]}>
                <TouchableOpacity
                  style={[g.cantidadBoton, item.cantidad <= item.minimo && g.botonDesactivado]}
                  disabled={item.cantidad <= item.minimo}
                  accessibilityLabel={`Quitar uno de ${item.nombre}`}
                  onPress={() => cambiarCantidad(item, -1)}
                >
                  <MaterialIcons name="remove" size={18} color={COLORS.grisOscuro} />
                </TouchableOpacity>
                <Text style={g.cantidadTexto}>{item.cantidad}</Text>
                <TouchableOpacity
                  style={[g.cantidadBoton, item.maximo !== null && item.cantidad >= item.maximo && g.botonDesactivado]}
                  disabled={item.maximo !== null && item.cantidad >= item.maximo}
                  accessibilityLabel={`Agregar uno de ${item.nombre}`}
                  onPress={() => cambiarCantidad(item, 1)}
                >
                  <MaterialIcons name="add" size={18} color={COLORS.grisOscuro} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <Text style={g.seccion}>Agregar productos</Text>
        <View style={g.buscador}>
          <Ionicons name="search" size={20} color={COLORS.grisMedio} />
          <TextInput
            style={g.buscadorInput}
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar plato o bebida..."
            placeholderTextColor={COLORS.grisMedio}
            autoCorrect={false}
          />
        </View>

        <View style={[g.opciones, { marginBottom: 8 }]}>
          {[
            { valor: "todos", nombre: "Todos" },
            { valor: "plato", nombre: "Platos" },
            { valor: "bebida", nombre: "Bebidas" },
          ].map((opcion) => (
            <TouchableOpacity
              key={opcion.valor}
              style={[g.opcion, tipoActivo === opcion.valor && g.opcionActiva]}
              onPress={() => {
                setTipoActivo(opcion.valor);
                setCategoriaActiva("Todas");
              }}
            >
              <Text style={[g.opcionTexto, tipoActivo === opcion.valor && g.opcionTextoActivo]}>
                {opcion.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Las categorías aparecen solo al elegir Platos o Bebidas, como en la web */}
        {tipoActivo !== "todos" ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }} keyboardShouldPersistTaps="handled">
            <View style={g.fila}>
              {categorias.map((nombre) => (
                <TouchableOpacity
                  key={nombre}
                  style={[g.opcion, categoriaActiva === nombre && g.opcionActiva]}
                  onPress={() => setCategoriaActiva(nombre)}
                >
                  <Text style={[g.opcionTexto, categoriaActiva === nombre && g.opcionTextoActivo]}>{nombre}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        ) : null}

        {/* Recuadro con desplazamiento propio: los productos no alargan toda la pantalla */}
        <ScrollView style={g.grillaContenedor} nestedScrollEnabled keyboardShouldPersistTaps="handled">
          <View style={g.grillaProductos}>
            {visibles.map((producto) => {
              const enCarrito = carrito.find((i) => i.tipo === producto.tipo && i.id === producto.id);
              return (
                <TouchableOpacity
                  key={`${producto.tipo}-${producto.id}`}
                  style={g.productoCard}
                  onPress={() => agregar(producto)}
                  accessibilityRole="button"
                  accessibilityLabel={`Agregar ${producto.nombre}`}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={g.tablaNombre} numberOfLines={2}>{producto.nombre}</Text>
                    <Text style={g.tablaDetalle} numberOfLines={1}>
                      {producto.tipo === "plato" ? "Platos" : "Bebidas"} | {producto.categoria}
                    </Text>
                    <Text style={g.productoPrecio}>{formatearDinero(producto.precio)}</Text>
                  </View>
                  <View style={g.productoAgregar}>
                    <MaterialIcons name="add-circle" size={28} color={COLORS.naranja} />
                    {enCarrito ? <Text style={g.productoCantidad}>{enCarrito.cantidad}</Text> : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          {!visibles.length ? <Text style={g.tablaVacia}>No hay productos para mostrar.</Text> : null}
        </ScrollView>
      </ScrollView>

      {/* El total y el botón quedan fijos abajo, aunque la lista sea larga */}
      <View style={g.pie}>
        {error ? (
          <View style={[g.errorCaja, { marginTop: 0 }]}>
            <MaterialIcons name="error-outline" size={18} color={COLORS.rojo} />
            <Text style={g.errorTexto}>{error}</Text>
          </View>
        ) : null}
        <View style={g.filaEntre}>
          <Text style={[g.seccion, { marginTop: 0, marginBottom: 0 }]}>Total</Text>
          <Text style={g.titulo}>{formatearDinero(total)}</Text>
        </View>
        <TouchableOpacity
          style={[g.boton, guardando && g.botonDesactivado]}
          onPress={guardar}
          disabled={guardando}
        >
          <MaterialIcons name="save" size={18} color={COLORS.blanco} />
          <Text style={g.botonTexto}>
            {guardando ? "Guardando..." : id ? "Guardar cambios" : "Crear comanda"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
