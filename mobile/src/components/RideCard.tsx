import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, Users, ArrowRight } from 'lucide-react-native';
import { useTheme } from '../theme/colors';

interface RideCardProps {
  ride: any;
  onPress: () => void;
  isJoinable?: boolean;
  onJoin?: () => void;
}

const RideCard = ({ ride, onPress, isJoinable, onJoin }: RideCardProps) => {
  const { colors } = useTheme();
  const time = new Date(ride.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const seatsLeft = (ride.maxRiders || 0) - (ride.riders?.length || 0);

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]} 
      onPress={onPress} 
      activeOpacity={0.9}
    >
      <View style={styles.header}>
        <View style={[styles.timeBadge, { backgroundColor: colors.primary + '10' }]}>
          <Clock size={14} color={colors.primary} strokeWidth={3} />
          <Text style={[styles.timeText, { color: colors.primary }]}>{time}</Text>
        </View>
        <View style={styles.seatsBadge}>
          <Users size={14} color={colors.textMuted} strokeWidth={2.5} />
          <Text style={[styles.seatsText, { color: colors.textMuted }]}>{seatsLeft} left</Text>
        </View>
      </View>

      <View style={styles.locationContainer}>
        <View style={styles.locationRow}>
          <View style={[styles.dot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.address, { color: colors.text }]} numberOfLines={1}>
            {ride.pickupLocation?.address?.split(',')[0] || 'Unknown'}
          </Text>
        </View>
        <View style={[styles.line, { backgroundColor: colors.border }]} />
        <View style={styles.locationRow}>
          <View style={[styles.dot, { backgroundColor: colors.textMuted }]} />
          <Text style={[styles.address, { color: colors.text }]} numberOfLines={1}>
            {ride.dropoffLocation?.address?.split(',')[0] || 'Unknown'}
          </Text>
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <View>
          <Text style={[styles.costLabel, { color: colors.textMuted }]}>FARE</Text>
          <Text style={[styles.costValue, { color: colors.text }]}>₹{(ride.fare || 0).toFixed(2)}</Text>
        </View>
        {isJoinable ? (
          <TouchableOpacity 
            style={[styles.joinBtn, { backgroundColor: colors.primary }]} 
            onPress={(e) => {
              e.stopPropagation();
              onJoin && onJoin();
            }}
          >
            <Text style={[styles.joinBtnText, { color: colors.black }]}>Hop In</Text>
            <ArrowRight size={16} color={colors.black} strokeWidth={3} />
          </TouchableOpacity>
        ) : (
          <View style={[styles.statusBadge, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statusText, { color: colors.textMuted }]}>{ride.status?.toUpperCase() || 'PENDING'}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 32,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '900',
  },
  seatsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  seatsText: {
    fontSize: 13,
    fontWeight: '700',
  },
  locationContainer: {
    gap: 2,
    marginBottom: 24,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  line: {
    width: 2,
    height: 16,
    marginLeft: 3,
    marginVertical: 2,
  },
  address: {
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
  },
  costLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  costValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 18,
    gap: 8,
  },
  joinBtnText: {
    fontSize: 15,
    fontWeight: '900',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
  },
});

export default RideCard;
