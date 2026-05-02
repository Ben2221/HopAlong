import { useAuthStore } from "../store/authStore";

interface AuthHeaders {
  Authorization: string;
}

interface UseAuthHeaderResult {
  getAuthHeader: () => AuthHeaders;
}

export function useAuthHeader(): UseAuthHeaderResult {
  const { token } = useAuthStore();

  const getAuthHeader = (): AuthHeaders => {
    return {
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  return { getAuthHeader };
}
