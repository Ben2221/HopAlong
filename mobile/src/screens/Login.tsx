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
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, ArrowRight } from 'lucide-react-native';
import { useTheme } from '../theme/colors';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

const Login = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;
      await login(user, token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
            <Text style={[styles.logoText, { color: colors.black }]}>H</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>HopAlong</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Your Campus Ride Revolution</Text>
        </View>

        <View style={styles.form}>
          {error ? <Text style={[styles.errorText, { color: colors.danger, backgroundColor: colors.danger + '15' }]}>{error}</Text> : null}
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>EMAIL ADDRESS</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <Mail size={20} color={colors.primary} strokeWidth={2.5} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="name@iiitkottayam.ac.in"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: colors.textMuted }]}>PASSWORD</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot?</Text>
              </TouchableOpacity>
            </View>
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

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.primary, shadowColor: colors.primary }]} 
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator color={colors.black} />
            ) : (
              <>
                <Text style={[styles.buttonText, { color: colors.black }]}>Sign In</Text>
                <ArrowRight size={20} color={colors.black} strokeWidth={3} />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.signupLink} 
            onPress={() => navigation.navigate('Signup')}
          >
            <Text style={[styles.signupLinkText, { color: colors.textMuted }]}>
              New to HopAlong? <Text style={{ color: colors.primary }}>Create account</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
           <Text style={[styles.footerText, { color: colors.textMuted }]}>Built for IIIT Kottayam Students</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '900',
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -2,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 10,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 4,
    letterSpacing: 1.5,
  },
  forgotText: {
    fontSize: 11,
    fontWeight: '900',
    marginRight: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 20,
    gap: 14,
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  button: {
    flexDirection: 'row',
    paddingVertical: 20,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 12,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '900',
  },
  signupLink: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  signupLinkText: {
    fontSize: 14,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    padding: 12,
    borderRadius: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.5,
  },
});

export default Login;
