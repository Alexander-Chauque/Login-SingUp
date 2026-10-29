import { Platform } from 'react-native';

export const COLORS = {
  naranja: '#F7A12E',
  naranjaOscuro: '#D18A2E',
  grisOscuro: '#4A4A4A',
  grisMedio: '#9B9B9B',
  grisClaro: '#F5F5F5',
  bordeClaro: '#E0E0E0',
  blanco: '#FFFFFF',
  rojo: '#E53935',
  verde: '#4CAF50',
};

export const FONTS = {
  titulo: Platform.select({
    ios: 'Oswald',
    android: 'Oswald_700Bold',
    default: 'Oswald',
  }),
};