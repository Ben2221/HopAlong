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
import RideDetail from '../screens/RideDetail';
import ForgotPassword from '../screens/ForgotPassword';
import ResetPassword from '../screens/ResetPassword';
import Profile from '../screens/Profile';
import CreateRide from '../screens/CreateRide';
import Chat from '../screens/Chat';
import History from '../screens/History';
import Wallet from '../screens/Wallet';
import SafetyGuidelines from '../screens/SafetyGuidelines';
import PrivacySecurity from '../screens/PrivacySecurity';
import SearchRides from '../screens/SearchRides';
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
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textMuted,
      tabBarHideOnKeyboard: true,
    })}
  >
    <Tab.Screen 
      name="Dashboard" 
      component={Dashboard} 
      options={{
        tabBarIcon: ({ color, size }) => <LayoutDashboard size={24} color={color} strokeWidth={2.5} />,
      }}
    />
    <Tab.Screen 
      name="History" 
      component={History} 
      options={{
        tabBarIcon: ({ color, size }) => <HistoryIcon size={24} color={color} strokeWidth={2.5} />,
      }}
    />
    <Tab.Screen 
      name="Chat" 
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
          <Stack.Screen name="ResetPassword" component={ResetPassword} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="RideDetail" component={RideDetail} />
          <Stack.Screen name="CreateRide" component={CreateRide} />
          <Stack.Screen name="Wallet" component={Wallet} />
          <Stack.Screen name="SafetyGuidelines" component={SafetyGuidelines} />
          <Stack.Screen name="PrivacySecurity" component={PrivacySecurity} />
          <Stack.Screen name="SearchRides" component={SearchRides} />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2C',
    backgroundColor: '#121212',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
});
