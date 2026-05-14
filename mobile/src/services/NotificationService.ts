import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure how notifications should be handled when the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const registerForPushNotificationsAsync = async () => {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    // Get the token
    const projectId = 
      Constants?.expoConfig?.extra?.eas?.projectId ?? 
      Constants?.easConfig?.projectId;
      
    if (!projectId) {
      if (!Constants?.expoConfig?.slug?.includes('expo-go')) {
        console.warn('[Push] Project ID not found. This is required for Expo Push Tokens in SDK 54.');
      }
      return;
    }

    try {
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      })).data;
      console.log('[Push] Expo Push Token obtained:', token);
    } catch (e: any) {
      if (e.message.includes('Expo Go')) {
        console.warn('[Push] Android Remote Notifications are not supported in Expo Go (SDK 54+). Use a Development Build.');
      } else {
        console.error('[Push] Error getting push token:', e.message);
      }
    }
  } else {
    console.log('[Push] Must use physical device for Push Notifications');
  }

  return token;
};

// Listener for when a notification is received while the app is foregrounded
export const addNotificationReceivedListener = (callback: (notification: Notifications.Notification) => void) => {
  return Notifications.addNotificationReceivedListener(callback);
};

// Listener for when a user interacts with a notification (e.g., taps it)
export const addNotificationResponseReceivedListener = (callback: (response: Notifications.NotificationResponse) => void) => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};

export const removeNotificationSubscription = (subscription: Notifications.Subscription) => {
  subscription.remove();
};

// Helper to trigger a local notification (works in Expo Go)
export const sendLocalNotification = async (title: string, body: string, data: any = {}) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: null, // immediate
  });
};
