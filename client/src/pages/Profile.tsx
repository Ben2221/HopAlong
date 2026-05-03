import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import api from "../services/api";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import Button from "../components/Button";
import { Icon } from "@iconify/react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [walletAmount, setWalletAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const addMoney = async () => {
    const amount = Number(walletAmount);
    if (isNaN(amount) || amount <= 0) return;
    setIsLoading(true);
    try {
      const response = await api.post('/user/wallet/add', { amount });
      if (user) {
        setUser({ ...user, walletBalance: response.data.walletBalance });
      }
      setSuccess(`Added ₹${amount} to your wallet!`);
      setWalletAmount("");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Failed to add money", err);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePrivacy = async () => {
    try {
      const newStatus = !user?.isAnonymous;
      const response = await api.put('/user/privacy', { isAnonymous: newStatus });
      if (user) {
        setUser({ ...user, isAnonymous: response.data.isAnonymous });
      }
    } catch (err) {
      console.error("Failed to update privacy", err);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <DashboardHeader 
        name={user.name} 
        role={user.role} 
        walletBalance={user.walletBalance}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        <motion.div 
          className="bg-white rounded-2xl shadow-lg p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center text-3xl font-bold text-yellow-600 shadow-inner">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
              <p className="text-gray-500">{user.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold uppercase">
                {user.role}
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Privacy Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Icon icon="mdi:shield-account" className="text-yellow-500" /> Privacy Settings
              </h3>
              <div className="bg-gray-50 p-6 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-700">Anonymous Mode</p>
                    <p className="text-xs text-gray-500">Hide your real name from others</p>
                  </div>
                  <button 
                    onClick={togglePrivacy}
                    className={`w-14 h-7 rounded-full transition-colors relative ${user.isAnonymous ? 'bg-yellow-400' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${user.isAnonymous ? 'left-8' : 'left-1'}`} />
                  </button>
                </div>
                
                {user.isAnonymous && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Your Pseudonym</p>
                    <p className="text-lg font-mono font-bold text-yellow-600">{user.pseudonym}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Wallet Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Icon icon="mdi:wallet" className="text-yellow-500" /> My Wallet
              </h3>
              <div className="bg-gray-50 p-6 rounded-xl space-y-6">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold mb-1">Current Balance</p>
                  <p className="text-3xl font-bold text-gray-800">₹{user.walletBalance.toFixed(2)}</p>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-gray-400 uppercase font-bold">Add Money (Mock)</p>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      value={walletAmount}
                      onChange={(e) => setWalletAmount(e.target.value)}
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-yellow-400 outline-none"
                      placeholder="Amount"
                    />
                    <Button 
                      size="sm" 
                      onClick={addMoney} 
                      disabled={isLoading || !walletAmount || Number(walletAmount) <= 0}
                    >
                      Add
                    </Button>
                  </div>
                  {success && <p className="text-xs text-green-600 font-medium">{success}</p>}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <Button 
          variant="outline" 
          fullWidth 
          onClick={() => navigate('/dashboard')}
          icon="mdi:arrow-left"
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default Profile;
