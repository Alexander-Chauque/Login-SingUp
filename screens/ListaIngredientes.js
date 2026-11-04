import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { collection, onSnapshot, query, deleteDoc ,doc, } from "firebase/firestore";
import { db } from "../src/config/firebaseConfig";

// Importamos tus colores y los nuevos estilos
import { COLORS } from "../styles/colors";
import { ingredientStyles as styles } from "../styles/ingredientStyles";
export default function ListaIngredientes({navigation}) {
  const [ingredientes, setIngredientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroActivo, setFiltroActivo] = useState("Todos");
  const [menuVisible, setMenuVisible] = useState(null);
  const botonesMenu = useRef({});
  const [posicionMenu, setPosicionMenu] = useState({
    x: 0,
    y: 0,
  });
  const { width: anchoPantalla, height: altoPantalla } =
    useWindowDimensions();
  const ingredienteMenu = ingredientes.find(
    (item) => item.id === menuVisible
  );
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
    const abrirMenu = (id) => {
      if (menuVisible === id) {
        setMenuVisible(null);
        return;
      }

      const boton = botonesMenu.current[id];

      if (!boton) return;

      boton.measureInWindow((x, y, width, height) => {
        const anchoMenu = 165;
        const altoMenu = 150;

        const posicionX = Math.max(
          8,
          Math.min(
            x + width - anchoMenu,
            anchoPantalla - anchoMenu - 8
          )
        );

        const espacioAbajo = altoPantalla - (y + height);

        const posicionY =
          espacioAbajo >= altoMenu + 10
            ? y + height + 5
            : Math.max(8, y - altoMenu - 5);

        setPosicionMenu({
          x: posicionX,
          y: posicionY,
        });

        setMenuVisible(id);
      });
    };
  // Mostrar detalle
    const verDetalle = (ingrediente) => {
      setMenuVisible(null);
      navigation.navigate("DetalleIngrediente",{ingrediente : ingrediente,});
    };

    // Modificar ingrediente
    const modificarIngrediente = (ingrediente) => {
      setMenuVisible(null);

      navigation.navigate("FormularioIngrediente", {
        ingrediente: ingrediente,
      });
    };

    // Eliminar ingrediente
    const eliminarIngrediente = (ingrediente) => {
      setMenuVisible(null);

      Alert.alert(
        "Eliminar ingrediente",
        `¿Deseas eliminar "${ingrediente.nombre_ingrediente}"?`,
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteDoc(
                  doc(db, "Ingredientes", ingrediente.id)
                );

                Alert.alert(
                  "Eliminado",
                  "El ingrediente se eliminó correctamente."
                );
              } catch (error) {
                console.error("Error al eliminar:", error);

                Alert.alert(
                  "Error",
                  "No se pudo eliminar el ingrediente."
                );
              }
            },
          },
        ]
      );
    };
  const ingredientesFiltrados = ingredientes.filter((ing) => {
    if (filtroActivo === "Todos") return true;
    if (filtroActivo === "Disponible") return ing.estado_ingrediente === true;
    if (filtroActivo === "No disponible")
      return ing.estado_ingrediente === false;
    return true;
  });

  const renderItem = ({ item }) => (
    <View style={[styles.tarjeta,{zIndex: menuVisible === item.id ? 100 : 1, elevation: menuVisible === item.id ? 10 : 2,}]}>
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

        {/* Menú de tres puntos */}
        <TouchableOpacity
          ref={(ref) => {
            botonesMenu.current[item.id] = ref;
          }}
          style={styles.botonAccion}
          onPress={() => abrirMenu(item.id)}
        >
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
      {/* MENÚ DE ACCIONES FLOTANTE */}
      <Modal
        visible={menuVisible !== null}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setMenuVisible(null)}
      >
        <View style={StyleSheet.absoluteFill}>

          {/* Cerrar al tocar fuera */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setMenuVisible(null)}
          />

          {/* Opciones del ingrediente seleccionado */}
          {ingredienteMenu && (
            <View
              style={[
                styles.menuContenedor,
                {
                  position: "absolute",
                  top: posicionMenu.y,
                  left: posicionMenu.x,
                  width: 165,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.opcionMenu}
                onPress={() => verDetalle(ingredienteMenu)}
              >
                <MaterialIcons
                  name="visibility"
                  size={19}
                  color={COLORS.grisOscuro}
                />
                <Text style={styles.textoOpcionMenu}>
                  Ver detalle
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.opcionMenu}
                onPress={() => modificarIngrediente(ingredienteMenu)}
              >
                <MaterialCommunityIcons
                  name="pencil-outline"
                  size={19}
                  color={COLORS.grisOscuro}
                />
                <Text style={styles.textoOpcionMenu}>
                  Modificar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.opcionMenu,
                  styles.opcionEliminar,
                ]}
                onPress={() => eliminarIngrediente(ingredienteMenu)}
              >
                <MaterialIcons
                  name="delete-outline"
                  size={19}
                  color={COLORS.rojo}
                />
                <Text
                  style={[
                    styles.textoOpcionMenu,
                    styles.textoEliminar,
                  ]}
                >
                  Eliminar
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

    </View>
  );
}
