import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { useAuthStore } from "../store/authStore";
import api from "../services/api";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import { useNavigate } from "react-router-dom";

const Wallet = () => {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(user?.walletBalance || 0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingMoney, setIsAddingMoney] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amountToAdd, setAmountToAdd] = useState("");
  const [selectedTx, setSelectedTx] = useState<any>(null);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setIsLoading(true);
      const [balanceRes, historyRes] = await Promise.all([
        api.get("/wallet/balance"),
        api.get("/wallet/history")
      ]);
      
      const newBalance = balanceRes.data.payload.balance;
      setBalance(newBalance);
      setTransactions(historyRes.data.payload);
      
      // Update authStore to keep header in sync
      if (user) {
        setUser({ ...user, walletBalance: newBalance });
      }
    } catch (error) {
      console.error("Failed to fetch wallet data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMoney = async () => {
    if (!amountToAdd || isNaN(Number(amountToAdd)) || isSubmitting) return;
    try {
      setIsSubmitting(true);
      const res = await api.post("/wallet/load", { amount: Number(amountToAdd) });
      const newBalance = res.data.payload.balance;
      
      setBalance(newBalance);
      if (user) {
        setUser({ ...user, walletBalance: newBalance });
      }
      
      setAmountToAdd("");
      setIsAddingMoney(false);
      fetchWalletData(); // Refresh history
    } catch (error) {
      alert("Failed to load wallet");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <DashboardHeader 
        name={user?.name || "Student"} 
        role={user?.role} 
        walletBalance={balance}
        pseudonym={user?.pseudonym}
      />

      <main className="max-w-4xl mx-auto px-4 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
        >
          {/* Background Decorative Circles */}
          <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-yellow-400 rounded-full opacity-10 blur-3xl" />
          <div className="absolute bottom-[-50px] left-[-50px] w-48 h-48 bg-yellow-500 rounded-full opacity-5 blur-2xl" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <p className="text-yellow-100/60 text-sm font-medium uppercase tracking-widest mb-1">Total Balance</p>
              <h2 className="text-5xl font-black flex items-center gap-2">
                <span className="text-yellow-400">₹</span>
                {balance.toFixed(2)}
              </h2>
            </div>

            <button
              onClick={() => setIsAddingMoney(true)}
              className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-xl shadow-yellow-400/20"
            >
              <Icon icon="mdi:plus-circle" className="text-2xl" />
              Add Money
            </button>
          </div>
        </motion.div>

        {/* Transactions Section */}
        <div className="mt-12">
          <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
            <Icon icon="mdi:history" className="text-2xl text-yellow-500" />
            Transaction History
          </h3>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Icon icon="line-md:loading-twotone-loop" className="text-4xl text-yellow-500" />
              </div>
            ) : transactions.length > 0 ? (
              transactions.map((tx, idx) => (
                <motion.div
                  key={tx._id || idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => setSelectedTx(tx)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      <Icon icon={tx.type === 'credit' ? "mdi:arrow-down-bold" : "mdi:arrow-up-bold"} className="text-xl" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{tx.description}</p>
                      <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-lg ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'credit' ? '+' : '-'} ₹{Math.abs(tx.amount).toFixed(2)}
                    </p>
                    <p className="text-[10px] uppercase font-bold text-gray-300">{tx.status}</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="bg-white py-16 rounded-3xl border border-dashed border-gray-200 text-center">
                <Icon icon="mdi:wallet-outline" className="text-6xl text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-medium">No transactions yet</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Money Modal */}
      <AnimatePresence>
        {isAddingMoney && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingMoney(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4">
                <button onClick={() => setIsAddingMoney(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                  <Icon icon="mdi:close" className="text-2xl" />
                </button>
              </div>

              <h2 className="text-2xl font-black text-gray-900 mb-2">Load Wallet</h2>
              <p className="text-gray-500 text-sm mb-6">Enter the amount you want to add to your campus wallet.</p>

              <div className="relative mb-8">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-400">₹</span>
                <input
                  type="number"
                  step="any"
                  value={amountToAdd}
                  onChange={(e) => setAmountToAdd(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-5 pl-12 pr-6 text-2xl font-black text-gray-900 focus:border-yellow-400 focus:outline-none transition-all placeholder:text-gray-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 mb-8">
                {[100, 200, 500].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setAmountToAdd(amt.toString())}
                    className="py-3 bg-gray-50 hover:bg-yellow-50 border border-gray-100 hover:border-yellow-200 rounded-xl font-bold text-gray-600 hover:text-yellow-700 transition-all active:scale-95"
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>

              <button
                onClick={handleAddMoney}
                disabled={!amountToAdd || isSubmitting}
                className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-100 disabled:text-gray-400 py-5 rounded-2xl font-black text-gray-900 transition-all active:scale-[0.98] shadow-lg shadow-yellow-400/20 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                   <Icon icon="mdi:loading" className="animate-spin text-2xl" />
                ) : (
                   "Confirm Payment"
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Transaction Detail Modal */}
      <AnimatePresence>
        {selectedTx && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTx(null)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className={`p-8 pb-12 text-center relative ${selectedTx.type === 'credit' ? 'bg-green-50' : 'bg-amber-50'}`}>
                <button 
                  onClick={() => setSelectedTx(null)}
                  className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <Icon icon="mdi:close" className="text-2xl" />
                </button>
                
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg ${selectedTx.type === 'credit' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}`}>
                  <Icon icon={selectedTx.type === 'credit' ? "mdi:wallet-plus" : "mdi:car-connected"} className="text-4xl" />
                </div>
                
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Transaction Details</h3>
                <p className="text-3xl font-black text-gray-900">
                  {selectedTx.type === 'credit' ? '+' : '-'} ₹{Math.abs(selectedTx.amount).toFixed(2)}
                </p>
              </div>

              {/* Body */}
              <div className="p-8 -mt-6 bg-white rounded-t-[2.5rem] relative">
                <div className="space-y-6">
                   <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status</span>
                      <span className="bg-green-100 text-green-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                        {selectedTx.status}
                      </span>
                   </div>

                   <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Date & Time</span>
                      <span className="text-sm font-bold text-gray-700">
                        {new Date(selectedTx.createdAt).toLocaleDateString()} • {new Date(selectedTx.createdAt).toLocaleTimeString()}
                      </span>
                   </div>

                   <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</span>
                      <span className="text-sm font-bold text-gray-700 text-right max-w-[200px]">
                        {selectedTx.description}
                      </span>
                   </div>

                   {/* Conditional Details based on Transaction Type */}
                   {selectedTx.type === 'debit' ? (
                     <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ride ID</span>
                        <button 
                          onClick={() => selectedTx.rideId && navigate(`/rides/${selectedTx.rideId}`)}
                          className="text-sm font-mono font-bold text-yellow-600 hover:text-yellow-700 underline decoration-dashed underline-offset-4 transition-colors"
                        >
                          #{selectedTx.rideId?.substring(0, 8).toUpperCase() || "HAP-" + Math.random().toString(36).substring(7).toUpperCase()}
                        </button>
                     </div>
                   ) : (
                     <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Payment Method</span>
                        <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                          <Icon icon="mdi:bank" className="text-amber-500" /> UPI / Bank Transfer
                        </span>
                     </div>
                   )}

                   <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Reference No.</span>
                      <span className="text-xs font-mono font-bold text-gray-400 tracking-tighter">
                        TXN_{Math.random().toString(36).substring(2, 10).toUpperCase()}
                      </span>
                   </div>
                </div>

                <button
                  onClick={() => setSelectedTx(null)}
                  className="w-full mt-10 bg-gray-900 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-gray-800 transition-all active:scale-95"
                >
                  Close Receipt
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Wallet;