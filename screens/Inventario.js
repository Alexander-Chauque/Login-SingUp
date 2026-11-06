import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { inventoryStyles as styles } from '../styles/inventoryStyles';
import { COLORS } from '../styles/colors';
import { EncabezadoPagina } from './ComponentesSistema';

// Las tres categorías del inventario: cada una abre su propia pantalla
const CATEGORIAS = [
  {
    titulo: 'Platos',
    texto: 'Gestiona los platos del menú del restaurante.',
    icono: 'restaurant',
    imagen: require('../assets/inventario/platos.jpg'),
    destino: ['ListaProductos', { tipo: 'plato' }],
  },
  {
    titulo: 'Bebidas',
    texto: 'Gestiona las bebidas disponibles.',
    icono: 'local-bar',
    imagen: require('../assets/inventario/bebidas.jpg'),
    destino: ['ListaProductos', { tipo: 'bebida' }],
  },
  {
    titulo: 'Ingredientes',
    texto: 'Gestiona los ingredientes e insumos de cocina.',
    icono: 'eco',
    imagen: require('../assets/inventario/ingredientes.jpg'),
    destino: ['ListaIngredientes'],
  },
];

export default function Inventario({ navigation }) {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <EncabezadoPagina
          icono="inventory-2"
          titulo="Inventario"
          subtitulo="Selecciona la categoría que deseas gestionar."
        />

        {CATEGORIAS.map((categoria) => (
          <TouchableOpacity
            key={categoria.titulo}
            style={styles.card}
            onPress={() => navigation.navigate(...categoria.destino)}
          >
            <Image source={categoria.imagen} style={styles.cardImage} />
            <View style={styles.iconCircle}>
              <MaterialIcons name={categoria.icono} size={28} color={COLORS.blanco} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{categoria.titulo}</Text>
              <Text style={styles.cardSubtitle}>{categoria.texto}</Text>
              <View style={styles.cardButton}>
                <Text style={styles.cardButtonText}>Ingresar</Text>
                <MaterialIcons name="arrow-forward" size={18} color={COLORS.blanco} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
