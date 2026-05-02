import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "rider" | "driver" | "admin";
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate("/login", { replace: true });
      return;
    }
    if (requiredRole && user.role !== requiredRole) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, user, navigate, requiredRole]);

  if (!isAuthenticated || !user) return null;
  if (requiredRole && user.role !== requiredRole) return null;

  return <>{children}</>;
};

export default ProtectedRoute;
