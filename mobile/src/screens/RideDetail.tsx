import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity,
  StatusBar,
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { 
  ChevronLeft, 
  MessageCircle, 
  Shield, 
  MapPin, 
  Users, 
  UserCheck,
  LogOut,
  XCircle,
  CheckCircle2
} from 'lucide-react-native';
import { useTheme } from '../theme/colors';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

const DARK_MAP_STYLE = [
  { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
  { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#121212" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] },
  { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] }
];

const RideDetail = ({ route, navigation }: any) => {
  const { colors, isDark } = useTheme();
  const { id } = route.params;
  const { user } = useAuthStore();
  const [ride, setRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRide = async () => {
    try {
      const response = await api.get(`/rides/${id}`);
      setRide(response.data);
    } catch (err) {
      console.error('RideDetail fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRide();
  }, [id]);

  const handleJoin = async () => {
    setActionLoading(true);
    try {
      await api.post(`/rides/${id}/join`);
      Alert.alert('Success', 'You have joined the journey!');
      fetchRide();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to join ride');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    setActionLoading(true);
    try {
      await api.post(`/rides/${id}/leave`);
      Alert.alert('Success', 'You have left the journey.');
      fetchRide();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to leave ride');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    setActionLoading(true);
    try {
      await api.post(`/rides/${id}/complete`);
      Alert.alert('Success', 'Journey marked as completed!');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to complete ride');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!ride) return null;

  const hostId = ride.host?._id || ride.host;
  const isHost = hostId === user?.id;
  const isRider = ride.riders?.some((r: any) => (r._id || r) === user?.id);
  const isCompleted = ride.status === 'completed';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Map Header */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          customMapStyle={isDark ? DARK_MAP_STYLE : []}
          initialRegion={{
            latitude: ride.pickupLocation?.coordinates[1] || 9.75,
            longitude: ride.pickupLocation?.coordinates[0] || 76.65,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
        >
          {ride.pickupLocation?.coordinates && (
            <Marker
              coordinate={{
                latitude: ride.pickupLocation.coordinates[1],
                longitude: ride.pickupLocation.coordinates[0],
              }}
            >
              <View style={[styles.customMarker, { backgroundColor: colors.primary, borderColor: colors.black }]}>
                <MapPin size={16} color={colors.black} strokeWidth={3} />
              </View>
            </Marker>
          )}
          {ride.dropoffLocation?.coordinates && (
            <Marker
              coordinate={{
                latitude: ride.dropoffLocation.coordinates[1],
                longitude: ride.dropoffLocation.coordinates[0],
              }}
            >
              <View style={[styles.customMarker, { backgroundColor: colors.white, borderColor: colors.black }]}>
                <MapPin size={16} color={colors.black} strokeWidth={3} />
              </View>
            </Marker>
          )}
        </MapView>
        <SafeAreaView style={styles.headerButtons} edges={['top']}>
          <TouchableOpacity 
            style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} 
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color={colors.text} strokeWidth={2.5} />
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      <ScrollView style={[styles.content, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
        <View style={styles.detailsHeader}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>{isHost ? 'Your Journey' : 'Journey Details'}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: isCompleted ? colors.success : colors.primary }]} />
              <Text style={[styles.statusText, { color: colors.textMuted }]}>{ride.status?.toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.fareContainer}>
            <Text style={[styles.fareLabel, { color: colors.textMuted }]}>EST. FARE</Text>
            <Text style={[styles.fareValue, { color: colors.primary }]}>₹{ride.fare}</Text>
          </View>
        </View>

        <View style={[styles.locationCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.locationItem}>
            <View style={[styles.iconCircle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <MapPin size={20} color={colors.primary} strokeWidth={2.5} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.locationLabel, { color: colors.textMuted }]}>PICKUP</Text>
              <Text style={[styles.locationAddress, { color: colors.text }]}>{ride.pickupLocation?.address}</Text>
            </View>
          </View>
            <View style={[styles.locationLine, { backgroundColor: colors.border }]} />
          <View style={styles.locationItem}>
            <View style={[styles.iconCircle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <MapPin size={20} color={colors.white} strokeWidth={2.5} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.locationLabel, { color: colors.textMuted }]}>DROPOFF</Text>
              <Text style={[styles.locationAddress, { color: colors.text }]}>{ride.dropoffLocation?.address}</Text>
            </View>
          </View>
        </View>

        {/* Riders Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users size={18} color={colors.textMuted} strokeWidth={2.5} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Passengers ({ride.riders?.length || 0}/{ride.maxRiders})</Text>
          </View>
          <View style={styles.ridersGrid}>
            {ride.riders?.map((rider: any, i: number) => {
              const rId = rider._id || rider;
              return (
                <View key={i} style={[styles.riderItem, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  <View style={[styles.riderAvatar, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.riderInitial, { color: colors.primary }]}>{rider.name?.charAt(0) || 'U'}</Text>
                  </View>
                  <Text style={[styles.riderName, { color: colors.text }]} numberOfLines={1}>{rider.name || 'Anonymous'}</Text>
                  {rId === hostId && (
                     <View style={[styles.hostLabel, { backgroundColor: colors.primary }]}>
                        <Text style={[styles.hostLabelText, { color: colors.black }]}>HOST</Text>
                     </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ height: 200 }} />
      </ScrollView>

      {/* Action Bar */}
      {!isCompleted && (
        <View style={[styles.actionBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.actionTop}>
            <TouchableOpacity style={[styles.sosBtn, { backgroundColor: colors.danger }]}>
              <Shield size={20} color={colors.white} strokeWidth={2.5} />
              <Text style={[styles.sosText, { color: colors.white }]}>SOS</Text>
            </TouchableOpacity>
            {(isHost || isRider) && (
              <TouchableOpacity 
                style={[styles.chatBtn, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
                onPress={() => navigation.navigate('Main', { screen: 'Chat', params: { rideId: ride._id } })}
              >
                <MessageCircle size={20} color={colors.text} strokeWidth={2.5} />
                <Text style={[styles.chatText, { color: colors.text }]}>Chat</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.mainActions}>
            {isHost ? (
              <>
                <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: colors.danger + '10', borderColor: colors.danger + '30' }]} onPress={() => Alert.alert('Cancel', 'Are you sure?')}>
                  <XCircle size={20} color={colors.danger} strokeWidth={2.5} />
                  <Text style={[styles.cancelText, { color: colors.danger }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.completeBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]} 
                  onPress={handleComplete}
                  disabled={actionLoading}
                >
                  {actionLoading ? <ActivityIndicator color={colors.black} /> : (
                    <>
                      <CheckCircle2 size={20} color={colors.black} strokeWidth={3} />
                      <Text style={[styles.completeText, { color: colors.black }]}>Complete Journey</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            ) : isRider ? (
              <TouchableOpacity 
                style={[styles.leaveBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} 
                onPress={handleLeave}
                disabled={actionLoading}
              >
                {actionLoading ? <ActivityIndicator color={colors.white} /> : (
                  <>
                    <LogOut size={20} color={colors.text} strokeWidth={2.5} />
                    <Text style={[styles.leaveText, { color: colors.text }]}>Leave Journey</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.joinBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]} 
                onPress={handleJoin}
                disabled={actionLoading || (ride.riders?.length || 0) >= ride.maxRiders}
              >
                {actionLoading ? <ActivityIndicator color={colors.black} /> : (
                  <>
                    <UserCheck size={20} color={colors.black} strokeWidth={3} />
                    <Text style={[styles.joinText, { color: colors.black }]}>
                      {(ride.riders?.length || 0) >= ride.maxRiders ? 'Full' : 'Join Journey'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    height: 380,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  headerButtons: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  customMarker: {
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
  },
  content: {
    flex: 1,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -40,
    padding: 24,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  fareContainer: {
    alignItems: 'flex-end',
  },
  fareLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  fareValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  locationCard: {
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    marginBottom: 32,
  },
  locationItem: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  locationLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  locationAddress: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  locationLine: {
    width: 1.5,
    height: 24,
    marginLeft: 21,
    marginVertical: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  ridersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  riderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingRight: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 10,
  },
  riderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  riderInitial: {
    fontSize: 14,
    fontWeight: '900',
  },
  riderName: {
    fontSize: 14,
    fontWeight: '700',
    maxWidth: 100,
  },
  hostLabel: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hostLabelText: {
    fontSize: 8,
    fontWeight: '900',
  },
  actionBar: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderWidth: 1,
    gap: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  actionTop: {
    flexDirection: 'row',
    gap: 12,
  },
  sosBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 18,
    gap: 8,
  },
  sosText: {
    fontSize: 15,
    fontWeight: '900',
  },
  chatBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 18,
    gap: 8,
    borderWidth: 1,
  },
  chatText: {
    fontSize: 15,
    fontWeight: '900',
  },
  mainActions: {
    flexDirection: 'row',
    gap: 12,
  },
  joinBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 22,
    gap: 10,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  joinText: {
    fontSize: 17,
    fontWeight: '900',
  },
  leaveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 22,
    gap: 10,
    borderWidth: 1,
  },
  leaveText: {
    fontSize: 17,
    fontWeight: '900',
  },
  cancelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 22,
    gap: 10,
    borderWidth: 1,
  },
  cancelText: {
    fontSize: 17,
    fontWeight: '900',
  },
  completeBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 22,
    gap: 10,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  completeText: {
    fontSize: 17,
    fontWeight: '900',
  },
});

export default RideDetail;
