import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { 
  Car, 
  Wallet, 
  Star, 
  Activity, 
  Plus, 
  History as HistoryIcon,
  Bell,
  Settings
} from 'lucide-react-native';
import { useTheme, COLORS } from '../theme/colors';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { initSocket, disconnectSocket } from '../services/socket';
import StatsCard from '../components/StatsCard';
import RideCard from '../components/RideCard';

const { width } = Dimensions.get('window');

const DARK_MAP_STYLE = [
  { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#757575" }] },
  { "featureType": "administrative.country", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
  { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#121212" }] },
  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#121212" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#3c3c3c" }] },
  { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#121212" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
];

const Dashboard = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const { user, token } = useAuthStore();
  const [rides, setRides] = useState<any[]>([]);
  const [availableRides, setAvailableRides] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const fetchData = async () => {
    try {
      const [historyRes, availableRes] = await Promise.all([
        api.get('/rides/history'),
        api.get('/rides/available')
      ]);
      setRides(historyRes.data);
      setAvailableRides(availableRes.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (token) {
      initSocket(token);
    }
    return () => disconnectSocket();
  }, [token]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const activeRides = rides.filter(r => r.status !== 'completed' && r.status !== 'cancelled');
  const earnings = rides.reduce((acc, r) => acc + (r.status === 'completed' ? r.fare : 0), 0);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.text }]}>Hey, {user?.name.split(' ')[0]} 👋</Text>
            <Text style={[styles.subGreeting, { color: colors.textMuted }]}>Where are we hopping to today?</Text>
          </View>
          <View style={styles.headerActions}>
             <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Bell size={22} color={colors.text} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.profileBtn}
              onPress={() => navigation.navigate('Profile')}
            >
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={[styles.avatarText, { color: colors.black }]}>{user?.name.charAt(0)}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Map Section */}
        <View style={styles.mapSection}>
          <View style={[styles.mapContainer, { borderColor: colors.border }]}>
            <MapView
              style={styles.map}
              customMapStyle={isDark ? DARK_MAP_STYLE : []}
              initialRegion={{
                latitude: 9.751,
                longitude: 76.649,
                latitudeDelta: 0.04,
                longitudeDelta: 0.04,
              }}
            >
              {availableRides.map((ride) => (
                <Marker
                  key={ride._id}
                  coordinate={{
                    latitude: ride.pickupLocation.coordinates[1],
                    longitude: ride.pickupLocation.coordinates[0],
                  }}
                >
                  <View style={[styles.customMarker, { backgroundColor: colors.primary, borderColor: colors.black }]}>
                    <Car size={14} color={colors.black} strokeWidth={3} />
                  </View>
                </Marker>
              ))}
            </MapView>
            <TouchableOpacity 
              style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.primary }]} 
              onPress={() => navigation.navigate('CreateRide')}
            >
              <Plus size={24} color={colors.black} strokeWidth={3} />
              <Text style={[styles.fabText, { color: colors.black }]}>Host</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.body}>
          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <StatsCard label="Trips" value={rides.length} icon={HistoryIcon} color={colors.primary} />
            <StatsCard label="Savings" value={`₹${earnings}`} icon={Wallet} color={colors.success} />
          </View>

          {/* Active Journeys */}
          {activeRides.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Activity size={20} color={colors.success} strokeWidth={3} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Journeys</Text>
              </View>
              {activeRides.map(ride => (
                <RideCard 
                  key={ride._id} 
                  ride={ride} 
                  onPress={() => navigation.navigate('RideDetail', { id: ride._id })} 
                />
              ))}
            </View>
          )}

          {/* Available Rides */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Car size={20} color={colors.primary} strokeWidth={3} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Nearby Hops</Text>
            </View>
            {availableRides.length > 0 ? (
              availableRides.slice(0, 5).map(ride => (
                <RideCard 
                  key={ride._id} 
                  ride={ride} 
                  isJoinable
                  onPress={() => navigation.navigate('RideDetail', { id: ride._id })}
                  onJoin={() => {/* Handle Join */}}
                />
              ))
            ) : (
              <View style={[styles.emptyState, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No journeys available right now.</Text>
                <TouchableOpacity style={[styles.refreshBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={onRefresh}>
                  <Text style={[styles.refreshBtnText, { color: colors.primary }]}>Check again</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          <View style={{ height: 100 }} /> 
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -1,
  },
  subGreeting: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  profileBtn: {
    padding: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.black,
  },
  mapSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  mapContainer: {
    height: 320,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 24,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  fabText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.black,
  },
  customMarker: {
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  body: {
    paddingHorizontal: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  refreshBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  refreshBtnText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 13,
  },
});

export default Dashboard;
