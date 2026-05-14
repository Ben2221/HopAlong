import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  StatusBar,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Search, Calendar, MapPin, Navigation } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../theme/colors';
import api from '../services/api';
import PlaceAutocomplete from '../components/PlaceAutocomplete';
import RideCard from '../components/RideCard';

const SearchRides = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const [pickup, setPickup] = useState<any>(null);
  const [destination, setDestination] = useState<any>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!pickup || !destination) {
      // Could add a custom alert here later
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const response = await api.get('/rides/available', {
        params: {
          pickupLat: pickup.lat,
          pickupLng: pickup.lon,
          dropoffLat: destination.lat,
          dropoffLng: destination.lon,
          date: date.toISOString()
        }
      });
      setResults(response.data);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} 
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color={colors.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Find a Journey</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Search Form */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>PICKUP</Text>
            <View style={{ zIndex: 1000 }}>
              <PlaceAutocomplete 
                placeholder="Where from?" 
                onSelect={setPickup} 
                iconColor={colors.primary} 
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>DESTINATION</Text>
            <View style={{ zIndex: 999 }}>
              <PlaceAutocomplete 
                placeholder="Where to?" 
                onSelect={setDestination} 
                iconColor={colors.success} 
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.textMuted }]}>DATE</Text>
              <TouchableOpacity 
                style={[styles.dateBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Calendar size={20} color={colors.primary} strokeWidth={2.5} />
                <Text style={[styles.dateText, { color: colors.text }]}>
                  {date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.searchBtn, { backgroundColor: colors.primary }]}
              onPress={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.black} />
              ) : (
                <>
                  <Search size={22} color={colors.black} strokeWidth={3} />
                  <Text style={[styles.searchBtnText, { color: colors.black }]}>Search</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.resultItem}>
            <RideCard 
              ride={item} 
              onPress={() => navigation.navigate('RideDetail', { 
                id: item._id,
                passengerPickup: pickup,
                passengerDropoff: destination
              })} 
            />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          searched && !loading ? (
            <View style={styles.emptyState}>
              <Navigation size={48} color={colors.textMuted} strokeWidth={1} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                No journeys found matching your route and date. Try hosting one!
              </Text>
            </View>
          ) : !searched ? (
            <View style={styles.emptyState}>
              <Search size={48} color={colors.textMuted} strokeWidth={1} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Enter your journey details to see available rides.
              </Text>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  searchContainer: {
    padding: 20,
    zIndex: 100,
  },
  searchCard: {
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',
  },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    gap: 10,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '700',
  },
  searchBtn: {
    flex: 1,
    height: 54,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  searchBtnText: {
    fontSize: 16,
    fontWeight: '900',
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  resultItem: {
    marginBottom: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
    gap: 16,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default SearchRides;
