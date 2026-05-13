import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, History as HistoryIcon } from 'lucide-react-native';
import { useTheme } from '../theme/colors';
import api from '../services/api';
import RideCard from '../components/RideCard';

const History = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/rides/history');
        setRides(response.data);
      } catch (err) {
        console.error('History fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const totalSpent = rides.reduce((acc, r) => acc + (r.fare || 0), 0);

  const renderHeader = () => (
    <View style={styles.summaryContainer}>
      <View style={[styles.summaryCard, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.black }]}>{rides.length}</Text>
          <Text style={[styles.summaryLabel, { color: colors.black }]}>Total Trips</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.black }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.black }]}>₹{totalSpent}</Text>
          <Text style={[styles.summaryLabel, { color: colors.black }]}>Total Saved</Text>
        </View>
      </View>
      
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Journeys</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} 
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color={colors.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Activity</Text>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={rides}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <RideCard 
              ride={item} 
              onPress={() => navigation.navigate('RideDetail', { id: item._id })} 
            />
          )}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={[styles.emptyState, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <View style={[styles.emptyIconCircle, { backgroundColor: colors.surface }]}>
                <HistoryIcon size={32} color={colors.textMuted} strokeWidth={2} />
              </View>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>No rides found in your history.</Text>
              <TouchableOpacity 
                style={[styles.bookBtn, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('Dashboard')}
              >
                <Text style={[styles.bookBtnText, { color: colors.black }]}>Start your first hop</Text>
              </TouchableOpacity>
            </View>
          }
          ListFooterComponent={<View style={{ height: 100 }} />}
        />
      )}
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
    paddingVertical: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  summaryContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  summaryCard: {
    borderRadius: 32,
    flexDirection: 'row',
    padding: 24,
    marginBottom: 32,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '800',
    opacity: 0.6,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  divider: {
    width: 1.5,
    opacity: 0.1,
    marginVertical: 10,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    padding: 40,
    borderRadius: 40,
    borderWidth: 1,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontWeight: '700',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
  },
  bookBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 18,
  },
  bookBtnText: {
    fontWeight: '900',
    fontSize: 14,
  },
});

export default History;
