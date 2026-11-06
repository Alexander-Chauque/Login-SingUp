import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { onAuthStateChanged } from "firebase/auth";
import { auth, isFirebaseConfigured } from "../src/config/firebaseConfig";
import { obtenerUsuarioActual } from "../src/config/firestore";
import { COLORS } from "../styles/colors"; 
// Pantallas
import CustomHeader from "../screens/CustomHeader";
import Login from "../screens/Login";
import PrimerIngreso from "../screens/PrimerIngreso";
import SignUp from "../screens/SignUp";
import Home from "../screens/Home";
import Terminos from "../screens/Terminos";
import Recuperar from "../screens/Recuperar";
import Inventario from "../screens/Inventario";
import ListaIngredientes from "../screens/ListaIngredientes"; 
import FormularioIngrediente from "../screens/FormularioIngrediente";
import Mas from "../screens/Mas";
import ListaProductos from "../screens/ListaProductos";
import DetalleProducto from "../screens/DetalleProducto";
import FormularioPlato from "../screens/FormularioPlato";
import FormularioBebida from "../screens/FormularioBebida";
import ListaMesas from "../screens/ListaMesas";
import ListaComandas from "../screens/ListaComandas";
import FormularioComanda from "../screens/FormularioComanda";
import DetalleComanda from "../screens/DetalleComanda";
import ListaEmpleados from "../screens/ListaEmpleados";
import DetalleEmpleado from "../screens/DetalleEmpleado";
import FormularioEmpleado from "../screens/FormularioEmpleado";
import RestablecerContrasena from "../screens/RestablecerContrasena";
import ListaCargos from "../screens/ListaCargos";
import FormularioCargo from "../screens/FormularioCargo";
import PermisosCargo from "../screens/PermisosCargo";
import ListaPermisos from "../screens/ListaPermisos";
import FormularioPermiso from "../screens/FormularioPermiso";
import ListaVentas from "../screens/ListaVentas";
import Reportes from "../screens/Reportes";
import Auditoria from "../screens/Auditoria";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Encabezado con logo y botón de volver, para las listas y detalles
const conEncabezado = ({ navigation }) => ({
  header: () => <CustomHeader navigation={navigation} showBackButton={true} />,
});

// Encabezado con título, para los formularios. Cada formulario define su título.
const conTitulo = {
  header: ({ navigation, options }) => (
    <CustomHeader navigation={navigation} showBackButton={true} titulo={options.title} />
  ),
};

// --- COMPONENTE DE LA BARRA INFERIOR (TABS) ---
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        header: ({ navigation }) => <CustomHeader navigation={navigation} />,
        // Los colores del menú lateral de la web
        tabBarActiveTintColor: COLORS.naranja,
        tabBarInactiveTintColor: "#CCCCCC",
        tabBarLabelStyle: { fontFamily: "Oswald" },
        tabBarStyle: {
          backgroundColor: COLORS.grisOscuro,
          borderTopWidth: 0,
          paddingBottom: 5,
          height: 60,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Inicio")
            iconName = focused ? "home" : "home-outline";
          else if (route.name === "Inventario")
            iconName = focused ? "file-tray-full" : "file-tray-full-outline";
          else if (route.name === "Mesas")
            iconName = focused ? "restaurant" : "restaurant-outline";
          else if (route.name === "Comandas")
            iconName = focused ? "receipt" : "receipt-outline";
          else if (route.name === "Más")
            iconName = focused ? "menu" : "menu-outline";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={Home} />
      <Tab.Screen name="Inventario" component={Inventario} />
      <Tab.Screen name="Mesas" component={ListaMesas} />
      <Tab.Screen name="Comandas" component={ListaComandas} />
      <Tab.Screen name="Más" component={Mas} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const [user, setUser] = useState(undefined);
  // null mientras se consulta. "verificar", "cambiar" o "listo" después.
  const [pasoCuenta, setPasoCuenta] = useState(null);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, setUser);
  }, []);

  const revisarCuenta = useCallback(async () => {
    if (!auth.currentUser) return;
    if (!auth.currentUser.emailVerified) {
      setPasoCuenta("verificar");
      return;
    }
    try {
      const datos = await obtenerUsuarioActual();
      setPasoCuenta(datos.debe_cambiar_contrasena ? "cambiar" : "listo");
    } catch {
      // Sin conexión o sin empleado: cada pantalla muestra el motivo
      setPasoCuenta("listo");
    }
  }, []);

  useEffect(() => {
    setPasoCuenta(null);
    if (user) revisarCuenta();
  }, [user, revisarCuenta]);

  if (!isFirebaseConfigured) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>
          Falta configurar Firebase. Copia .env.example como .env y completa los
          datos de tu proyecto.
        </Text>
      </View>
    );
  }

  if (user === undefined || (user && pasoCuenta === null)) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.naranja} />
      </View>
    );
  }

  // Nadie entra a la app sin verificar el correo y cambiar la contraseña temporal
  if (user && pasoCuenta !== "listo") {
    return <PrimerIngreso paso={pasoCuenta} alTerminar={revisarCuenta} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          // --- RUTAS PARA USUARIOS LOGUEADOS ---
          <>
            <Stack.Screen
              name="MainApp"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ListaIngredientes"
              component={ListaIngredientes}
              options={({ navigation }) => ({
                header: () => (
                  <CustomHeader navigation={navigation} showBackButton={true} />
                ),
              })}
            />
            <Stack.Screen
              name="FormularioIngrediente"
              component={FormularioIngrediente}
              options={{ ...conTitulo, title: "Ingrediente" }}
            />
            <Stack.Screen name="ListaProductos" component={ListaProductos} options={conEncabezado} />
            <Stack.Screen name="DetalleProducto" component={DetalleProducto} options={conEncabezado} />
            <Stack.Screen name="FormularioPlato" component={FormularioPlato} options={conTitulo} />
            <Stack.Screen name="FormularioBebida" component={FormularioBebida} options={conTitulo} />
            <Stack.Screen name="ComandasMesa" component={ListaComandas} options={conEncabezado} />
            <Stack.Screen name="DetalleComanda" component={DetalleComanda} options={conEncabezado} />
            <Stack.Screen name="FormularioComanda" component={FormularioComanda} options={conTitulo} />
            <Stack.Screen name="ListaEmpleados" component={ListaEmpleados} options={conEncabezado} />
            <Stack.Screen name="DetalleEmpleado" component={DetalleEmpleado} options={conEncabezado} />
            <Stack.Screen name="FormularioEmpleado" component={FormularioEmpleado} options={conTitulo} />
            <Stack.Screen name="RestablecerContrasena" component={RestablecerContrasena} options={conTitulo} />
            <Stack.Screen name="ListaCargos" component={ListaCargos} options={conEncabezado} />
            <Stack.Screen name="FormularioCargo" component={FormularioCargo} options={conTitulo} />
            <Stack.Screen name="PermisosCargo" component={PermisosCargo} options={conTitulo} />
            <Stack.Screen name="ListaPermisos" component={ListaPermisos} options={conTitulo} />
            <Stack.Screen name="FormularioPermiso" component={FormularioPermiso} options={conTitulo} />
            <Stack.Screen name="ListaVentas" component={ListaVentas} options={conEncabezado} />
            <Stack.Screen name="Reportes" component={Reportes} options={conEncabezado} />
            <Stack.Screen name="Auditoria" component={Auditoria} options={conEncabezado} />
          </>
        ) : (
          // --- RUTAS PARA USUARIOS NO LOGUEADOS ---
          <>
            <Stack.Screen
              name="Login"
              component={Login}
              options={{ title: "Iniciar sesión", headerShown: false }}
            />
            <Stack.Screen
              name="SignUp"
              component={SignUp}
              options={{ title: "Registro", headerShown: false }}
            />
            <Stack.Screen
              name="Terminos"
              component={Terminos}
              options={({ navigation }) => ({
                // Sin avatar: acá todavía no hay una sesión iniciada
                header: () => (
                  <CustomHeader
                    navigation={navigation}
                    showBackButton={true}
                    mostrarAvatar={false}
                  />
                ),
              })}
            />
            <Stack.Screen
              name="Recuperar"
              component={Recuperar}
              options={{ title: "Recuperar Contraseña", headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  message: { textAlign: "center", fontSize: 16 },
});
