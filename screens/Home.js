import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { obtenerResumen, obtenerUsuarioActual } from '../src/config/firestore';
import { homeStyles as styles } from '../styles/homeStyles';
import { COLORS } from '../styles/colors';

export default function Home({ navigation }) {
  const [resumen, setResumen] = useState(null);
  // Se usa el nombre del empleado, no el del perfil de Firebase, que puede ser distinto
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');

  // Pide los números reales a Firestore cada vez que se vuelve a esta pantalla
  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          setError('');
          const [datos, yo] = await Promise.all([obtenerResumen(), obtenerUsuarioActual()]);
          setResumen(datos);
          setNombre(yo.nombre);
        } catch (e) {
          setError(e.message);
        }
      })();
    }, []),
  );

  const getCurrentDate = () => {
    const date = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    let formattedDate = date.toLocaleDateString('es-AR', dateOptions);
    formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
    const formattedTime = date.toLocaleTimeString('es-AR', timeOptions);
    return { date: formattedDate, time: formattedTime };
  };

  const currentDate = getCurrentDate();

  // Guiones mientras no hay datos, en lugar de mostrar números inventados
  const valor = (dato) => (resumen ? String(dato) : '-');
  const porcentajeMesas = resumen?.mesas_totales
    ? (resumen.mesas_ocupadas / resumen.mesas_totales) * 100
    : 0;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeRow}>
          <MaterialIcons name="waving-hand" size={28} color={COLORS.naranja} style={{ marginRight: 8 }} />
          <Text style={styles.welcomeText}>{nombre ? `¡Bienvenido, ${nombre}!` : '¡Bienvenido!'}</Text>
        </View>
        <Text style={styles.subtitleText}>
          Aquí puedes gestionar todas las operaciones del restaurante.
        </Text>

        <View style={styles.dateCard}>
          <MaterialIcons name="calendar-today" size={16} color={COLORS.grisOscuro} />
          <Text style={styles.dateText}>{currentDate.date}</Text>
          <MaterialIcons name="access-time" size={16} color={COLORS.grisOscuro} style={{ margin: 10 }} />
          <Text style={styles.dateText}>{currentDate.time}</Text>
        </View>

        {error ? (
          <Text style={{ color: COLORS.rojo, textAlign: 'center', marginBottom: 12 }}>{error}</Text>
        ) : null}
        {!resumen && !error ? (
          <ActivityIndicator color={COLORS.naranja} style={{ marginBottom: 12 }} />
        ) : null}

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <MaterialIcons name="inventory" size={20} color={COLORS.naranja} />
            <Text style={styles.statNumber}>{valor(resumen?.productos)}</Text>
            <Text style={styles.statLabel}>Productos en inventario</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="table-restaurant" size={20} color={COLORS.naranja} />
            <Text style={styles.statNumber}>
              {resumen ? `${resumen.mesas_ocupadas}/${resumen.mesas_totales}` : '-'}
            </Text>
            <Text style={styles.statLabel}>Mesas ocupadas</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${porcentajeMesas}%` }]} />
            </View>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="receipt-long" size={20} color={COLORS.naranja} />
            <Text style={styles.statNumber}>{valor(resumen?.comandas_pendientes)}</Text>
            <Text style={styles.statLabel}>Comandas pendientes</Text>
          </View>
        </View>

        <View style={styles.sectionTitleRow}>
          <MaterialIcons name="apps" size={20} color={COLORS.naranja} style={{ marginRight: 5, marginBottom: 12 }} />
          <Text style={styles.sectionTitle}>MÓDULOS DEL SISTEMA</Text>
        </View>

        <View style={styles.gridContainer}>
          <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('Inventario')}>
            <MaterialIcons name="inventory" size={24} color={COLORS.naranja} />
            <Text style={styles.gridText}>Inventario</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('ListaEmpleados')}>
            <MaterialIcons name="people" size={24} color={COLORS.naranja} />
            <Text style={styles.gridText}>Empleados</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('Mesas')}>
            <MaterialIcons name="table-restaurant" size={24} color={COLORS.naranja} />
            <Text style={styles.gridText}>Mesas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('Comandas')}>
            <MaterialIcons name="receipt-long" size={24} color={COLORS.naranja} />
            <Text style={styles.gridText}>Comandas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('ListaVentas')}>
            <MaterialIcons name="point-of-sale" size={24} color={COLORS.naranja} />
            <Text style={styles.gridText}>Ventas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('Reportes')}>
            <MaterialIcons name="bar-chart" size={24} color={COLORS.naranja} />
            <Text style={styles.gridText}>Reportes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('Auditoria')}>
            <MaterialIcons name="history" size={24} color={COLORS.naranja} />
            <Text style={styles.gridText}>Auditoría</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
