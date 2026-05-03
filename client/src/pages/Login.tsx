// pages/Login.jsx
import { useState } from "react";
import { motion } from "motion/react";
import { Icon } from "@iconify/react";
import AuthLayout from "../components/AuthLayout";
import TextField from "../components/TextField";
import Button from "../components/Button";
import Divider from "../components/Divider";
import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "../hooks/useAuth";

interface Errors {
  email?: string;
  password?: string;
  general?: string;
}

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [errors, setErrors] = useState<Errors>({});
  const navigate = useNavigate();

  // Use our fixed auth hook
  const { login, loading } = useLogin();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    if (errors[name as keyof Errors]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validate = () => {
    const newErrors = {} as Errors;

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      try {
        const result = await login(formData);
        if (result.token) {
          void navigate("/dashboard");
        }
      } catch (err: any) {
        setErrors((prev) => ({
          ...prev,
          general: err.message || "An error occurred during login",
        }));
      }
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your HopAlong account"
    >
      <form
        className="mt-8 space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
      >
        <div className="space-y-4">
          {errors.general && (
            <motion.div
              className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-xl text-sm flex items-start gap-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Icon icon="mdi:alert-circle" className="text-xl shrink-0" />
              <span>{errors.general}</span>
            </motion.div>
          )}

          <TextField
            label="Institute Email ID"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your.email@iiitk.ac.in"
            icon="mdi:email"
            error={errors.email}
            required
            delay={0.1}
          />

          <TextField
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            icon="mdi:lock"
            error={errors.password}
            required
            delay={0.2}
          />

          <div className="flex items-center justify-between mt-4">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-yellow-500 hover:text-amber-500 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <div className="pt-4">
            <Button
              fullWidth
              icon="mdi:login"
              disabled={loading}
              type="submit"
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </div>

          <Divider delay={0.5} />

          <motion.div
            className="text-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-yellow-500 hover:text-amber-500 transition-colors"
              >
                Sign up
              </Link>
            </p>
            <p className="text-xs text-gray-400 mt-4">
              Blocked or suspended? <Link to="/contact" className="text-yellow-500 hover:underline">Contact Support</Link>
            </p>
          </motion.div>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
