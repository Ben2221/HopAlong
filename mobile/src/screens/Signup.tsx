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
  ScrollView,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, User, Mail, Lock, ShieldCheck } from 'lucide-react-native';
import { useTheme } from '../theme/colors';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

const Signup = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (!email.endsWith('@iiitkottayam.ac.in')) {
       setError('Please use your IIITK email');
       return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { user, token } = response.data;
      await login(user, token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
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
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>Join the</Text>
            <Text style={[styles.titleAccent, { color: colors.primary }]}>Community</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>Hop on for a smarter, greener campus commute.</Text>
          </View>

          <View style={styles.form}>
            {error ? <Text style={[styles.errorText, { color: colors.danger, backgroundColor: colors.danger + '15' }]}>{error}</Text> : null}
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>FULL NAME</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <User size={20} color={colors.primary} strokeWidth={2.5} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="John Doe"
                  placeholderTextColor={colors.textMuted}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>IIITK EMAIL</Text>
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
              <Text style={[styles.label, { color: colors.textMuted }]}>PASSWORD</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <Lock size={20} color={colors.primary} strokeWidth={2.5} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Min. 8 characters"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.termsContainer}>
              <ShieldCheck size={16} color={colors.textMuted} />
              <Text style={[styles.termsText, { color: colors.textMuted }]}>By signing up, you agree to our Terms & Safety Guidelines.</Text>
            </View>

            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.primary, shadowColor: colors.primary }]} 
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator color={colors.black} />
              ) : (
                <Text style={[styles.buttonText, { color: colors.black }]}>Create Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.loginLink} 
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={[styles.loginLinkText, { color: colors.textMuted }]}>
                Already have an account? <Text style={{ color: colors.primary }}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 10,
  },
  titleContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 42,
  },
  titleAccent: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 42,
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
  label: {
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 4,
    letterSpacing: 1.5,
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
    marginTop: 8,
  },
  termsText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  button: {
    paddingVertical: 20,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 16,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '900',
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loginLinkText: {
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

export default Signup;
