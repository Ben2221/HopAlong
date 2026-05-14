import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/colors';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: any;
  color?: string;
  onPress?: () => void;
}

const StatsCard = ({ label, value, icon: Icon, color, onPress }: StatsCardProps) => {
  const { colors } = useTheme();
  const themeColor = color || colors.primary;

  const Content = (
    <>
      <View style={[styles.iconContainer, { backgroundColor: themeColor + '15' }]}>
        <Icon size={22} color={themeColor} strokeWidth={2.5} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      </View>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {Content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      {Content}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 32,
    flex: 1,
    margin: 6,
    borderWidth: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    minHeight: 140,
  },
  iconContainer: {
    padding: 12,
    borderRadius: 20,
    marginBottom: 16,
  },
  content: {
    gap: 2,
  },
  value: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default StatsCard;
