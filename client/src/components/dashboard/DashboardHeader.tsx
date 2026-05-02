import { useLogout } from "../../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Icon } from "@iconify/react";

interface DashboardHeaderProps {
  name: string;
  role?: string;
  pseudonym?: string;
  walletBalance?: number;
}

const DashboardHeader = ({ name, role, pseudonym, walletBalance }: DashboardHeaderProps) => {
  const { logout } = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 pt-12 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <img src="/logo.svg" alt="HopAlong Logo" className="w-8 h-8 object-contain rounded-md shadow-sm" />
              <span className="text-white font-bold text-lg">HopAlong</span>
            </div>
            <motion.h1
              className="text-2xl sm:text-3xl font-bold text-white mb-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Welcome, {name.split(" ")[0]}! {pseudonym && <span className="text-sm font-normal opacity-70">({pseudonym})</span>}
            </motion.h1>
            <motion.p
              className="text-yellow-100 text-sm flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {role === "driver" ? "🚗 Driver Dashboard" : "🛺 Rider Dashboard"}
              <span className="opacity-50">|</span>
              <span className="font-bold flex items-center gap-1">
                <Icon icon="mdi:wallet" /> ₹{walletBalance?.toFixed(2) || '0.00'}
              </span>
            </motion.p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/profile">
              <motion.div
                className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer border-2 border-transparent hover:border-yellow-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <span className="text-yellow-500 text-xl font-bold">
                  {name.charAt(0).toUpperCase()}
                </span>
              </motion.div>
            </Link>
            <motion.button
              onClick={handleLogout}
              className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon icon="mdi:logout" className="text-lg" />
              Logout
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardHeader;
