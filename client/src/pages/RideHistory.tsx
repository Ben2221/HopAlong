import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { motion } from "motion/react";
import api from "../services/api";
import { useAuthStore } from "../store/authStore";
import DashboardHeader from "../components/dashboard/DashboardHeader";

interface Ride {
  _id: string;
  pickupLocation: { address: string };
  dropoffLocation: { address: string };
  status: string;
  fare: number;
  createdAt: string;
}

const RideHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get("/rides/history");
        setRides(response.data);
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <DashboardHeader 
        name={user.name} 
        role={user.role} 
        walletBalance={user.walletBalance} 
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
             <button
                onClick={() => navigate("/dashboard")}
                className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
             >
                <Icon icon="mdi:arrow-left" className="text-xl" />
             </button>
             <h2 className="text-3xl font-black text-gray-900 tracking-tight">Full Journey History</h2>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 text-[10px] font-black uppercase text-gray-400 tracking-widest">
            {rides.length} Total Trips
          </div>
        </div>

        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400 font-bold">Retrieving all records...</p>
            </div>
          ) : rides.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {rides.map(ride => (
                <motion.div 
                  key={ride._id} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ backgroundColor: 'rgba(251, 191, 36, 0.02)' }} 
                  className="p-8 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${ride.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                      <Icon icon={ride.status === 'completed' ? "mdi:check-decagram" : "mdi:history"} />
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-lg leading-tight">{ride.pickupLocation.address.split(',')[0]} → {ride.dropoffLocation.address.split(',')[0]}</p>
                      <p className="text-xs text-gray-400 mt-1 font-medium">
                        {new Date(ride.createdAt).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} at {new Date(ride.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                      <p className="text-2xl font-black text-gray-900 leading-none">₹{ride.fare}</p>
                      <p className="text-[10px] uppercase font-black text-gray-400 mt-2 tracking-widest">Amount</p>
                    </div>
                    <span className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-xl tracking-widest ${ride.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {ride.status}
                    </span>
                    <button 
                      onClick={() => navigate(`/rides/${ride._id}`)}
                      className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center hover:bg-yellow-400 hover:text-amber-900 transition-all shadow-lg"
                    >
                      <Icon icon="mdi:chevron-right" className="text-xl" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-20 text-center flex flex-col items-center">
              <Icon icon="mdi:car-off" className="text-6xl text-gray-200 mb-6" />
              <h4 className="text-2xl font-black text-gray-900 mb-2">No history yet</h4>
              <p className="text-gray-400 max-w-sm mx-auto">Your journeys will be listed here once you complete your first ride.</p>
              <button 
                onClick={() => navigate("/create-ride")}
                className="mt-8 bg-yellow-400 text-amber-900 px-8 py-3 rounded-2xl font-black shadow-lg hover:bg-yellow-500 transition-colors"
              >
                Book Your First Trip
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RideHistory;
