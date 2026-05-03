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
        walletBalance={user.walletBalance}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
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

        {/* ROLE BASED DASHBOARDS */}
        {user.role === 'driver' ? (
          /* DRIVER VIEW */
          <div className="space-y-8">
            <section className="relative h-[250px] rounded-[32px] overflow-hidden shadow-2xl group bg-gray-900">
               <div className="absolute inset-0 opacity-40">
                  <Map />
               </div>
               <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/60 to-transparent" />
               <div className="absolute inset-0 p-8 flex flex-col justify-center">
                  <h2 className="text-3xl md:text-5xl font-black text-white mb-2">Driver Hub</h2>
                  <p className="text-yellow-400 font-bold">Help students commute and earn points.</p>
               </div>
            </section>

            <section>
               <div className={`p-8 rounded-[32px] border transition-all ${isOnline ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100 shadow-sm'}`}>
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                     <div className="flex items-center gap-5">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${isOnline ? 'bg-green-500 text-white animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
                           <Icon icon={isOnline ? "mdi:car-connected" : "mdi:car-off"} />
                        </div>
                        <div>
                           <h3 className="text-2xl font-black text-gray-900">Your Status: {isOnline ? 'ONLINE' : 'OFFLINE'}</h3>
                           <p className="text-gray-500 font-medium">{isOnline ? 'Waiting for incoming requests...' : 'Ready to start? Go online now.'}</p>
                        </div>
                     </div>
                     <button 
                      onClick={toggleOnlineStatus}
                      className={`w-full md:w-auto px-12 py-4 rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95 ${isOnline ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                    >
                      {isOnline ? 'Go Offline' : 'Go Online'}
                    </button>
                  </div>
               </div>

               <AnimatePresence>
                {incomingRequest && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="mt-8 bg-gray-900 text-white p-8 rounded-[40px] shadow-2xl border-4 border-yellow-400"
                  >
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
                        <Icon icon="mdi:car-hatchback" className="text-gray-900 text-2xl" />
                      </div>
                      <h4 className="text-2xl font-black uppercase tracking-tighter">New Ride Request!</h4>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                       <div className="space-y-4">
                          <div className="flex gap-3">
                             <Icon icon="mdi:circle-outline" className="text-yellow-400 mt-1" />
                             <div>
                                <p className="text-[10px] font-black text-yellow-400/50 uppercase">Pickup</p>
                                <p className="text-lg font-bold">{incomingRequest.pickup.address}</p>
                             </div>
                          </div>
                          <div className="flex gap-3">
                             <Icon icon="mdi:map-marker" className="text-red-400 mt-1" />
                             <div>
                                <p className="text-[10px] font-black text-yellow-400/50 uppercase">Dropoff</p>
                                <p className="text-lg font-bold">{incomingRequest.dropoff.address}</p>
                             </div>
                          </div>
                       </div>
                       <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col justify-center">
                          <p className="text-xs font-black text-yellow-400/50 uppercase">Est. Fare</p>
                          <p className="text-4xl font-black text-yellow-400">₹{incomingRequest.fare}</p>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <button onClick={() => acceptRide(incomingRequest.rideId)} className="flex-1 bg-yellow-400 text-gray-900 py-4 rounded-2xl font-black text-xl hover:bg-yellow-500 transition-all">Accept Ride</button>
                       <button onClick={() => setIncomingRequest(null)} className="px-8 py-4 bg-white/10 rounded-2xl font-bold hover:bg-white/20 transition-all">Ignore</button>
                    </div>
                  </motion.div>
                )}
               </AnimatePresence>
            </section>

            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <StatsCard label="Today's Trips" value={rides.filter(r => new Date(r.createdAt).toDateString() === new Date().toDateString()).length} icon="mdi:car-check" />
               <StatsCard label="Earnings" value={`₹${rides.reduce((acc, r) => acc + r.fare, 0)}`} icon="mdi:cash" color="text-green-600" />
               <StatsCard label="Rating" value="4.9" icon="mdi:star" color="text-yellow-500" />
               <StatsCard label="Status" value={isOnline ? "Active" : "Idle"} icon="mdi:pulse" color={isOnline ? "text-green-500" : "text-gray-400"} />
            </section>
          </div>
        ) : (
          /* RIDER VIEW */
          <div className="space-y-12">
            <section className="relative h-[300px] md:h-[400px] rounded-[32px] overflow-hidden shadow-2xl group">
              <div className="absolute inset-0 z-0">
                <Map />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none z-10" />
              <div className="absolute inset-0 p-8 flex flex-col justify-end z-20">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl pointer-events-auto">
                  <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">Where to, <br /><span className="text-yellow-400">Champ?</span></h2>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                      <Icon icon="mdi:magnify" className="text-2xl text-gray-400 group-focus-within/input:text-yellow-400 transition-colors" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Enter destination..."
                      readOnly
                      onClick={() => navigate('/create-ride')}
                      className="w-full h-16 pl-14 pr-6 bg-white rounded-2xl shadow-2xl text-lg font-medium outline-none cursor-pointer hover:bg-gray-50 transition-all"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                       <button onClick={() => navigate('/create-ride')} className="bg-yellow-400 text-amber-900 px-8 py-3 rounded-xl font-black shadow-lg hover:bg-yellow-500 transition-colors">Start Hopping</button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Your Commute</h3>
                <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
                   <span className="text-xs font-black text-gray-400 uppercase">Incognito</span>
                   <button onClick={togglePrivacy} className={`w-10 h-5 rounded-full transition-colors relative ${isAnonymous ? 'bg-yellow-400' : 'bg-gray-300'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${isAnonymous ? 'left-5.5' : 'left-0.5'}`} />
                   </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ServiceCard title="Offer a Ride" description="Share seats & save costs." icon="mdi:car-connected" primary onClick={() => navigate('/create-ride')} />
                <ServiceCard title="Find a Ride" description="Join shared rides around you." icon="mdi:account-search" onClick={() => {
                  const section = document.getElementById('available-rides');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }} />
                <ServiceCard title="Ride Later" description="Schedule for tomorrow." icon="mdi:calendar-clock" onClick={() => navigate('/create-ride')} />
              </div>
            </section>

            {/* Available Shared Rides Grid */}
            <section id="available-rides" className="scroll-mt-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow-lg">
                   <Icon icon="mdi:account-group" className="text-amber-900 text-xl" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Active Hop-Alongs</h3>
              </div>
              
              {availableRides.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableRides.map(ride => (
                    <motion.div key={ride._id} whileHover={{ y: -5 }} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <div className="flex -space-x-2">
                             {[1,2,3].slice(0, ride.riders.length).map(i => (
                               <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-400">U</div>
                             ))}
                           </div>
                           <span className="text-[10px] font-black text-yellow-600 bg-yellow-50 px-2 py-1 rounded-lg uppercase tracking-tighter">{ride.maxRiders - ride.riders.length} Seats left</span>
                        </div>
                        <div className="space-y-2">
                           <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /><p className="font-bold text-gray-900 truncate">{ride.pickupLocation.address.split(',')[0]}</p></div>
                           <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" /><p className="font-bold text-gray-900 truncate">{ride.dropoffLocation.address.split(',')[0]}</p></div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                           <div><p className="text-[10px] font-black text-gray-400 uppercase leading-none">Your Cost</p><p className="text-xl font-black text-green-600">₹{Math.round(ride.fare / (ride.riders.length + 1))}</p></div>
                           <button onClick={() => joinRide(ride._id)} className="bg-gray-900 text-white px-6 py-3 rounded-2xl text-sm font-black hover:bg-yellow-400 hover:text-amber-900 transition-all shadow-lg">Hop In</button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[32px] p-16 text-center">
                   <Icon icon="mdi:car-search" className="text-5xl text-gray-300 mx-auto mb-4" />
                   <h4 className="text-xl font-bold text-gray-700">No active rides found</h4>
                   <p className="text-sm text-gray-400 mt-2">Check back in a few minutes or create your own!</p>
                </div>
              )}
            </section>

            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <StatsCard label="Rides" value={rides.length} icon="mdi:car-multiple" />
               <StatsCard label="Saved" value={`₹${rides.reduce((acc, r) => acc + r.fare, 0)}`} icon="mdi:wallet" color="text-green-600" />
               <StatsCard label="Eco Points" value="1,240" icon="mdi:leaf" color="text-emerald-500" />
               <StatsCard label="Safe Journeys" value="100%" icon="mdi:shield-check" color="text-blue-500" />
            </section>
          </div>
        )}

        {/* SHARED RECENT ACTIVITY */}
        <section className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Recent Activity</h3>
            <button className="text-yellow-600 font-bold text-sm hover:underline">Full History</button>
          </div>
          <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
            {isLoading ? (
              <div className="p-16 text-center flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 font-bold">Synchronizing history...</p>
              </div>
            ) : rides.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {rides.map(ride => (
                  <motion.div key={ride._id} whileHover={{ backgroundColor: 'rgba(251, 191, 36, 0.02)' }} className="p-8 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${ride.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                        <Icon icon={ride.status === 'completed' ? "mdi:check-decagram" : "mdi:history"} />
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-lg leading-tight">{ride.pickupLocation.address.split(',')[0]} → {ride.dropoffLocation.address.split(',')[0]}</p>
                        <p className="text-xs text-gray-400 mt-1 font-medium">{new Date(ride.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })} at {new Date(ride.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <p className="text-2xl font-black text-gray-900 leading-none">₹{ride.fare}</p>
                        <p className="text-[10px] uppercase font-black text-gray-400 mt-2 tracking-widest">{user.role === 'driver' ? 'Revenue' : 'Wallet'}</p>
                      </div>
                      <span className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-xl tracking-widest ${ride.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{ride.status}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-20 text-center flex flex-col items-center">
                <Icon icon="mdi:car-off" className="text-6xl text-gray-200 mb-6" />
                <h4 className="text-2xl font-black text-gray-900 mb-2">No activity recorded</h4>
                <p className="text-gray-400 max-w-sm mx-auto">Your journey history will appear here once you take your first ride.</p>
              </div>
            )}
          </div>
        </section>

        {error && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-600 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 z-[9999] border-4 border-white">
            <Icon icon="mdi:alert-decagram" className="text-2xl" />
            <p className="font-black text-sm">{error}</p>
            <button onClick={() => setError(null)} className="ml-4 hover:scale-125 transition-transform"><Icon icon="mdi:close-circle" /></button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
