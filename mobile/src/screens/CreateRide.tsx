import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Users, Info, Calendar } from 'lucide-react-native';
import { useTheme, COLORS } from '../theme/colors';
import api from '../services/api';
import PlaceAutocomplete from '../components/PlaceAutocomplete';

const CreateRide = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [from, setFrom] = useState<any>(null);
  const [to, setTo] = useState<any>(null);
  const [maxRiders, setMaxRiders] = useState('4');
  const [fare, setFare] = useState('50');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!from || !to) {
      Alert.alert('Error', 'Please select both pickup and destination');
      return;
    }

    setLoading(true);
    try {
      const rideData = {
        pickupLocation: {
          address: from.formatted,
          coordinates: [from.lon, from.lat]
        },
        dropoffLocation: {
          address: to.formatted,
          coordinates: [to.lon, to.lat]
        },
        maxRiders: parseInt(maxRiders),
        fare: parseInt(fare),
        departureTime: new Date(Date.now() + 30 * 60000).toISOString(), // 30 mins from now
      };

      await api.post('/rides', rideData);
      Alert.alert('Success', 'Your journey has been hosted!');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create ride');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} />
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} 
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color={colors.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Host Journey</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={[styles.introCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
             <View style={[styles.iconCircle, { backgroundColor: colors.primary + '10' }]}>
                <Info size={20} color={colors.primary} strokeWidth={2.5} />
             </View>
             <View style={{ flex: 1 }}>
                <Text style={[styles.introTitle, { color: colors.text }]}>Earn while you commute</Text>
                <Text style={[styles.introText, { color: colors.textMuted }]}>Share your ride with peers and reduce everyone's travel costs.</Text>
             </View>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>PICKUP LOCATION</Text>
              <PlaceAutocomplete 
                placeholder="Where are you starting?" 
                onSelect={setFrom} 
                iconColor={colors.primary} 
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>DESTINATION</Text>
              <PlaceAutocomplete 
                placeholder="Where are you going?" 
                onSelect={setTo} 
                iconColor={colors.text} 
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.textMuted }]}>PASSENGERS</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  <Users size={20} color={colors.textMuted} strokeWidth={2.5} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={maxRiders}
                    onChangeText={setMaxRiders}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.textMuted }]}>EST. FARE (₹)</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 18 }}>₹</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={fare}
                    onChangeText={setFare}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
            onPress={handleCreate}
            activeOpacity={0.9}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color={colors.black} /> : (
              <Text style={styles.submitText}>Host this Journey</Text>
            )}
          </TouchableOpacity>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  content: {
    padding: 24,
  },
  introCard: {
    backgroundColor: COLORS.cardBg,
    padding: 24,
    borderRadius: 32,
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  introTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 4,
  },
  introText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  form: {
    gap: 28,
    marginBottom: 48,
  },
  inputGroup: {
    gap: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.textMuted,
    marginLeft: 4,
    letterSpacing: 1.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 20,
    gap: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  row: {
    flexDirection: 'row',
    gap: 20,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 20,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  submitText: {
    color: COLORS.black,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
});

export default CreateRide;
