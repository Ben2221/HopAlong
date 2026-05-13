import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Plus, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react-native';
import { useTheme, COLORS } from '../theme/colors';
import api from '../services/api';

const Wallet = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchWalletData = async () => {
    try {
      const response = await api.get('/user/profile');
      setBalance(response.data.walletBalance || 0);
      // Fetching transactions if the endpoint exists
      try {
        const txResponse = await api.get('/wallet/history');
        setTransactions(txResponse.data || []);
      } catch (e) {
        console.warn('Transactions not available yet');
      }
    } catch (err) {
      console.error('Wallet fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleAddMoney = async () => {
    setActionLoading(true);
    try {
      // For demo/student app, we just add a fixed amount or could prompt for input
      // Let's just add 500 for now as a quick action
      await api.post('/user/wallet/add', { amount: 500 });
      Alert.alert('Success', '₹500 added to your wallet!');
      fetchWalletData();
    } catch (err: any) {
      Alert.alert('Error', 'Failed to add money');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.background === '#FFFFFF' ? 'dark-content' : 'light-content'} />
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} 
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color={colors.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Wallet</Text>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Balance Card */}
          <View style={[styles.balanceCard, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>Current Balance</Text>
              <Text style={styles.balanceValue}>₹{balance}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.addBtn, { backgroundColor: colors.black }]}
              onPress={handleAddMoney}
              disabled={actionLoading}
            >
              {actionLoading ? <ActivityIndicator color={colors.primary} /> : (
                <Plus size={24} color={colors.primary} strokeWidth={3} />
              )}
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionItem} onPress={handleAddMoney}>
              <View style={[styles.actionIcon, { backgroundColor: colors.primary + '15', borderColor: colors.border }]}>
                <ArrowDownLeft size={24} color={colors.primary} strokeWidth={2.5} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.textMuted }]}>Top Up</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem}>
              <View style={[styles.actionIcon, { backgroundColor: colors.success + '15', borderColor: colors.border }]}>
                <ArrowUpRight size={24} color={colors.success} strokeWidth={2.5} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.textMuted }]}>Transfer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem}>
              <View style={[styles.actionIcon, { backgroundColor: colors.white + '10', borderColor: colors.border }]}>
                <Clock size={24} color={colors.text} strokeWidth={2.5} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.textMuted }]}>History</Text>
            </TouchableOpacity>
          </View>

          {/* Transactions */}
          <View style={styles.transactionsSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
              <TouchableOpacity>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
              </TouchableOpacity>
            </View>

            {transactions.length > 0 ? (
              transactions.map((tx, i) => (
                <View key={i} style={[styles.txItem, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  {/* Transaction item implementation */}
                  <View style={[styles.actionIcon, { width: 44, height: 44, backgroundColor: tx.type === 'credit' ? colors.success + '15' : colors.danger + '15' }]}>
                     {tx.type === 'credit' ? (
                        <ArrowDownLeft size={18} color={colors.success} />
                     ) : (
                        <ArrowUpRight size={18} color={colors.danger} />
                     )}
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                     <Text style={{ color: colors.text, fontWeight: '700' }}>{tx.description}</Text>
                     <Text style={{ color: colors.textMuted, fontSize: 12 }}>{new Date(tx.createdAt).toLocaleDateString()}</Text>
                  </View>
                  <Text style={{ color: tx.type === 'credit' ? colors.success : colors.text, fontWeight: '900', fontSize: 16 }}>
                     {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                  </Text>
                </View>
              ))
            ) : (
              <View style={[styles.emptyState, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No recent transactions found.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
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
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  balanceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 40,
    padding: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  balanceInfo: {
    gap: 4,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.black,
    opacity: 0.6,
    textTransform: 'uppercase',
  },
  balanceValue: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.black,
    letterSpacing: -2,
  },
  addBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 48,
  },
  actionItem: {
    alignItems: 'center',
    gap: 12,
  },
  actionIcon: {
    width: 72,
    height: 72,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  transactionsSection: {
    gap: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  emptyState: {
    padding: 40,
    backgroundColor: COLORS.cardBg,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontWeight: '600',
    fontSize: 14,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
});

export default Wallet;
