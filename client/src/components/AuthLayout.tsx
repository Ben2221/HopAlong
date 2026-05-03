// components/AuthLayout.jsx
import { motion } from "motion/react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <motion.header
        className="bg-white shadow-sm py-4"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{
          duration: 0.5,
          type: "spring",
          stiffness: 120
        }}
      >
        <div className="container mx-auto px-4">
          <motion.button
            className="flex items-center gap-2"
            whileHover={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            onClick={() => {
              void navigate("/");
            }}
          >
            <img src="/logo.svg" alt="HopAlong Logo" className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-xl shadow-sm bg-white p-1" />
            <span className="font-bold text-xl sm:text-2xl bg-gradient-to-r from-yellow-400 to-amber-500 text-transparent bg-clip-text">
              HopAlong
            </span>
          </motion.button>
        </div>
      </motion.header>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decorative elements */}
        <motion.div
          className="absolute top-20 right-20 text-yellow-200 opacity-10"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 50,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Icon icon="mdi:car-clock" className="text-9xl" />
        </motion.div>

        <motion.div
          className="absolute bottom-20 left-20 text-amber-200 opacity-10"
          animate={{
            rotate: [0, -360],
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Icon icon="mdi:map-marker-radius" className="text-9xl" />
        </motion.div>

        <motion.div
          className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg relative z-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            type: "spring",
            stiffness: 100,
          }}
          whileHover={{
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          }}
        >
          <div className="text-center">
            <motion.h2
              className="text-3xl font-bold text-gray-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {title}
            </motion.h2>
            <motion.p
              className="mt-2 text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {subtitle}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {children}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
