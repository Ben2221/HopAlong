import { useColorScheme } from 'react-native';

const darkColors = {
  primary: '#EAB308', // Vibrant Golden Yellow
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
  primary: '#EAB308', // Vibrant Golden Yellow
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
