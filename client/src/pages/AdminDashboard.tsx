import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import api from "../services/api";
import { Icon } from "@iconify/react";
import { motion } from "motion/react";

interface Stats {
  totalUsers: number;
  totalRides: number;
  activeRides: number;
  totalRevenue: number;
}

const AdminDashboard = () => {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();

  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [rides, setRides] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'rides'>('users');

  useEffect(() => {
    if (!user || user.role !== 'admin' || !token) {
      navigate("/dashboard");
      return;
    }

    const fetchData = async () => {
      try {
        const [statsRes, usersRes, ridesRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users'),
          api.get('/admin/rides')
        ]);

        setStats(statsRes.data.data);
        setUsers(usersRes.data.data);
        setRides(ridesRes.data.data);
      } catch (error) {
        console.error("Failed to fetch admin data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, token, navigate]);

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      // Refresh stats
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data.data);
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete user");
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
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 text-right">
              <p className="text-xs uppercase text-gray-400 font-bold">Logged in as</p>
              <p className="font-bold text-yellow-400">{user?.name}</p>
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
            { label: 'Total Revenue', value: `₹${stats?.totalRevenue.toFixed(2)}`, icon: 'mdi:cash-multiple', color: 'text-amber-600', bg: 'bg-amber-50' },
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-8 py-4 font-bold text-sm transition-all ${activeTab === 'users' ? 'text-yellow-600 border-b-2 border-yellow-500 bg-yellow-50/30' : 'text-gray-400 hover:text-gray-600'}`}
            >
              User Management
            </button>
            <button 
              onClick={() => setActiveTab('rides')}
              className={`px-8 py-4 font-bold text-sm transition-all ${activeTab === 'rides' ? 'text-yellow-600 border-b-2 border-yellow-500 bg-yellow-50/30' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Ride Monitoring
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'users' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-400 text-xs uppercase tracking-wider">
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Balance</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map(u => (
                      <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 font-medium text-gray-900">{u.name}</td>
                        <td className="px-4 py-4 text-gray-600">{u.email}</td>
                        <td className="px-4 py-4 text-sm capitalize">
                          <span className={`px-2 py-1 rounded-full ${u.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-gray-900 font-bold">₹{u.walletBalance.toFixed(2)}</td>
                        <td className="px-4 py-4">
                          {u._id !== user?.id && (
                            <button 
                              onClick={() => handleDeleteUser(u._id)}
                              className="text-red-400 hover:text-red-600 transition-colors"
                              title="Delete User"
                            >
                              <Icon icon="mdi:trash-can" className="text-xl" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-400 text-xs uppercase tracking-wider">
                      <th className="px-4 py-3">Route</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Fare</th>
                      <th className="px-4 py-3">Passengers</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rides.map(r => (
                      <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <p className="font-medium text-gray-900 truncate max-w-xs">{r.pickupLocation.address}</p>
                          <p className="text-xs text-gray-400">to {r.dropoffLocation.address}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                            r.status === 'completed' ? 'bg-green-100 text-green-600' : 
                            r.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-bold">₹{r.fare.toFixed(2)}</td>
                        <td className="px-4 py-4 text-gray-600">{r.riders.length}/{r.maxRiders}</td>
                        <td className="px-4 py-4 text-sm text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
