import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import api from "../services/api";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "motion/react";

interface Stats {
  totalUsers: number;
  totalRides: number;
  activeRides: number;
  totalRevenue: number;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: 'rider' | 'driver' | 'admin';
  walletBalance: number;
  status: 'active' | 'suspended' | 'banned';
  createdAt: string;
}

interface GlobalSettings {
  baseFare: number;
  pricePerKm: number;
  broadcastBanner: {
    message: string;
    isActive: boolean;
    type: 'info' | 'warning' | 'alert';
  };
  maintenanceMode: boolean;
}

interface SupportMessage {
  _id: string;
  name: string;
  email: string;
  message: string;
  status: 'new' | 'read' | 'resolved';
  createdAt: string;
}

const AdminDashboard = () => {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [rides, setRides] = useState<any[]>([]);
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [localSettings, setLocalSettings] = useState<GlobalSettings | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'rides' | 'support' | 'settings'>('users');
  
  // Wallet adjustment modal state
  const [adjustingUser, setAdjustingUser] = useState<UserData | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>("");

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    const fetchData = async () => {
      try {
        const [statsRes, usersRes, ridesRes, settingsRes, messagesRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users'),
          api.get('/admin/rides'),
          api.get('/admin/settings'),
          api.get('/admin/messages')
        ]);
        
        setStats(statsRes.data.data);
        setUsers(usersRes.data.data);
        setRides(ridesRes.data.data);
        setSettings(settingsRes.data.data);
        setLocalSettings(settingsRes.data.data);
        setMessages(messagesRes.data.data);
      } catch (error) {
        console.error("Failed to fetch admin data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, token, navigate]);

  const handleSaveSettings = async () => {
    if (!localSettings) return;
    try {
      const response = await api.patch('/admin/settings', localSettings);
      setSettings(response.data.data);
      alert("Settings saved successfully!");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to save settings");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete user");
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: newStatus });
      setUsers(users.map(u => u._id === userId ? { ...u, status: newStatus as any } : u));
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole as any } : u));
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update role");
    }
  };

  const handleAdjustWallet = async () => {
    if (!adjustingUser || !adjustAmount) return;
    try {
      const amount = parseFloat(adjustAmount);
      await api.post(`/admin/users/${adjustingUser._id}/wallet`, { amount, action: 'add' });
      setUsers(users.map(u => u._id === adjustingUser._id ? { ...u, walletBalance: u.walletBalance + amount } : u));
      setAdjustingUser(null);
      setAdjustAmount("");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to adjust wallet");
    }
  };

  const handleCancelRide = async (rideId: string) => {
    if (!window.confirm("Are you sure you want to intercept and cancel this ride?")) return;
    try {
      await api.delete(`/admin/rides/${rideId}`);
      setRides(rides.map(r => r._id === rideId ? { ...r, status: 'cancelled' } : r));
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to cancel ride");
    }
  };


  const handleUpdateMessageStatus = async (msgId: string, status: string) => {
    try {
      await api.patch(`/admin/messages/${msgId}`, { status });
      setMessages(messages.map(m => m._id === msgId ? { ...m, status: status as any } : m));
    } catch (error) {
      console.error("Failed to update message status", error);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-gray-400 hover:text-white flex items-center gap-1 mb-4 text-sm"
              >
                <Icon icon="mdi:arrow-left" /> Back to App
              </button>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <Icon icon="mdi:shield-check" className="text-yellow-400" />
                Admin Command Center
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Users', value: stats?.totalUsers, icon: 'mdi:account-group', color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Total Rides', value: stats?.totalRides, icon: 'mdi:car', color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'Active Rides', value: stats?.activeRides, icon: 'mdi:map-clock', color: 'text-green-500', bg: 'bg-green-50' },
            { label: 'Total Revenue', value: `₹${stats?.totalRevenue.toFixed(0)}`, icon: 'mdi:cash-multiple', color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center text-2xl`}>
                <Icon icon={stat.icon} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-12">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {[
              { id: 'users', label: 'Users', icon: 'mdi:account-cog' },
              { id: 'rides', label: 'Rides', icon: 'mdi:car-clock' },
              { id: 'support', label: 'Support', icon: 'mdi:message-alert' },
              { id: 'settings', label: 'Settings', icon: 'mdi:cog' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-8 py-4 font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'text-yellow-600 border-b-2 border-yellow-500 bg-yellow-50/30' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Icon icon={tab.icon} /> {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'users' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-400 text-xs uppercase tracking-wider">
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Wallet</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map(u => (
                      <tr key={u._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <p className="font-bold text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </td>
                        <td className="px-4 py-4">
                          <select 
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            className="text-sm font-medium outline-none bg-transparent cursor-pointer hover:text-yellow-600"
                            disabled={u._id === user?.id}
                          >
                            <option value="rider">Rider</option>
                            <option value="driver">Driver</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-4 py-4">
                          <select 
                            value={u.status}
                            onChange={(e) => handleStatusChange(u._id, e.target.value)}
                            className={`text-xs font-bold px-2 py-1 rounded-full outline-none ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                            disabled={u._id === user?.id}
                          >
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                            <option value="banned">Banned</option>
                          </select>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">₹{u.walletBalance.toFixed(0)}</span>
                            <button 
                              onClick={() => setAdjustingUser(u)}
                              className="text-yellow-600 hover:text-yellow-700"
                            >
                              <Icon icon="mdi:pencil-plus" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button 
                            onClick={() => handleDeleteUser(u._id)}
                            className="text-gray-300 hover:text-red-500 transition-colors"
                            disabled={u._id === user?.id}
                          >
                            <Icon icon="mdi:trash-can" className="text-xl" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'rides' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-400 text-xs uppercase tracking-wider">
                      <th className="px-4 py-3">Route</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Fare</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rides.map(r => (
                      <tr key={r._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <p className="text-sm font-bold text-gray-800">{r.pickupLocation.address}</p>
                          <p className="text-xs text-gray-400">to {r.dropoffLocation.address}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${
                            r.status === 'completed' ? 'bg-green-100 text-green-700' : 
                            r.status === 'cancelled' ? 'bg-gray-100 text-gray-500' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-bold">₹{r.fare}</td>
                        <td className="px-4 py-4 text-right">
                          {['pending', 'accepted', 'ongoing'].includes(r.status) && (
                            <button 
                              onClick={() => handleCancelRide(r._id)}
                              className="text-red-400 hover:text-red-600 font-bold text-xs flex items-center gap-1 ml-auto"
                            >
                              <Icon icon="mdi:cancel" /> Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'support' && (
              <div className="space-y-4">
                {messages.length > 0 ? messages.map(msg => (
                  <motion.div 
                    key={msg._id}
                    className={`p-6 rounded-2xl border ${msg.status === 'new' ? 'bg-yellow-50 border-yellow-100 shadow-sm' : 'bg-white border-gray-100'}`}
                    layout
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900">{msg.name}</h4>
                        <p className="text-sm text-gray-500">{msg.email}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(msg.createdAt).toLocaleString()}</p>
                      </div>
                      <select 
                        value={msg.status}
                        onChange={(e) => handleUpdateMessageStatus(msg._id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1 rounded-full border-none outline-none ${
                          msg.status === 'new' ? 'bg-yellow-200 text-yellow-800' : 
                          msg.status === 'read' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}
                      >
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap bg-white/50 p-4 rounded-xl italic">
                      "{msg.message}"
                    </p>
                  </motion.div>
                )) : (
                  <div className="text-center py-12 text-gray-400">
                    <Icon icon="mdi:message-off" className="text-4xl mx-auto mb-2" />
                    <p>No support messages yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && localSettings && (
              <div className="max-w-2xl space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Base Fare (₹)</label>
                    <input 
                      type="number" 
                      value={localSettings.baseFare}
                      onChange={(e) => setLocalSettings({ ...localSettings, baseFare: parseFloat(e.target.value) })}
                      className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Price per KM (₹)</label>
                    <input 
                      type="number" 
                      value={localSettings.pricePerKm}
                      onChange={(e) => setLocalSettings({ ...localSettings, pricePerKm: parseFloat(e.target.value) })}
                      className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                </div>

                <div className="space-y-4 border-t border-gray-100 pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-800">Broadcast Banner</h4>
                      <p className="text-xs text-gray-400">Show a message to all students on their dashboard</p>
                    </div>
                    <button 
                      onClick={() => setLocalSettings({ 
                        ...localSettings, 
                        broadcastBanner: { ...localSettings.broadcastBanner, isActive: !localSettings.broadcastBanner.isActive } 
                      })}
                      className={`w-14 h-7 rounded-full transition-colors relative ${localSettings.broadcastBanner.isActive ? 'bg-yellow-500' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${localSettings.broadcastBanner.isActive ? 'left-8' : 'left-1'}`} />
                    </button>
                  </div>

                  <textarea 
                    value={localSettings.broadcastBanner.message}
                    onChange={(e) => setLocalSettings({ 
                      ...localSettings, 
                      broadcastBanner: { ...localSettings.broadcastBanner, message: e.target.value } 
                    })}
                    placeholder="Enter announcement message..."
                    className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 outline-none h-24 focus:ring-2 focus:ring-yellow-400"
                  />

                  <div className="flex gap-4">
                    {['info', 'warning', 'alert'].map(type => (
                      <button 
                        key={type}
                        onClick={() => setLocalSettings({ 
                          ...localSettings, 
                          broadcastBanner: { ...localSettings.broadcastBanner, type: type as any } 
                        })}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all ${localSettings.broadcastBanner.type === type ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <button 
                    onClick={handleSaveSettings}
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-2"
                  >
                    <Icon icon="mdi:content-save-check" className="text-xl text-yellow-400" />
                    Save All Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Wallet Adjust Modal */}
      <AnimatePresence>
        {adjustingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAdjustingUser(null)}
            />
            <motion.div 
              className="bg-white rounded-3xl p-8 w-full max-w-md relative z-10 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">Adjust Wallet Balance</h3>
              <p className="text-gray-500 text-sm mb-6">User: <span className="font-bold text-gray-800">{adjustingUser.name}</span></p>
              
              <div className="space-y-4">
                <input 
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="Amount to add (e.g. 500 or -200)"
                  className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-yellow-400 font-bold"
                />
                <div className="flex gap-4">
                  <button 
                    onClick={() => setAdjustingUser(null)}
                    className="flex-1 py-3 text-gray-500 font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAdjustWallet}
                    className="flex-1 py-3 bg-yellow-400 text-white rounded-xl font-bold shadow-lg shadow-yellow-100"
                  >
                    Update Balance
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
