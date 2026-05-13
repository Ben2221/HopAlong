import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  pseudonym: string;
  isAnonymous: boolean;
  walletBalance: number;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;

  // Actions
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setToken: (token: string | null): void => {
        set(() => ({
          token,
          isAuthenticated: !!token,
        }));
      },

      setUser: (user: User | null): void => {
        set(() => ({ user }));
      },

      login: (token: string, user: User): void => {
        set(() => ({
          token,
          user,
          isAuthenticated: true,
        }));
      },

      logout: (): void => {
        set(() => ({
          token: null,
          user: null,
          isAuthenticated: false,
        }));
      },
    }),
    {
      name: "hopalong-auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
