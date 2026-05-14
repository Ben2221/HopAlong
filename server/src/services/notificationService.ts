import axios from 'axios';

/**
 * Utility to send push notifications via Expo's Push API.
 * No special SDK required, just a standard POST request.
 */
export const sendPushNotification = async (expoPushToken: string, title: string, body: string, data: any = {}) => {
  if (!expoPushToken || !expoPushToken.startsWith('ExponentPushToken')) {
    console.log(`[Push] Invalid or missing token: ${expoPushToken}`);
    return;
  }

  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data,
    priority: 'high',
    channelId: 'default',
  };

  try {
    const response = await axios.post('https://exp.host/--/api/v2/push/send', message, {
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
    });
    console.log(`[Push] Sent notification to ${expoPushToken}:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`[Push] Error sending notification:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Send notification to multiple tokens
 */
export const sendMultiplePushNotifications = async (tokens: string[], title: string, body: string, data: any = {}) => {
  const validTokens = tokens.filter(t => t && t.startsWith('ExponentPushToken'));
  if (validTokens.length === 0) return;

  const messages = validTokens.map(token => ({
    to: token,
    sound: 'default',
    title,
    body,
    data,
    priority: 'high',
  }));

  try {
    const response = await axios.post('https://exp.host/--/api/v2/push/send', messages, {
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
    });
    console.log(`[Push] Sent ${validTokens.length} notifications`);
    return response.data;
  } catch (error: any) {
    console.error(`[Push] Error sending multiple notifications:`, error.response?.data || error.message);
  }
};
