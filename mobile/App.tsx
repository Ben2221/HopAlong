import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useAuthStore } from './src/store/authStore';
import * as NotificationService from './src/services/NotificationService';
import * as Notifications from 'expo-notifications';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const loadStoredAuth = useAuthStore((state) => state.loadStoredAuth);

  useEffect(() => {
    async function prepare() {
      try {
        console.log("App: Loading stored auth...");
        await loadStoredAuth();
        console.log("App: Auth loaded successfully");
      } catch (e: any) {
        console.error("App: Initialization error", e);
        setInitError(e.message);
      } finally {
        setIsReady(true);
      }
    }
    prepare();
  }, []);

  // Notification Setup
  const setPushToken = useAuthStore(state => state.setPushToken);
  const syncPushToken = useAuthStore(state => state.syncPushToken);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      NotificationService.registerForPushNotificationsAsync().then(token => {
        if (token) {
          setPushToken(token);
          syncPushToken();
        }
      });

      const notificationListener = NotificationService.addNotificationReceivedListener(notification => {
        console.log('Notification Received:', notification);
      });

      // Also listen to socket events and trigger local notifications for testing in Expo Go
      import('./src/services/socket').then(module => {
        const socket = module.getSocket();
        if (socket) {
          socket.on('sos_alert', (data: any) => {
            NotificationService.sendLocalNotification(
              "🚨 EMERGENCY SOS!",
              `${data.userName} has triggered an SOS alert nearby!`,
              data
            );
          });
        }
      });

      const responseListener = NotificationService.addNotificationResponseReceivedListener(response => {
        console.log('Notification Tapped:', response);
        const data = response.notification.request.content.data;
        // Navigation logic can be added here if needed, 
        // but AppNavigator might need a ref or use a global navigation service.
      });

      return () => {
        NotificationService.removeNotificationSubscription(notificationListener);
        NotificationService.removeNotificationSubscription(responseListener);
      };
    }
  }, [isAuthenticated]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
        <ActivityIndicator size="large" color="#FBBF24" />
        <Text style={{ marginTop: 10, color: '#6B7280' }}>Loading HopAlong...</Text>
      </View>
    );
  }

  if (initError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'red', fontWeight: 'bold' }}>Initialization Error</Text>
        <Text>{initError}</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
