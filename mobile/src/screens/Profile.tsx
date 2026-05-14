import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Wallet, History, Shield, LogOut, Settings, ChevronRight, Lock } from 'lucide-react-native';
import { useTheme } from '../theme/colors';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { sendLocalNotification } from '../services/NotificationService';
import { Bell } from 'lucide-react-native';

const Profile = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const { user, logout, setUser } = useAuthStore();

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Settings size={22} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.profileCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
            <Text style={[styles.avatarText, { color: colors.black }]}>{user?.name.charAt(0)}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>{user?.name}</Text>
            <View style={styles.roleRow}>
              <View style={[styles.roleBadge, { backgroundColor: user?.role === 'admin' ? colors.danger + '20' : colors.primary + '20', borderColor: user?.role === 'admin' ? colors.danger + '40' : colors.primary + '40' }]}>
                <Text style={[styles.roleText, { color: user?.role === 'admin' ? colors.danger : colors.primary }]}>{user?.role?.toUpperCase() || 'STUDENT'}</Text>
              </View>
              {user?.isAnonymous && (
                <View style={[styles.anonBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Shield size={12} color={colors.textMuted} />
                  <Text style={[styles.anonText, { color: colors.textMuted }]}>ANONYMOUS</Text>
                </View>
              )}
            </View>
            <Text style={[styles.userEmail, { color: colors.textMuted }]}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.menu}>
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: colors.cardBg, borderColor: colors.border }]} 
            onPress={() => navigation.navigate('Wallet')}
          >
            <View style={[styles.iconBox, { backgroundColor: colors.primary + '10' }]}>
              <Wallet size={20} color={colors.primary} strokeWidth={2.5} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuLabel, { color: colors.text }]}>Wallet Balance</Text>
              <Text style={[styles.menuValue, { color: colors.primary }]}>₹{(user?.walletBalance || 0).toFixed(2)}</Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: colors.cardBg, borderColor: colors.border }]} 
            onPress={() => navigation.navigate('History')}
          >
            <View style={[styles.iconBox, { backgroundColor: colors.text + '10' }]}>
              <History size={20} color={colors.text} strokeWidth={2.5} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuLabel, { color: colors.text }]}>Ride History</Text>
              <Text style={[styles.menuSub, { color: colors.textMuted }]}>View your past hops</Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: colors.cardBg, borderColor: colors.border }]} 
            onPress={() => navigation.navigate('SafetyGuidelines')}
          >
            <View style={[styles.iconBox, { backgroundColor: colors.danger + '10' }]}>
              <Shield size={20} color={colors.danger} strokeWidth={2.5} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuLabel, { color: colors.text }]}>Safety & Support</Text>
              <Text style={[styles.menuSub, { color: colors.textMuted }]}>Help center & guidelines</Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: colors.cardBg, borderColor: colors.border }]} 
            onPress={() => navigation.navigate('PrivacySecurity')}
          >
            <View style={[styles.iconBox, { backgroundColor: colors.success + '10' }]}>
              <Lock size={20} color={colors.success} strokeWidth={2.5} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuLabel, { color: colors.text }]}>Privacy & Security</Text>
              <Text style={[styles.menuSub, { color: colors.textMuted }]}>
                Mode: {user?.isAnonymous ? 'Anonymous' : 'Public'}
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: colors.cardBg, borderColor: colors.border }]} 
            onPress={() => sendLocalNotification("Notification Test", "This is how HopAlong alerts will look on your device! 🚗💨")}
          >
            <View style={[styles.iconBox, { backgroundColor: colors.primary + '10' }]}>
              <Bell size={20} color={colors.primary} strokeWidth={2.5} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuLabel, { color: colors.text }]}>Test Push Notification</Text>
              <Text style={[styles.menuSub, { color: colors.textMuted }]}>Try out the alert system</Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.logoutBtn, { backgroundColor: colors.danger + '10', borderColor: colors.danger + '40' }]} 
          onPress={() => logout()}
        >
          <LogOut size={20} color={colors.danger} strokeWidth={2.5} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>Log Out</Text>
        </TouchableOpacity>
        
        <View style={{ height: 100 }} />
      </ScrollView>
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
  content: {
    padding: 20,
  },
  profileCard: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 48,
    marginBottom: 40,
    borderWidth: 1,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '900',
  },
  profileInfo: {
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  anonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  anonText: {
    fontSize: 11,
    fontWeight: '800',
  },
  menu: {
    gap: 16,
    marginBottom: 40,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 28,
    gap: 20,
    borderWidth: 1,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 17,
    fontWeight: '800',
  },
  menuValue: {
    fontSize: 15,
    fontWeight: '900',
    marginTop: 4,
  },
  menuSub: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 20,
    borderRadius: 24,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 17,
    fontWeight: '900',
  },
});

export default Profile;
