import React from 'react';
import 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { Oswald_400Regular, Oswald_700Bold } from '@expo-google-fonts/oswald';
import { Roboto_400Regular } from '@expo-google-fonts/roboto';
import Navigation from './navigation/Navigation';


export default function App() {
  const [fontsLoaded] = useFonts({
    Oswald: Oswald_400Regular,           
    'Oswald-Bold': Oswald_700Bold,      
    Roboto: Roboto_400Regular,          
    Oswald_400Regular,                    
    Oswald_700Bold,                       
    Roboto_400Regular,                    
  });

  if (!fontsLoaded) {
    return null; 
  }
  return <Navigation />;
}

