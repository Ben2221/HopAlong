import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

interface ProtectedRouteResult {
  isAuthenticated: boolean;
}

export function useProtectedRoute(): ProtectedRouteResult {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      void navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return { isAuthenticated };
}
