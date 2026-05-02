/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Icon } from "@iconify/react";

import AuthLayout from "../components/AuthLayout";
import TextField from "../components/TextField";
import Button from "../components/Button";
import Divider from "../components/Divider";
import { Link, useNavigate } from "react-router-dom";
import { useSignup } from "../hooks/useAuth";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "rider" as "rider" | "driver",
  });

  interface Errors {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Errors>({});
  
  const { signup, loading: signupLoading } = useSignup();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors(prev => ({...prev, [name]: "", general: ""}));
  };

  const handleNext = async () => {
    const newErrors: Errors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!formData.email.endsWith("@iiitkottayam.ac.in") && !formData.email.endsWith("@iiitk.ac.in")) {
      newErrors.email = "Only IIIT Kottayam email addresses are allowed";
    }

    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      navigate('/dashboard');
    } catch (err: any) {
      setErrors({ general: err.message || "Failed to create account" });
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join the HopAlong ride-sharing community"
    >
      <form className="mt-8 space-y-6" onSubmit={(e) => { e.preventDefault(); void handleNext(); }}>
        <AnimatePresence mode="wait">
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
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
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                icon="mdi:account"
                error={errors.name}
                required
                delay={0.1}
              />

              <TextField
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john.doe@example.com"
                icon="mdi:email"
                error={errors.email}
                required
                delay={0.3}
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
                delay={0.4}
              />

              <TextField
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                icon="mdi:lock-check"
                error={errors.confirmPassword}
                required
                delay={0.5}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">I am a...</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm rounded-md"
                >
                  <option value="rider">Rider</option>
                  <option value="driver">Driver</option>
                </select>
              </div>

              <div className="pt-4">
                <Button
                  fullWidth
                  icon="mdi:arrow-right"
                  disabled={signupLoading}
                  type="submit"
                >
                  {signupLoading ? "Creating..." : "Create Account"}
                </Button>
              </div>

              <Divider delay={0.7} />

              <motion.div
                className="text-center mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-medium text-yellow-500 hover:text-amber-500 transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </motion.div>
            </motion.div>
        </AnimatePresence>
      </form>
    </AuthLayout>
  );
};

export default SignUp;
