import React from 'react';
import { View, Text, TouchableOpacity, Image, ImageBackground, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { homeStyles as styles } from '../styles/homeStyles';
import { COLORS } from '../styles/colors';

export default function Home({ navigation }) {
  const handleLogOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al cerrar sesión.");
    }
  };

  // Obtener el nombre del usuario logueado
  const fullName = auth.currentUser?.displayName || 'Usuario autenticado';

  const getInitials =(name) =>{
    if (!name) return'??'; 

  const words = name.trim().split(' ')

  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  const firstInitial = words[0].charAt(0);
  const lastInitial =words[words.length -1].charAt(0);

  return (firstInitial + lastInitial).toUpperCase();
};

  const userInitials = getInitials(fullName);

  const getCurrentDate = () => {
    const date =new Date();

    const dateOptions = {weekday:'long', year:'numeric', month:'long', day:'numeric'};

    let formattedDate = date.toLocaleDateString('es-AR', dateOptions);

    formattedDate = formattedDate.charAt(0).toUpperCase()+formattedDate.slice(1);

    const timeOptions ={hour: '2-digit', minute:'2-digit', hour12:false};
    const formattedTime = date.toLocaleTimeString('es-AR', timeOptions);
    return{date:formattedDate, time:formattedTime}
  };

  const currentDate = getCurrentDate();
  return (
    <View style={styles.container}>
            <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeRow}>
          <MaterialIcons
            name="waving-hand"
            size={28}
            color={COLORS.naranja}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.welcomeText}>¡Bienvenido, {fullName}!</Text>
        </View>
        <Text style={styles.subtitleText}>
          Aquí puedes gestionar todas las operaciones del restaurante.
        </Text>

        <View style={styles.dateCard}>
          <MaterialIcons
            name="calendar-today"
            size={16}
            color={COLORS.grisOscuro}
          />
          <Text style={styles.dateText}>{currentDate.date}</Text>
          <MaterialIcons
            name="access-time"
            size={16}
            color={COLORS.grisOscuro}
            style={{ margin: 10 }}
          />
          <Text style={styles.dateText}>{currentDate.time}</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <MaterialIcons name="inventory" size={20} color={COLORS.naranja} />
            <Text style={styles.statNumber}>122</Text>
            <Text style={styles.statLabel}>Productos en inventario</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons
              name="table-restaurant"
              size={20}
              color={COLORS.naranja}
            />
            <Text style={styles.statNumber}>9/10</Text>
            <Text style={styles.statLabel}>Mesas ocupadas</Text>
            <View style={styles.progressBarBg}>
              <View style={styles.progressBarFill} />
            </View>
          </View>

          <View style={styles.statCard}>
            <MaterialIcons
              name="receipt-long"
              size={20}
              color={COLORS.naranja}
            />
            <Text style={styles.statNumber}>6</Text>
            <Text style={styles.statLabel}>Comandas pendientes</Text>
          </View>
        </View>
        <View style={styles.sectionTitleRow}>
          <MaterialIcons
            name="apps"
            size={20}
            color={COLORS.naranja}
            style={{ marginRight: 5, marginBottom:12 }}
          />
          <Text style={styles.sectionTitle}>MÓDULOS DEL SISTEMA</Text>
        </View>

        <View style={styles.gridContainer}>
          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => navigation.navigate("Inventario")}
          >
            <MaterialIcons name="inventory" size={24} color={COLORS.naranja} />
            <Text style={styles.gridText}>Inventario</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridItem}>
            <MaterialIcons name="people" size={24} color={COLORS.naranja} />
            <Text style={styles.gridText}>Empleados</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridItem}>
            <MaterialIcons
              name="table-restaurant"
              size={24}
              color={COLORS.naranja}
            />
            <Text style={styles.gridText}>Mesas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridItem}>
            <MaterialIcons
              name="receipt-long"
              size={24}
              color={COLORS.naranja}
            />
            <Text style={styles.gridText}>Comandas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridItem}>
            <MaterialIcons
              name="point-of-sale"
              size={24}
              color={COLORS.naranja}
            />
            <Text style={styles.gridText}>Ventas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridItem}>
            <MaterialIcons name="bar-chart" size={24} color={COLORS.naranja} />
            <Text style={styles.gridText}>Reportes</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridItem}>
            <MaterialIcons name="history" size={24} color={COLORS.naranja} />
            <Text style={styles.gridText}>Auditoría</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}