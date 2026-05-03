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
    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 pt-6 pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex flex-col sm:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <img src="/logo.svg" alt="HopAlong Logo" className="w-6 h-6 object-contain" />
              </div>
              <span className="text-white font-black text-xl tracking-tight hidden sm:block">HopAlong</span>
            </Link>
            <div className="h-8 w-[1px] bg-white/20 hidden sm:block mx-2" />
            <div>
              <motion.h1
                className="text-lg font-bold text-white flex items-center gap-2 leading-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Hi, {name.split(" ")[0]}!
                {pseudonym && <span className="text-xs font-normal opacity-70">({pseudonym})</span>}
              </motion.h1>
              <div className="flex items-center gap-2 mt-1">
                 <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${
                  role === 'admin' ? 'bg-red-500 text-white' :
                  role === 'driver' ? 'bg-green-600 text-white' :
                  'bg-blue-600 text-white'
                }`}>
                  <Icon icon={
                    role === 'admin' ? 'mdi:shield-check' :
                    role === 'driver' ? 'mdi:car' : 
                    'mdi:account'
                  } />
                  {role}
                </div>
                <span className="text-[10px] text-yellow-100 font-bold flex items-center gap-0.5">
                  <Icon icon="mdi:wallet" className="text-sm" /> ₹{walletBalance?.toFixed(0) || '0'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-black/10 p-1.5 rounded-2xl backdrop-blur-sm">
            {role === 'admin' && (
              <Link to="/admin">
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
                className="h-9 w-9 bg-white rounded-xl flex items-center justify-center shadow-md cursor-pointer border-2 border-transparent hover:border-yellow-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <span className="text-yellow-500 text-sm font-black">
                  {name.charAt(0).toUpperCase()}
                </span>
              </motion.div>
            </Link>
            <motion.button
              onClick={handleLogout}
              className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Logout"
            >
              <Icon icon="mdi:logout" className="text-lg" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardHeader;
