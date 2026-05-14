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
import Logo from '../components/Logo';

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
        <View style={styles.titleContainer}>
          <Logo size={60} />
          <View style={{ marginTop: 24 }}>
            <Text style={[styles.title, { color: colors.text }]}>Welcome</Text>
            <Text style={[styles.titleAccent, { color: colors.primary }]}>Back</Text>
          </View>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Sign in to continue your journey with the student community.</Text>
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
  titleContainer: {
    marginBottom: 48,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 48,
  },
  titleAccent: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 48,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    lineHeight: 22,
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
});

export default Login;
