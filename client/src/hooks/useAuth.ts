import { useState } from "react";
import api from "../services/api";
import { useAuthStore } from "../store/authStore";

interface User {
  id: string;
  name: string;
  email: string;
  role: 'rider' | 'driver';
}

interface Credentials {
  email: string;
  password: string;
  remember?: boolean;
}

interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

interface SignupRequest {
  name: string;
  email: string;
  password: string;
  role: 'rider' | 'driver';
}

export function useLogin() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { login } = useAuthStore();

  const loginUser = async (credentials: Credentials): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      const data = response.data;
      
      if (data.token && data.user) {
        login(data.token, data.user);
        localStorage.setItem('token', data.token);
      }

      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Login failed";
      const errorObj = new Error(errorMessage);
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  };

  return { login: loginUser, loading, error };
}

export function useSignup() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { login } = useAuthStore();

  const signup = async (request: SignupRequest): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post<AuthResponse>('/auth/register', request);
      const data = response.data;
      
      if (data.token && data.user) {
        login(data.token, data.user);
        localStorage.setItem('token', data.token);
      }
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Signup failed";
      const errorObj = new Error(errorMessage);
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  };

  return { signup, loading, error };
}

export function useLogout() {
  const { logout } = useAuthStore();

  const logoutUser = (): void => {
    localStorage.removeItem('token');
    logout();
  };

  return { logout: logoutUser };
}
