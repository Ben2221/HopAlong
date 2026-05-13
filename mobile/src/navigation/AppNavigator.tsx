import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { 
  LayoutDashboard, 
  History as HistoryIcon, 
  User, 
  MessageSquare, 
  PlusCircle 
} from 'lucide-react-native';

import Dashboard from '../screens/Dashboard';
import Login from '../screens/Login';
import Signup from '../screens/Signup';
import ForgotPassword from '../screens/ForgotPassword';
import RideDetail from '../screens/RideDetail';
import Profile from '../screens/Profile';
import CreateRide from '../screens/CreateRide';
import Chat from '../screens/Chat';
import History from '../screens/History';
import Wallet from '../screens/Wallet';
import SafetyGuidelines from '../screens/SafetyGuidelines';
import { useAuthStore } from '../store/authStore';
import { COLORS } from '../theme/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarShowLabel: false,
      tabBarStyle: styles.tabBar,
      tabBarBackground: () => (
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
      ),
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textMuted,
    })}
  >
    <Tab.Screen 
      name="Home" 
      component={Dashboard} 
      options={{
        tabBarIcon: ({ color, size }) => <LayoutDashboard size={24} color={color} strokeWidth={2.5} />,
      }}
    />
    <Tab.Screen 
      name="Activity" 
      component={History} 
      options={{
        tabBarIcon: ({ color, size }) => <HistoryIcon size={24} color={color} strokeWidth={2.5} />,
      }}
    />
    <Tab.Screen 
      name="Inbox" 
      component={Chat} 
      options={{
        tabBarIcon: ({ color, size }) => <MessageSquare size={24} color={color} strokeWidth={2.5} />,
      }}
    />
    <Tab.Screen 
      name="Profile" 
      component={Profile} 
      options={{
        tabBarIcon: ({ color, size }) => <User size={24} color={color} strokeWidth={2.5} />,
      }}
    />
  </Tab.Navigator>
);

export const AppNavigator = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Signup" component={Signup} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="RideDetail" component={RideDetail} />
          <Stack.Screen name="CreateRide" component={CreateRide} />
          <Stack.Screen name="Wallet" component={Wallet} />
          <Stack.Screen name="SafetyGuidelines" component={SafetyGuidelines} />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 32 : 24,
    left: 24,
    right: 24,
    height: 64,
    borderRadius: 32,
    borderTopWidth: 0,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
});
