import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  StatusBar,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Lock, ArrowRight, CheckCircle2, Key } from 'lucide-react-native';
import { useTheme } from '../theme/colors';
import api from '../services/api';

const ResetPassword = ({ route, navigation }: any) => {
  const { colors, isDark } = useTheme();
  const [token, setToken] = useState(route.params?.token || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleReset = async () => {
    if (!token || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setIsSuccess(true);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
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
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {!isSuccess ? (
          <>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: colors.text }]}>New</Text>
              <Text style={[styles.titleAccent, { color: colors.primary }]}>Password</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>Enter the reset token from your email and your new password.</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>RESET TOKEN</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  <Key size={20} color={colors.primary} strokeWidth={2.5} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Enter token from email"
                    placeholderTextColor={colors.textMuted}
                    value={token}
                    onChangeText={setToken}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>NEW PASSWORD</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  <Lock size={20} color={colors.primary} strokeWidth={2.5} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>CONFIRM PASSWORD</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  <Lock size={20} color={colors.primary} strokeWidth={2.5} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textMuted}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.button, { backgroundColor: colors.primary, shadowColor: colors.primary }]} 
                onPress={handleReset}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.black} />
                ) : (
                  <>
                    <Text style={[styles.buttonText, { color: colors.black }]}>Reset Password</Text>
                    <ArrowRight size={20} color={colors.black} strokeWidth={3} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.successContainer}>
            <View style={[styles.successIcon, { backgroundColor: colors.primary + '10' }]}>
              <CheckCircle2 size={48} color={colors.primary} strokeWidth={3} />
            </View>
            <Text style={[styles.successTitle, { color: colors.text }]}>Success!</Text>
            <Text style={[styles.successSubtitle, { color: colors.textMuted }]}>
              Your password has been reset successfully. You can now login with your new password.
            </Text>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.primary, shadowColor: colors.primary }]} 
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={[styles.buttonText, { color: colors.black }]}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 10 },
  backBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  titleContainer: { marginBottom: 40 },
  title: { fontSize: 42, fontWeight: '900', letterSpacing: -2, lineHeight: 42 },
  titleAccent: { fontSize: 42, fontWeight: '900', letterSpacing: -2, lineHeight: 42 },
  subtitle: { fontSize: 16, fontWeight: '600', marginTop: 12, lineHeight: 22 },
  form: { gap: 20 },
  inputGroup: { gap: 10 },
  label: { fontSize: 11, fontWeight: '900', marginLeft: 4, letterSpacing: 1.5 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderRadius: 20, gap: 14, borderWidth: 1.5 },
  input: { flex: 1, fontSize: 16, fontWeight: '700' },
  button: { flexDirection: 'row', paddingVertical: 20, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginTop: 16, gap: 12, elevation: 10 },
  buttonText: { fontSize: 18, fontWeight: '900' },
  successContainer: { alignItems: 'center', gap: 24 },
  successIcon: { width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  successTitle: { fontSize: 32, fontWeight: '900' },
  successSubtitle: { fontSize: 16, fontWeight: '600', textAlign: 'center', lineHeight: 24, marginBottom: 16 },
});

export default ResetPassword;
