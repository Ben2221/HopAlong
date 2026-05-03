import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import api from "../services/api";
import { useEffect, useState } from "react";
import { initSocket, getSocket, disconnectSocket } from "../services/socket";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "motion/react";
import StatsCard from "../components/dashboard/StatsCard";
import ServiceCard from "../components/dashboard/ServiceCard";
import Map from "../components/Map";

interface Ride {
  _id: string;
  pickupLocation: { address: string };
  dropoffLocation: { address: string };
  status: string;
  fare: number;
  createdAt: string;
}

const Dashboard = () => {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();

  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Driver specific state
  const [isOnline, setIsOnline] = useState(false);
  const [incomingRequest, setIncomingRequest] = useState<any>(null);

  // Rider specific state
  const [availableRides, setAvailableRides] = useState<any[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(user?.isAnonymous || false);

  const [publicSettings, setPublicSettings] = useState<any>(null);

  useEffect(() => {
    if (!user || !token) {
      navigate("/login");
      return;
    }

    const fetchRides = async () => {
      try {
        const response = await api.get('/rides/history');
        setRides(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch rides");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchAvailableRides = async () => {
      if (user?.role === 'rider' || user?.role === 'admin') {
        try {
          const response = await api.get('/rides/available');
          setAvailableRides(response.data);
        } catch (err) {
          console.error("Failed to fetch available rides", err);
        }
      }
    };

    const fetchPublicSettings = async () => {
      try {
        const response = await api.get('/settings/public');
        setPublicSettings(response.data.data);
      } catch (err) {
        console.error("Failed to fetch public settings", err);
      }
    };

    fetchRides();
    fetchAvailableRides();
    fetchPublicSettings();

    // Setup Socket
    const socket = initSocket(token);

    if (user.role === 'driver') {
      socket.on('new_ride_request', (data) => {
        setIncomingRequest(data);
      });
      
      socket.on('ride_accepted_success', (data) => {
        navigate(`/rides/${data.rideId}`);
      });
    }

    if (user.role === 'rider' || user.role === 'admin') {
      socket.on('ride_accepted', (data) => {
        navigate(`/rides/${data.rideId}`);
      });
    }

    return () => {
      disconnectSocket();
    };
  }, [user, token, navigate]);

  const toggleOnlineStatus = () => {
    const socket = getSocket();
    if (socket) {
      const newStatus = !isOnline;
      setIsOnline(newStatus);
      socket.emit('driver_status', { isOnline: newStatus });
      
      if (newStatus && navigator.geolocation) {
        navigator.geolocation.watchPosition((position) => {
          socket.emit('driver_location', {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        });
      }
    }
  };

  const acceptRide = (rideId: string) => {
    const socket = getSocket();
    if (socket) {
      socket.emit('accept_ride', { rideId });
      setIncomingRequest(null);
    }
  };

  const joinRide = async (rideId: string) => {
    try {
      await api.post('/rides/join', { rideId });
      navigate(`/rides/${rideId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to join ride");
    }
  };

  const togglePrivacy = async () => {
    try {
      const newStatus = !isAnonymous;
      await api.put('/api/user/privacy', { isAnonymous: newStatus });
      setIsAnonymous(newStatus);
      // Update store locally too
      useAuthStore.getState().setUser({ ...user!, isAnonymous: newStatus });
    } catch (err) {
      console.error("Failed to update privacy", err);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <DashboardHeader 
        name={user.name} 
        role={user.role} 
        pseudonym={user.pseudonym}
        walletBalance={user.walletBalance}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Uber-Style Hero Section */}
        <section className="relative h-[300px] md:h-[400px] rounded-[32px] overflow-hidden shadow-2xl mb-8 group">
          <div className="absolute inset-0 z-0">
            <Map />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none z-10" />
          
          <div className="absolute inset-0 p-8 flex flex-col justify-end z-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-xl pointer-events-auto"
            >
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
                Where are you <span className="text-yellow-400 underline decoration-yellow-400/30">hopping</span> to?
              </h2>
              
              <div className="relative group/input" onClick={(e) => e.stopPropagation()}>
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <Icon icon="mdi:magnify" className="text-2xl text-gray-400 group-focus-within/input:text-yellow-400 transition-colors" />
                </div>
                <input 
                  type="text" 
                  placeholder="Search destination..."
                  readOnly
                  onClick={() => navigate('/create-ride')}
                  className="w-full h-16 pl-14 pr-6 bg-white rounded-2xl shadow-2xl text-lg font-medium outline-none cursor-pointer hover:bg-gray-50 transition-all border-2 border-transparent focus:border-yellow-400"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                   <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/create-ride');
                    }}
                    className="bg-yellow-400 text-amber-900 px-6 py-2.5 rounded-xl font-black text-sm shadow-lg hover:bg-yellow-500 transition-colors"
                   >
                      Go
                   </button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Broadcast Banner */}
        {publicSettings?.broadcastBanner?.isActive && (
          <motion.div 
            className={`mb-8 p-4 rounded-2xl flex items-center gap-4 shadow-sm border-l-8 ${
              publicSettings.broadcastBanner.type === 'alert' ? 'bg-red-50 border-red-500 text-red-800' :
              publicSettings.broadcastBanner.type === 'warning' ? 'bg-amber-50 border-amber-500 text-amber-800' :
              'bg-blue-50 border-blue-500 text-blue-800'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Icon 
              icon={
                publicSettings.broadcastBanner.type === 'alert' ? 'mdi:alert-circle' :
                publicSettings.broadcastBanner.type === 'warning' ? 'mdi:alert' :
                'mdi:information'
              } 
              className="text-2xl shrink-0" 
            />
            <p className="font-bold text-sm md:text-base">{publicSettings.broadcastBanner.message}</p>
          </motion.div>
        )}

        {/* DRIVER STATUS (If applicable) */}
        {user.role === 'driver' && (
          <div className="mb-8">
             <motion.div 
              className={`p-1 rounded-[24px] shadow-sm border transition-all ${isOnline ? 'bg-green-500/10 border-green-200' : 'bg-gray-100 border-gray-200'}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
             >
               <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${isOnline ? 'bg-green-500 text-white animate-pulse' : 'bg-gray-200 text-gray-400'}`}>
                      <Icon icon={isOnline ? "mdi:car-connected" : "mdi:car-off"} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 leading-none">Driver Center</h3>
                      <p className="text-sm text-gray-500 mt-1">You are currently <span className={`font-black ${isOnline ? 'text-green-600' : 'text-gray-400'}`}>{isOnline ? 'RECEIVING REQUESTS' : 'OFFLINE'}</span></p>
                    </div>
                  </div>
                   <button 
                    onClick={toggleOnlineStatus}
                    className={`w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 ${isOnline ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-green-600 hover:bg-green-700 shadow-green-200'}`}
                  >
                    {isOnline ? 'Go Offline' : 'Go Online'}
                  </button>
               </div>
             </motion.div>

             <AnimatePresence>
              {incomingRequest && (
                <motion.div 
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="mt-6 bg-amber-900 text-white p-8 rounded-[32px] shadow-2xl border-4 border-yellow-400 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                        <Icon icon="mdi:car-hatchback" className="text-amber-900 text-2xl" />
                      </div>
                      <h4 className="font-black text-2xl uppercase tracking-tighter">New Ride Request!</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <Icon icon="mdi:circle-outline" className="text-yellow-400 mt-1" />
                          <div>
                            <p className="text-[10px] uppercase font-black text-yellow-400/60 leading-none mb-1">Pickup</p>
                            <p className="text-lg font-bold leading-tight">{incomingRequest.pickup.address}</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Icon icon="mdi:map-marker" className="text-red-400 mt-1" />
                          <div>
                            <p className="text-[10px] uppercase font-black text-yellow-400/60 leading-none mb-1">Dropoff</p>
                            <p className="text-lg font-bold leading-tight">{incomingRequest.dropoff.address}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white/5 p-6 rounded-2xl flex flex-col justify-center border border-white/10">
                         <p className="text-xs uppercase font-black text-yellow-400/60 mb-1">Estimated Fare</p>
                         <p className="text-4xl font-black text-yellow-400">₹{incomingRequest.fare}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                        onClick={() => acceptRide(incomingRequest.rideId)}
                        className="flex-1 bg-yellow-400 text-amber-900 py-4 rounded-2xl font-black text-xl shadow-lg hover:bg-yellow-500 transition-all active:scale-95"
                      >
                        Accept Ride
                      </button>
                      <button 
                        onClick={() => setIncomingRequest(null)} 
                        className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold transition-all"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
             </AnimatePresence>
          </div>
        )}

        {/* Primary Service Selection */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Services</h3>
            <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
               <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Privacy</span>
               <button 
                onClick={togglePrivacy}
                className={`w-10 h-5 rounded-full transition-colors relative ${isAnonymous ? 'bg-yellow-400' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${isAnonymous ? 'left-5.5' : 'left-0.5'}`} />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ServiceCard 
              title="Offer a Ride"
              description="Have empty seats? Share your journey and save costs."
              icon="mdi:car-connected"
              image="/assets/dashboard/car_3d.png"
              primary
              onClick={() => navigate('/create-ride')}
            />
            <ServiceCard 
              title="Find a Ride"
              description="Hop onto a shared ride heading your way."
              icon="mdi:magnify"
              onClick={() => navigate('/create-ride')}
            />
            <ServiceCard 
              title="Schedule Later"
              description="Plan your future commutes with ease."
              icon="mdi:calendar-clock"
              onClick={() => navigate('/create-ride')}
            />
          </div>
        </section>

        {/* Quick Stats */}
        <section className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <StatsCard label="Rides Completed" value={rides.length} icon="mdi:car-multiple" trend="+2 this week" />
             <StatsCard label="Total Spent" value={`₹${rides.reduce((acc, r) => acc + r.fare, 0)}`} icon="mdi:wallet" color="text-green-500" />
             <StatsCard label="Eco Impact" value="12kg" icon="mdi:leaf" color="text-emerald-500" trend="Saved CO2" />
             <StatsCard label="Reward Points" value="240" icon="mdi:star" color="text-purple-500" />
          </div>
        </section>

        {/* Available Shared Rides Grid (Simplified list) */}
        {(user.role === 'rider' || user.role === 'admin') && availableRides.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                <Icon icon="mdi:account-group" className="text-amber-900" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Available Hop-Alongs</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableRides.map(ride => (
                <motion.div 
                  key={ride._id}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900">{ride.pickupLocation.address.split(',')[0]}</p>
                      <Icon icon="mdi:arrow-right" className="text-gray-300" />
                      <p className="font-bold text-gray-900">{ride.dropoffLocation.address.split(',')[0]}</p>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-2">
                      <span className="flex items-center gap-0.5">
                        <Icon icon="mdi:account-multiple" /> {ride.riders.length}/{ride.maxRiders} seats
                      </span>
                      <span>•</span>
                      <span className="text-green-600 font-bold">₹{Math.round(ride.fare / (ride.riders.length + 1))} per person</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => joinRide(ride._id)}
                    className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-black hover:bg-gray-800 transition-all"
                  >
                    Hop In
                  </button>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-2xl mb-8 flex items-center gap-3 border border-red-100">
            <Icon icon="mdi:alert-circle" />
            <p className="font-bold text-sm">{error}</p>
          </div>
        )}

        {/* Ride History Table-like Cards */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Recent Activity</h3>
            <button className="text-yellow-600 font-bold text-sm hover:underline">View All</button>
          </div>
          
          <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 font-bold">Loading your journeys...</p>
              </div>
            ) : rides.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {rides.map(ride => (
                  <motion.div 
                    key={ride._id} 
                    whileHover={{ backgroundColor: 'rgba(251, 191, 36, 0.02)' }}
                    className="p-6 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                        ride.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                      }`}>
                        <Icon icon={ride.status === 'completed' ? "mdi:check-circle" : "mdi:clock-outline"} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 leading-tight">
                          {ride.pickupLocation.address.split(',')[0]} to {ride.dropoffLocation.address.split(',')[0]}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(ride.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <p className="text-lg font-black text-gray-900 leading-none">₹{ride.fare}</p>
                        <p className="text-[10px] uppercase font-black text-gray-400 mt-1">Paid via Wallet</p>
                      </div>
                      <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full ${
                        ride.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {ride.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-16 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon icon="mdi:car-off" className="text-gray-300 text-4xl" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-1">No rides yet</h4>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">Your journey history will appear here once you take your first ride.</p>
                <button 
                  onClick={() => navigate('/create-ride')}
                  className="mt-6 bg-yellow-400 text-amber-900 px-8 py-3 rounded-2xl font-black shadow-lg hover:bg-yellow-500 transition-all"
                >
                  Start Hopping
                </button>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Dashboard;
