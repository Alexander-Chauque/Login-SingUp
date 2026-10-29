import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { onAuthStateChanged } from "firebase/auth";
import { auth, isFirebaseConfigured } from "../src/config/firebaseConfig";
import { COLORS } from "../styles/colors"; 
// Pantallas
import CustomHeader from "../screens/CustomHeader";
import Login from "../screens/Login";
import SignUp from "../screens/SignUp";
import Home from "../screens/Home";
import Terminos from "../screens/Terminos";
import Recuperar from "../screens/Recuperar";
import Inventario from "../screens/Inventario";
import ListaIngredientes from "../screens/ListaIngredientes"; 
import FormularioIngrediente from "../screens/FormularioIngrediente";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// --- COMPONENTE DE LA BARRA INFERIOR (TABS) ---
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        header: ({ navigation }) => <CustomHeader navigation={navigation} />,
        tabBarActiveTintColor: COLORS.naranja,
        tabBarActiveTintColor: COLORS.naranja,
        tabBarInactiveTintColor: COLORS.grisMedio,
        tabBarStyle: {
          backgroundColor: COLORS.blanco,
          borderTopWidth: 1,
          borderTopColor: COLORS.bordeClaro,
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
      <Tab.Screen name="Mesas" component={Home} />
      <Tab.Screen name="Comandas" component={Home} />
      <Tab.Screen name="Más" component={Home} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, setUser);
  }, []);

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

  if (user === undefined) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.naranja} />
      </View>
    );
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
              options={{
                title: "Ingrediente",
                headerTintColor: COLORS.naranja,
              }}
            />
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
              options={{ title: "Registro" }}
            />
            <Stack.Screen
              name="Terminos"
              component={Terminos}
              options={{ title: "Terminos y Condiciones" }}
            />
            <Stack.Screen
              name="Recuperar"
              component={Recuperar}
              options={{ title: "Recuperar Contraseña" }}
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
