import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Users, Info, Calendar, Car, Clock, MapPin } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme, COLORS } from '../theme/colors';
import api from '../services/api';
import PlaceAutocomplete from '../components/PlaceAutocomplete';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { getSocket, initSocket } from '../services/socket';
import { useAuthStore } from '../store/authStore';

const CreateRide = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const { token } = useAuthStore();
  const [from, setFrom] = useState<any>(null);
  const [to, setTo] = useState<any>(null);
  const [maxRiders, setMaxRiders] = useState('4');
  const [departureTime, setDepartureTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [routePoints, setRoutePoints] = useState<any[]>([]);

  useEffect(() => {
    if (from && to) {
      fetchRoute();
    } else {
      setRoutePoints([]);
    }
  }, [from, to]);

  const fetchRoute = async () => {
    try {
      const response = await api.get('/rides/route', {
        params: {
          startLat: from.lat,
          startLng: from.lon,
          endLat: to.lat,
          endLng: to.lon,
        }
      });
      setRoutePoints(response.data);
    } catch (err) {
      console.error('Route fetch error:', err);
    }
  };

  useEffect(() => {
    const socket = getSocket() || initSocket(token || "");
    
    const handleSuccess = (data: { rideId: string }) => {
      console.log("Ride creation success:", data);
      setIsSubmitting(false);
      Alert.alert("Success", "Ride request created! Searching for hosts...");
      navigation.navigate('RideDetail', { id: data.rideId });
    };

    const handleFailure = (data: { message: string }) => {
      console.error("Ride creation failure:", data);
      setIsSubmitting(false);
      Alert.alert("Error", data.message || "Failed to create ride");
    };

    socket.on('ride_request_success', handleSuccess);
    socket.on('ride_request_failed', handleFailure);

    return () => {
      socket.off('ride_request_success', handleSuccess);
      socket.off('ride_request_failed', handleFailure);
    };
  }, [token, navigation]);

  const handleCreate = async () => {
    if (!from || !to) {
      Alert.alert("Missing Locations", "Please select both pickup and destination.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log("[CreateRide] Fetching estimate...");
      // 1. Get fare estimate
      const response = await api.post('/rides/estimate', {
        pickupLocation: { lat: from.lat, lng: from.lon },
        dropoffLocation: { lat: to.lat, lng: to.lon }
      });

      const fare = response.data.fare;
      console.log("[CreateRide] Fare estimated:", fare);

      // 2. Initialize socket and emit request
      const socket = getSocket() || initSocket(token || "");
      
      console.log("[CreateRide] Emitting request_ride...");
      socket.emit('request_ride', {
        pickup: { lat: from.lat, lng: from.lon, address: from.formatted },
        dropoff: { lat: to.lat, lng: to.lon, address: to.formatted },
        fare,
        isPublic: true,
        maxRiders: parseInt(maxRiders),
        departureTime: departureTime
      });

    } catch (err: any) {
      console.error("[CreateRide] Catch block error:", err);
      Alert.alert("Error", err.response?.data?.message || "Failed to initiate ride creation.");
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          customMapStyle={isDark ? DARK_MAP_STYLE : []}
          region={{
            latitude: from?.lat || to?.lat || 9.75,
            longitude: from?.lon || to?.lon || 76.65,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {from && (
            <Marker coordinate={{ latitude: from.lat, longitude: from.lon }} title="Pickup">
              <View style={[styles.marker, { backgroundColor: colors.primary }]}>
                <Car size={14} color={colors.black} />
              </View>
            </Marker>
          )}
          {to && (
            <Marker coordinate={{ latitude: to.lat, longitude: to.lon }} title="Destination">
              <View style={[styles.marker, { backgroundColor: colors.success }]}>
                <MapPin size={14} color={colors.black} />
              </View>
            </Marker>
          )}
          {routePoints.length > 0 ? (
            <Polyline
              coordinates={routePoints}
              strokeColor={colors.primary}
              strokeWidth={4}
            />
          ) : from && to && (
            <Polyline
              coordinates={[
                { latitude: from.lat, longitude: from.lon },
                { latitude: to.lat, longitude: to.lon }
              ]}
              strokeColor={colors.primary}
              strokeWidth={4}
              lineDashPattern={[5, 5]}
            />
          )}
        </MapView>
      </View>

      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color={colors.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Host a Journey</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>PICKUP LOCATION</Text>
              <View style={{ zIndex: 1000 }}>
                <PlaceAutocomplete 
                  placeholder="Where from?" 
                  onSelect={(loc) => setFrom(loc)}
                  iconColor={colors.primary}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>DESTINATION</Text>
              <View style={{ zIndex: 999 }}>
                <PlaceAutocomplete 
                  placeholder="Where to?" 
                  onSelect={(loc) => setTo(loc)}
                  iconColor={colors.success}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.textMuted }]}>DEPARTURE TIME</Text>
                <TouchableOpacity 
                  style={[styles.selectionRow, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Clock size={20} color={colors.primary} strokeWidth={2.5} />
                  <Text style={[styles.selectionText, { color: colors.text }]}>
                    {departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <Calendar size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.textMuted }]}>MAX RIDERS</Text>
                <View style={[styles.selectionRow, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  <Users size={20} color={colors.primary} strokeWidth={2.5} />
                  <Text style={[styles.selectionText, { color: colors.text }]}>{maxRiders}</Text>
                  <View style={styles.counterRow}>
                    <TouchableOpacity 
                      onPress={() => setMaxRiders(Math.max(1, parseInt(maxRiders) - 1).toString())}
                      style={[styles.countBtn, { backgroundColor: colors.surface }]}
                    >
                      <Text style={{ color: colors.text, fontWeight: '900' }}>-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => setMaxRiders(Math.min(6, parseInt(maxRiders) + 1).toString())}
                      style={[styles.countBtn, { backgroundColor: colors.surface }]}
                    >
                      <Text style={{ color: colors.text, fontWeight: '900' }}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {showTimePicker && (
              <DateTimePicker
                value={departureTime}
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowTimePicker(false);
                  if (selectedDate) setDepartureTime(selectedDate);
                }}
              />
            )}

            <View style={[styles.infoBox, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
              <Info size={20} color={colors.primary} strokeWidth={2.5} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                You'll earn rewards for every rider who joins your journey.
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.createBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
            onPress={handleCreate}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.black} />
            ) : (
              <>
                <Text style={[styles.createBtnText, { color: colors.black }]}>Launch Journey</Text>
                <Car size={20} color={colors.black} strokeWidth={3} />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const DARK_MAP_STYLE = [
  { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
  { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#121212" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] },
  { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    height: 200,
    width: '100%',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  marker: {
    padding: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 14,
  },
  selectionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  counterRow: {
    flexDirection: 'row',
    gap: 10,
  },
  countBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    gap: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  createBtn: {
    height: 64,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  createBtnText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});

export default CreateRide;
