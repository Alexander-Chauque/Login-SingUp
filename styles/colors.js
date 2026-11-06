import { Platform } from 'react-native';

// Los colores del sistema
export const COLORS = {
  naranja: '#F5A623',
  naranjaOscuro: '#E0951A',
  grisOscuro: '#3D3D3D',
  grisMedio: '#6B7280',
  grisMedioTexto: '#6B7280', // Más oscuro, para leer bien el texto sobre fondo claro
  grisClaro: '#F3F4F6',
  bordeClaro: '#E5E7EB',
  blanco: '#FFFFFF',
  rojo: '#DC2626',
  verde: '#27AE60',
};

export const FONTS = {
  titulo: Platform.select({
    ios: 'Oswald',
    android: 'Oswald_700Bold',
    default: 'Oswald',
  }),
};
