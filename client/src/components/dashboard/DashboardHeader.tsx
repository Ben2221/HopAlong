import { useLogout } from "../../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Icon } from "@iconify/react";

interface DashboardHeaderProps {
  name: string;
  role?: string;
  walletBalance?: number;
  pseudonym?: string;
}

const DashboardHeader = ({ name, role, walletBalance, pseudonym }: DashboardHeaderProps) => {
  const { logout } = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 pt-6 pb-4">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex flex-row justify-between items-center gap-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 overflow-hidden">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl overflow-visible group-hover:rotate-6 transition-transform relative z-10 p-1.5">
                <div className="absolute inset-0 bg-white rounded-2xl -z-10 shadow-inner" />
                <img src="/logo.svg" alt="HopAlong Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-black text-xl sm:text-2xl leading-none tracking-tighter drop-shadow-sm">HopAlong</span>
                <span className="text-amber-100 text-[9px] font-black uppercase tracking-[0.2em] mt-0.5">Campus Connect</span>
              </div>
            </Link>
            
            <div className="h-8 w-[1px] bg-white/20 hidden lg:block mx-1" />
            
            <div className="hidden md:flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl lg:text-2xl font-medium text-white drop-shadow-md">
                  Hi, <span className="font-black text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">{name.split(" ")[0]}</span>!
                </span>
                {pseudonym && (
                  <div className="bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20 flex items-center gap-1.5 ml-1">
                    <Icon icon="mdi:incognito" className="text-white/60 text-[10px]" />
                    <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">
                      {pseudonym}
                    </span>
                  </div>
                )}
              </div>
              <div className={`mt-1 flex items-center gap-2`}>
                 <div className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-[0.15em] flex items-center gap-1.5 shadow-sm ${
                  role === 'admin' ? 'bg-red-500 text-white' : 'bg-white/10 text-white/90 border border-white/10'
                }`}>
                   <Icon icon={
                    role === 'admin' ? 'mdi:shield-check' : 'mdi:account-school'
                  } className="text-[10px]" />
                  <span>{role || 'student'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wallet Pill on the Right Side */}
            <Link to="/wallet" className="group">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl flex items-center gap-3 transition-all shadow-lg"
              >
                <div className="w-8 h-8 bg-yellow-400 rounded-xl flex items-center justify-center shadow-inner text-amber-900">
                  <Icon icon="mdi:wallet" className="text-lg" />
                </div>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[9px] font-black text-white/60 uppercase tracking-widest mb-1">Balance</span>
                  <span className="text-sm font-black text-white tracking-tight">₹{walletBalance?.toFixed(2) || '0.00'}</span>
                </div>
              </motion.div>
            </Link>

            <div className="h-10 w-[1px] bg-white/10 mx-1 hidden sm:block" />

            <div className="flex items-center gap-1.5 sm:gap-2 bg-black/5 p-1.5 rounded-2xl backdrop-blur-sm shadow-inner border border-white/5">
              {role === 'admin' && (
                <Link to="/admin" className="hidden sm:block">
                  <motion.button
                    className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-500 text-amber-900 h-9 px-4 rounded-xl text-xs font-black transition-all shadow-md active:scale-95"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Icon icon="mdi:shield-account" className="text-lg" />
                    Admin
                  </motion.button>
                </Link>
              )}
              <Link to="/profile">
                <motion.div
                  className="h-9 w-9 bg-white rounded-xl flex items-center justify-center shadow-xl cursor-pointer border-2 border-transparent hover:border-yellow-400 group transition-all"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <span className="text-yellow-600 text-sm font-black group-hover:scale-110 transition-transform">
                    {name.charAt(0).toUpperCase()}
                  </span>
                </motion.div>
              </Link>
              <motion.button
                onClick={handleLogout}
                className="h-9 w-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Logout"
              >
                <Icon icon="mdi:logout" className="text-xl" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardHeader;
