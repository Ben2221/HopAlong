import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  walletBalance: number;
  pseudonym?: string;
  isAnonymous?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  pushToken: string | null;
  setPushToken: (token: string | null) => void;
  syncPushToken: () => Promise<void>;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  pushToken: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => set({ token }),
  setPushToken: (pushToken) => set({ pushToken }),
  
  syncPushToken: async () => {
    const { token, pushToken } = useAuthStore.getState();
    if (!token || !pushToken) return;
    
    try {
      const api = (await import('../services/api')).default;
      await api.patch('/user/push-token', { pushToken });
      console.log('[Auth] Push token synced with server');
    } catch (e) {
      console.error('[Auth] Failed to sync push token', e);
    }
  },

  login: async (user, token) => {
    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('auth_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('auth_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadStoredAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userJson = await AsyncStorage.getItem('auth_user');
      if (token && userJson) {
        set({ 
          token, 
          user: JSON.parse(userJson), 
          isAuthenticated: true 
        });
      }
    } catch (e) {
      console.error('Failed to load stored auth', e);
    }
  },
}));
