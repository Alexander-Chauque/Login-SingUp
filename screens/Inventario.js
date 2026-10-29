import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground, ScrollView, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { inventoryStyles as styles } from '../styles/inventoryStyles';
import { COLORS } from '../styles/colors';

export default function Inventario({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.mainCard}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.titleRow}>
            <View style={styles.boltCircle}>
              <MaterialIcons
                name="inventory-2"
                size={24}
                color={COLORS.naranja}
              />
            </View>
            <View>
              <Text style={styles.title}>Inventario</Text>
              <Text style={styles.subtitle}>
                Selecciona la categoría que deseas gestionar.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.card}
            onPress={() => console.log("Ir a Platos")}
          >
            <Image
              source={require("../assets/inventario/platos.jpg")}
              style={styles.cardImage}
            />
            <View style={styles.iconCircle}>
              <MaterialIcons
                name="restaurant"
                size={24}
                color={COLORS.blanco}
              />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Platos</Text>
              <Text style={styles.cardSubtitle}>
                Gestiona los platos del menú del restaurante.
              </Text>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={COLORS.grisOscuro}
                style={styles.arrow}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => console.log("Ir a Bebidas")}
          >
            <Image
              source={require("../assets/inventario/bebidas.jpg")}
              style={styles.cardImage}
            />
            <View style={styles.iconCircle}>
              <MaterialIcons name="local-bar" size={24} color={COLORS.blanco} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Bebidas</Text>
              <Text style={styles.cardSubtitle}>
                Gestiona las bebidas disponibles.
              </Text>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={COLORS.grisOscuro}
                style={styles.arrow}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("ListaIngredientes")}
          >
            <Image
              source={require("../assets/inventario/ingredientes.jpg")}
              style={styles.cardImage}
            />
            <View style={styles.iconCircle}>
              <MaterialIcons name="eco" size={24} color={COLORS.blanco} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Ingredientes</Text>
              <Text style={styles.cardSubtitle}>
                Gestiona los ingredientes e insumos de cocina.
              </Text>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={COLORS.grisOscuro}
                style={styles.arrow}
              />
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}
