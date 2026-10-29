import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../src/config/firebaseConfig";

// Importamos tus colores y los nuevos estilos
import { COLORS } from "../styles/colors";
import { ingredientStyles as styles } from "../styles/ingredientStyles";

export default function ListaIngredientes({navigation}) {
  const [ingredientes, setIngredientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroActivo, setFiltroActivo] = useState("Todos");

  useEffect(() => {
    const q = query(collection(db, "Ingredientes"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = [];
      snapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      setIngredientes(lista);
      setCargando(false);
    });
    return () => unsubscribe();
  }, []);

  const ingredientesFiltrados = ingredientes.filter((ing) => {
    if (filtroActivo === "Todos") return true;
    if (filtroActivo === "Disponible") return ing.estado_ingrediente === true;
    if (filtroActivo === "No disponible")
      return ing.estado_ingrediente === false;
    return true;
  });

  const renderItem = ({ item }) => (
    <View style={styles.tarjeta}>
      <Image
        source={{
          uri: item.img_ingrediente || "https://via.placeholder.com/150",
        }}
        style={styles.imagen}
      />

      <View style={styles.infoContenedor}>
        <Text style={styles.nombre}>{item.nombre_ingrediente}</Text>
        <Text style={styles.descripcion} numberOfLines={1}>
          Descripción breve
        </Text>

        <View style={styles.precioRow}>
          <Text style={styles.precio}>Gs. {item.precio_ingrediente}</Text>
          <View style={styles.unidadBadge}>
            <Text style={styles.unidadTexto}>{item.unidad}</Text>
          </View>
        </View>

        <View
          style={[
            styles.estadoBadge,
            item.estado_ingrediente
              ? styles.badgeDisponible
              : styles.badgeNoDisponible,
          ]}
        >
          <Text
            style={[
              styles.estadoTexto,
              item.estado_ingrediente ? styles.textoVerde : styles.textoRojo,
            ]}
          >
            {item.estado_ingrediente ? "Disponible" : "No disponible"}
          </Text>
        </View>
      </View>

      <View style={styles.acciones}>
        <TouchableOpacity
          style={styles.botonAccion}
          onPress={() => navigation.navigate("FormularioIngrediente", { ingrediente: item })}
        >
          <MaterialCommunityIcons
            name="pencil-outline"
            size={20}
            color={COLORS.grisMedio}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.botonAccion}>
          <MaterialIcons
            name="more-vert"
            size={24}
            color={COLORS.grisMedio}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.mainCard}>
        <View style={styles.scrollContent}>
          <View style={styles.titleRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Ingredientes</Text>
              <Text style={styles.subtitle}>
                Gestiona los ingredientes del inventario
              </Text>
            </View>
            <TouchableOpacity
              style={styles.botonNuevo}
              onPress={() => navigation.navigate("FormularioIngrediente")}
            >
              <MaterialIcons name="add" size={18} color={COLORS.blanco} />
              <Text style={styles.textoBotonNuevo}>Nuevo</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.busquedaContenedor}>
            <View style={styles.inputBusqueda}>
              <Ionicons name="search" size={20} color={COLORS.grisMedio} />
              <TextInput
                placeholder="Buscar ingrediente..."
                style={styles.input}
                placeholderTextColor={COLORS.grisMedio}
              />
            </View>
            <TouchableOpacity style={styles.botonFiltro}>
              <MaterialIcons
                name="filter-list"
                size={24}
                color={COLORS.grisOscuro}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.filtrosRow}>
            {["Todos", "Disponible", "No disponible"].map((filtro) => (
              <TouchableOpacity
                key={filtro}
                style={[
                  styles.pildora,
                  filtroActivo === filtro && styles.pildoraActiva,
                ]}
                onPress={() => setFiltroActivo(filtro)}
              >
                <Text
                  style={[
                    styles.textoPildora,
                    filtroActivo === filtro && styles.textoPildoraActiva,
                  ]}
                >
                  {filtro}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {cargando ? (
            <ActivityIndicator
              size="large"
              color={COLORS.naranja}
              style={{ marginTop: 50 }}
            />
          ) : (
            <FlatList
              data={ingredientesFiltrados}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("FormularioIngrediente")}>
          <MaterialIcons name="add" size={32} color={COLORS.blanco} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
