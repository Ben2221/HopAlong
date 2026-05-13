import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ShieldCheck, Car, Users, MapPin, AlertOctagon } from 'lucide-react-native';
import { useTheme } from '../theme/colors';

const SafetyGuidelines = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  
  const guidelines = [
    {
      icon: ShieldCheck,
      title: "Verify Your Peers",
      desc: "Ensure you ride only with verified IIITK students. Check profile details before starting a journey.",
      color: "#3B82F6"
    },
    {
      icon: Car,
      title: "Vehicle Safety",
      desc: "Drivers must maintain vehicle health. All passengers are required to use seatbelts.",
      color: "#10B981"
    },
    {
      icon: Users,
      title: "Community Respect",
      desc: "Zero tolerance for harassment. We build a safe space for all genders and batches of IIITK.",
      color: "#8B5CF6"
    },
    {
      icon: MapPin,
      title: "Smart Pickups",
      desc: "Always choose well-lit, campus-authorized pickup points. Use the live location feature.",
      color: "#F59E0B"
    }
  ];

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Safety</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Stay Safe.</Text>
          <Text style={[styles.heroTitleAccent, { color: colors.primary }]}>Travel Together.</Text>
          <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
            Guidelines designed by the IIIT Kottayam community for secure journeys.
          </Text>
        </View>

        <View style={styles.grid}>
          {guidelines.map((item, index) => (
            <View key={index} style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
                <item.icon size={24} color={item.color} strokeWidth={2.5} />
              </View>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.cardDesc, { color: colors.textMuted }]}>{item.desc}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.sosCard, { backgroundColor: colors.danger + '10', borderColor: colors.danger + '30' }]}>
          <View style={[styles.sosIconBox, { backgroundColor: colors.danger + '20' }]}>
            <AlertOctagon size={32} color={colors.danger} strokeWidth={2.5} />
          </View>
          <View style={styles.sosContent}>
            <Text style={[styles.sosTitle, { color: colors.danger }]}>Emergency Protocol</Text>
            <Text style={[styles.sosText, { color: colors.textMuted }]}>
              In any unsafe situation, tap the SOS button on the active ride screen. This immediately alerts campus security.
            </Text>
          </View>
        </View>
        
        <View style={{ height: 40 }} />
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
  hero: {
    marginBottom: 40,
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 42,
  },
  heroTitleAccent: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 42,
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
    lineHeight: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  card: {
    width: (Dimensions.get('window').width - 56) / 2,
    padding: 20,
    borderRadius: 32,
    borderWidth: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  sosCard: {
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
  },
  sosIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosContent: {
    flex: 1,
  },
  sosTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  sosText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
});

export default SafetyGuidelines;
