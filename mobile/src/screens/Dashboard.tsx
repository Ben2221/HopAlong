import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
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
  Plus, 
  History as HistoryIcon,
  Bell,
  Settings,
  Search
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
  { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#121212" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] },
  { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] }
];

const Dashboard = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const { user, token } = useAuthStore();
  const [rides, setRides] = useState<any[]>([]);
  const [availableRides, setAvailableRides] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
      setIsRefreshing(true);
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  useEffect(() => {
    // Initial fetch handled by useFocusEffect
    if (token) {
      const socket = initSocket(token);
      socket.on('ride_update', fetchData);
      return () => {
        socket.off('ride_update');
        disconnectSocket();
      };
    }
  }, [token]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={[styles.greeting, { color: colors.text }]}>Hey, {user?.name.split(' ')[0]} 👋</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Ready for a quick hop?</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Bell size={20} color={colors.text} strokeWidth={2.5} />
            <View style={[styles.badge, { backgroundColor: colors.primary }]} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.iconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Profile')}
          >
            <Settings size={20} color={colors.text} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar Trigger */}
      <TouchableOpacity 
        style={[styles.searchBar, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
        onPress={() => navigation.navigate('SearchRides')}
      >
        <Search size={20} color={colors.primary} strokeWidth={2.5} />
        <Text style={[styles.searchPlaceholder, { color: colors.textMuted }]}>Where are you going?</Text>
      </TouchableOpacity>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatsCard 
          label="Balance" 
          value={`₹${(user?.walletBalance || 0).toFixed(2)}`} 
          icon={Wallet} 
          onPress={() => navigation.navigate('Wallet')}
        />
        <StatsCard 
          label="Trips" 
          value={rides.length} 
          icon={HistoryIcon} 
          color={colors.primary} 
        />
      </View>

      {/* Map Section */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Explore Near You</Text>
      </View>
      <View style={[styles.mapContainer, { borderColor: colors.border }]}>
        <MapView
          style={styles.map}
          customMapStyle={isDark ? DARK_MAP_STYLE : []}
          initialRegion={{
            latitude: 9.7523,
            longitude: 76.6500,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
        >
          {availableRides.map((ride) => (
            <Marker
              key={ride._id}
              coordinate={{
                latitude: ride.pickupLocation.coordinates[1],
                longitude: ride.pickupLocation.coordinates[0],
              }}
              onPress={() => navigation.navigate('RideDetail', { id: ride._id })}
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
          <Plus size={28} color={colors.black} strokeWidth={3} />
        </TouchableOpacity>
      </View>

      {/* Your Active Rides */}
      {rides.some(r => r.status === 'active' || r.status === 'pending') && (
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ongoing Journeys</Text>
        </View>
      )}
    </View>
  );

  const activeRides = rides.filter(r => r.status !== 'completed' && r.status !== 'cancelled');

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
      
      <FlatList
        data={availableRides}
        ListHeaderComponent={() => (
          <>
            {renderHeader()}
            {activeRides.length > 0 && (
              <View style={styles.activeSection}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Ongoing Journeys</Text>
                </View>
                {activeRides.map(item => (
                  <View key={item._id} style={styles.rideItemContainer}>
                    <RideCard 
                      ride={item} 
                      onPress={() => navigation.navigate('RideDetail', { id: item._id })} 
                    />
                  </View>
                ))}
              </View>
            )}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Available Journeys</Text>
            </View>
          </>
        )}
        renderItem={({ item }) => (
          <View style={styles.rideItemContainer}>
            <RideCard 
              ride={item} 
              onPress={() => navigation.navigate('RideDetail', { id: item._id })} 
            />
          </View>
        )}
        ListFooterComponent={() => <View style={{ height: 100 }} />}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoading && availableRides.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>No available journeys found near you.</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerContent: {
    paddingBottom: 20,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1.5,
    marginTop: 24,
    marginBottom: 8,
    gap: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  searchPlaceholder: {
    fontSize: 16,
    fontWeight: '700',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#000',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  mapContainer: {
    height: 240,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 32,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  customMarker: {
    padding: 6,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  rideItemContainer: {
    marginBottom: 16,
  },
  moreBtn: {
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 8,
  },
  moreText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  activeSection: {
    marginBottom: 24,
  },
  emptyState: {
    padding: 40,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Dashboard;
