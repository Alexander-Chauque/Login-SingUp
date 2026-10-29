import React from 'react';
import 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { Oswald_400Regular, Oswald_700Bold } from '@expo-google-fonts/oswald';
import Navigation from './navigation/Navigation';


export default function App() {
  const [fontsLoaded] = useFonts({
    Oswald: Oswald_400Regular,           
    'Oswald-Bold': Oswald_700Bold,              
    Oswald_400Regular,         
    Oswald_700Bold,
  });

  if (!fontsLoaded) {
    return null; 
  }
  return <Navigation />;
}

