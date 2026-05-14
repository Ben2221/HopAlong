import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/colors';
import { Zap } from 'lucide-react-native';

interface LogoProps {
  size?: number;
  showText?: boolean;
}

const Logo = ({ size = 40, showText = true }: LogoProps) => {
  const { colors } = useTheme();
  
  return (
    <View style={styles.container}>
      <View style={[styles.iconBox, { width: size, height: size, backgroundColor: colors.primary }]}>
        <Zap size={size * 0.6} color={colors.black} fill={colors.black} />
      </View>
      {showText && (
        <View style={styles.textBox}>
          <Text style={[styles.logoText, { color: colors.text, fontSize: size * 0.7 }]}>Hop</Text>
          <Text style={[styles.logoTextAccent, { color: colors.primary, fontSize: size * 0.7 }]}>Along</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-10deg' }],
  },
  textBox: {
    flexDirection: 'row',
  },
  logoText: {
    fontWeight: '900',
    letterSpacing: -1,
  },
  logoTextAccent: {
    fontWeight: '900',
    letterSpacing: -1,
  },
});

export default Logo;
