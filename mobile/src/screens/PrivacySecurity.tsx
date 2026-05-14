import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar, 
  Switch,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Shield, ShieldOff, Info, UserCheck } from 'lucide-react-native';
import { useTheme } from '../theme/colors';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import CustomAlert from '../components/CustomAlert';

const PrivacySecurity = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const { user, setUser } = useAuthStore();
  const [updating, setUpdating] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'success' as 'success' | 'error' });

  const toggleAnonymity = async (value: boolean) => {
    setUpdating(true);
    try {
      const response = await api.put('/user/privacy', { isAnonymous: value });
      setUser(response.data);
      setAlert({
        visible: true,
        title: 'Status Updated',
        message: `Anonymity mode is now ${value ? 'enabled' : 'disabled'}.`,
        type: 'success'
      });
    } catch (err: any) {
      setAlert({
        visible: true,
        title: 'Update Failed',
        message: err.response?.data?.message || 'Could not update privacy settings.',
        type: 'error'
      });
    } finally {
      setUpdating(false);
    }
  };

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Privacy & Security</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.statusCard, { backgroundColor: colors.cardBg, borderColor: user?.isAnonymous ? colors.success + '40' : colors.border }]}>
          <View style={[styles.iconBox, { backgroundColor: user?.isAnonymous ? colors.success + '15' : colors.primary + '15' }]}>
            {user?.isAnonymous ? (
              <Shield size={32} color={colors.success} strokeWidth={2.5} />
            ) : (
              <UserCheck size={32} color={colors.primary} strokeWidth={2.5} />
            )}
          </View>
          <Text style={[styles.statusTitle, { color: colors.text }]}>
            {user?.isAnonymous ? 'Anonymity Active' : 'Public Profile'}
          </Text>
          <Text style={[styles.statusDesc, { color: colors.textMuted }]}>
            {user?.isAnonymous 
              ? 'Your identity is hidden. Other users will see your pseudonym.' 
              : 'Your real name is visible to other students in the community.'}
          </Text>
        </View>

        <View style={[styles.settingItem, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Anonymous Mode</Text>
            <Text style={[styles.settingSub, { color: colors.textMuted }]}>Hide your identity from others</Text>
          </View>
          {updating ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Switch
              value={user?.isAnonymous}
              onValueChange={toggleAnonymity}
              trackColor={{ false: colors.border, true: colors.success }}
              thumbColor={colors.white}
              ios_backgroundColor={colors.border}
            />
          )}
        </View>

        {user?.isAnonymous && (
          <View style={[styles.pseudonymCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.pseudoHeader}>
              <Info size={16} color={colors.primary} />
              <Text style={[styles.pseudoLabel, { color: colors.primary }]}>YOUR PSEUDONYM</Text>
            </View>
            <Text style={[styles.pseudoName, { color: colors.text }]}>{user?.pseudonym}</Text>
            <Text style={[styles.pseudoHint, { color: colors.textMuted }]}>
              This is the name others will see when you join or host a journey.
            </Text>
          </View>
        )}

        <View style={styles.infoSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Why go anonymous?</Text>
          <View style={styles.infoRow}>
            <Shield size={18} color={colors.textMuted} />
            <Text style={[styles.infoText, { color: colors.textMuted }]}>
              Enhanced privacy for late-night or cross-campus journeys.
            </Text>
          </View>
          <View style={styles.infoRow}>
            <ShieldOff size={18} color={colors.textMuted} />
            <Text style={[styles.infoText, { color: colors.textMuted }]}>
              Prevents personal data exposure to unknown passengers.
            </Text>
          </View>
        </View>
      </ScrollView>

      <CustomAlert 
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, visible: false })}
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
    paddingVertical: 20,
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
  content: {
    padding: 20,
  },
  statusCard: {
    padding: 32,
    borderRadius: 40,
    borderWidth: 1.5,
    alignItems: 'center',
    marginBottom: 32,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 10,
  },
  statusDesc: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    marginBottom: 24,
  },
  settingInfo: {
    flex: 1,
    gap: 4,
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: '800',
  },
  settingSub: {
    fontSize: 14,
    fontWeight: '600',
  },
  pseudonymCard: {
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    marginBottom: 40,
  },
  pseudoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  pseudoLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  pseudoName: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  pseudoHint: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  infoSection: {
    gap: 16,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    lineHeight: 20,
  },
});

export default PrivacySecurity;
