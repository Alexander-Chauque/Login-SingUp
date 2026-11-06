import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

import { obtenerPermisos, obtenerProducto } from "../src/config/firestore";
import { formatearDinero } from "../src/utils/ayudas";
import { COLORS } from "../styles/colors";
import { gestionStyles as g } from "../styles/gestionStyles";

// Muestra un plato o una bebida. route.params: { tipo: "plato" | "bebida", id }
export default function DetalleProducto({ route, navigation }) {
  const { tipo, id } = route.params;
  const esPlato = tipo === "plato";
  const [producto, setProducto] = useState(null);
  const [puedeEditar, setPuedeEditar] = useState(false);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    try {
      setError("");
      const [datos, permisos] = await Promise.all([obtenerProducto(tipo, id), obtenerPermisos()]);
      setProducto(datos);
      setPuedeEditar(permisos.includes(`${esPlato ? "platos" : "bebidas"}:modificar`));
    } catch (e) {
      setError(e.message);
    }
  }, [tipo, esPlato, id]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

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

  if (!producto) {
    return (
      <View style={g.centro}>
        <ActivityIndicator size="large" color={COLORS.naranja} />
      </View>
    );
  }

  const nombre = esPlato ? producto.nombre_plato : producto.nombre_bebida;
  const precio = esPlato ? producto.precio_plato : producto.precio_bebida;
  const grupo = esPlato ? producto.categoria_nombre : producto.tipo_nombre;
  const descripcion = esPlato ? producto.descripcion_plato : producto.descripcion_bebida;
  const disponible = esPlato ? producto.estado_plato : producto.disponible_bebida;

  return (
    <ScrollView style={g.pantalla} contentContainerStyle={g.contenido}>
      <View style={g.tarjeta}>
        <Text style={g.titulo}>{nombre}</Text>
        <Text style={g.textoSuave}>{grupo}</Text>
        <View style={[g.filaEntre, { marginTop: 10 }]}>
          <Text style={g.importe}>{formatearDinero(precio)}</Text>
          <View style={[g.etiqueta, disponible ? g.etiquetaSi : g.etiquetaNo]}>
            <Text style={[g.etiquetaTexto, disponible ? g.textoSi : g.textoNo]}>
              {disponible ? "Disponible" : "No disponible"}
            </Text>
          </View>
        </View>
        {descripcion ? <Text style={[g.texto, { marginTop: 10 }]}>{descripcion}</Text> : null}
      </View>

      {esPlato ? (
        <View style={g.tarjeta}>
          <Text style={[g.seccion, { marginTop: 0 }]}>Ingredientes</Text>
          {producto.ingredientes.map((ingrediente) => (
            <View key={ingrediente.id_ingrediente} style={[g.filaEntre, { paddingVertical: 4 }]}>
              <Text style={g.texto}>{ingrediente.nombre_ingrediente}</Text>
              {!ingrediente.estado_ingrediente ? (
                <Text style={[g.etiquetaTexto, g.textoNo]}>No disponible</Text>
              ) : null}
            </View>
          ))}
          {!producto.ingredientes.length ? <Text style={g.textoSuave}>Sin ingredientes cargados.</Text> : null}
        </View>
      ) : null}

      {puedeEditar ? (
        <TouchableOpacity
          style={g.boton}
          onPress={() => navigation.navigate(esPlato ? "FormularioPlato" : "FormularioBebida", { id })}
        >
          <MaterialIcons name="edit" size={18} color={COLORS.blanco} />
          <Text style={g.botonTexto}>Editar</Text>
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );
}
