import { useLogout } from "../../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Icon } from "@iconify/react";

interface DashboardHeaderProps {
  name: string;
  role?: string;
  walletBalance?: number;
}

const DashboardHeader = ({ name, role, walletBalance }: DashboardHeaderProps) => {
  const { logout } = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 pt-6 pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex flex-row justify-between items-center gap-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <img src="/logo.svg" alt="HopAlong Logo" className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
              </div>
              <span className="text-white font-black text-lg sm:text-xl tracking-tight hidden xs:block">HopAlong</span>
            </Link>
            <div className="h-6 w-[1px] bg-white/20 hidden sm:block mx-1" />
            <div className="overflow-hidden">
              <motion.h1
                className="text-sm sm:text-lg font-bold text-white flex items-center gap-1 leading-none truncate"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Hi, {name.split(" ")[0]}!
              </motion.h1>
              <div className="flex items-center gap-2 mt-0.5">
                 <div className={`px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shrink-0 ${
                  role === 'admin' ? 'bg-red-500 text-white' :
                  role === 'driver' ? 'bg-green-600 text-white' :
                  'bg-blue-600 text-white'
                }`}>
                  <Icon icon={
                    role === 'admin' ? 'mdi:shield-check' :
                    role === 'driver' ? 'mdi:car' : 
                    'mdi:account'
                  } className="text-[10px] sm:text-xs" />
                  <span className="hidden sm:inline">{role}</span>
                </div>
                <span className="text-[9px] sm:text-[10px] text-yellow-100 font-bold flex items-center gap-0.5 shrink-0">
                  <Icon icon="mdi:wallet" className="text-xs sm:text-sm" /> ₹{walletBalance?.toFixed(0) || '0'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 bg-black/10 p-1 sm:p-1.5 rounded-2xl backdrop-blur-sm shrink-0">
            {role === 'admin' && (
              <Link to="/admin" className="hidden sm:block">
                <motion.button
                  className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-500 text-amber-900 px-3 py-1.5 rounded-xl text-xs font-black transition-all shadow-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon icon="mdi:shield-account" className="text-lg" />
                  Admin
                </motion.button>
              </Link>
            )}
            <Link to="/profile">
              <motion.div
                className="h-8 w-8 sm:h-9 sm:w-9 bg-white rounded-xl flex items-center justify-center shadow-md cursor-pointer border-2 border-transparent hover:border-yellow-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <span className="text-yellow-500 text-xs sm:text-sm font-black">
                  {name.charAt(0).toUpperCase()}
                </span>
              </motion.div>
            </Link>
            <motion.button
              onClick={handleLogout}
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Logout"
            >
              <Icon icon="mdi:logout" className="text-base sm:text-lg" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardHeader;
