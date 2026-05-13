import { useColorScheme } from 'react-native';

const darkColors = {
  primary: '#E1FF01', // Neon Yellow
  background: '#000000',
  surface: '#121212',
  cardBg: '#181818',
  text: '#FFFFFF',
  textMuted: '#888888',
  border: '#2C2C2C',
  success: '#00FF94',
  danger: '#FF4444',
  warning: '#FFB800',
  white: '#FFFFFF',
  black: '#000000',
  glass: 'rgba(255, 255, 255, 0.08)',
};

const lightColors = {
  primary: '#E1FF01', // Keep primary neon for brand consistency, or use a more readable one
  background: '#F8F9FA',
  surface: '#FFFFFF',
  cardBg: '#FFFFFF',
  text: '#1A1A1A',
  textMuted: '#6C757D',
  border: '#E9ECEF',
  success: '#198754',
  danger: '#DC3545',
  warning: '#FFC107',
  white: '#FFFFFF',
  black: '#000000',
  glass: 'rgba(0, 0, 0, 0.05)',
};

export const useTheme = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return {
    colors,
    isDark,
    COLORS: colors, // For backward compatibility if needed
  };
};

export const COLORS = darkColors; // Default fallback
