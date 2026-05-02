import { useState } from "react";
import { motion } from "motion/react";
import { Icon } from "@iconify/react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import TextField from "../components/TextField";
import Button from "../components/Button";
import api from "../services/api";

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/auth/reset-password", {
        token,
        password: formData.password
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your new password below"
    >
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          {error && (
            <motion.div
              className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-xl text-sm flex items-start gap-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Icon icon="mdi:alert-circle" className="text-xl shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-xl text-sm flex items-start gap-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Icon icon="mdi:check-circle" className="text-xl shrink-0" />
              <div>
                <p className="font-bold">Password Reset Successful!</p>
                <p>Redirecting you to the login page...</p>
              </div>
            </motion.div>
          )}

          {!success && (
            <>
              <TextField
                label="New Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
                icon="mdi:lock"
                required
              />

              <TextField
                label="Confirm New Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                placeholder="••••••••"
                icon="mdi:lock-check"
                required
              />

              <div className="pt-4">
                <Button
                  fullWidth
                  icon="mdi:lock-reset"
                  disabled={loading || !token}
                  type="submit"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
              </div>
            </>
          )}

          <div className="text-center mt-6">
            <Link
              to="/login"
              className="text-sm font-medium text-yellow-500 hover:text-amber-500 transition-colors"
            >
              Back to Sign in
            </Link>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
