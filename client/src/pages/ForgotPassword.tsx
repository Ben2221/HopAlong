import { useState } from "react";
import { motion } from "motion/react";
import { Icon } from "@iconify/react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import TextField from "../components/TextField";
import Button from "../components/Button";
import api from "../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{message: string, dev_url?: string} | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(null);

    try {
      const response = await api.post("/auth/forgot-password", { email });
      setSuccess({
        message: response.data.message,
        dev_url: response.data.dev_reset_url
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password?"
      subtitle="Enter your email to receive a password reset link"
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
                <p className="font-bold">Check your email!</p>
                <p>We've sent a password reset link to {email}.</p>
                {success.dev_url && (
                  <div className="mt-4 p-3 bg-white/50 rounded-lg border border-green-200">
                    <p className="font-bold text-green-800 mb-1">Development Reset Link:</p>
                    <a 
                      href={success.dev_url} 
                      className="text-blue-600 underline break-all hover:text-blue-800 font-mono text-xs"
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {success.dev_url}
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {!success && (
            <>
              <TextField
                label="Institute Email ID"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@iiitk.ac.in"
                icon="mdi:email"
                required
              />

              <div className="pt-4">
                <Button
                  fullWidth
                  icon="mdi:send"
                  disabled={loading}
                  type="submit"
                >
                  {loading ? "Sending link..." : "Send Reset Link"}
                </Button>
              </div>
            </>
          )}

          <motion.div
            className="text-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-sm text-gray-600">
              Wait, I remember it!{" "}
              <Link
                to="/login"
                className="font-medium text-yellow-500 hover:text-amber-500 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
