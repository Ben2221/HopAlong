import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Button from "../components/Button";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import api from "../services/api";
import { useEffect, useState } from "react";
import { initSocket, getSocket, disconnectSocket } from "../services/socket";
import { Icon } from "@iconify/react";
import { motion } from "motion/react";

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
    <div className="min-h-screen bg-gray-50 pb-12">
      <DashboardHeader 
        name={user.name} 
        role={user.role} 
        pseudonym={user.pseudonym}
        walletBalance={user.walletBalance}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Broadcast Banner */}
        {publicSettings?.broadcastBanner?.isActive && (
          <motion.div 
            className={`mb-6 p-4 rounded-2xl flex items-center gap-4 shadow-sm border-l-8 ${
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

        {/* DRIVER UI */}
        {user.role === 'driver' && (
          <div className="mb-8">
             <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isOnline ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      <Icon icon={isOnline ? "mdi:car-connected" : "mdi:car-off"} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Driver Status</h3>
                      <p className="text-sm text-gray-500">You are currently <span className={`font-bold ${isOnline ? 'text-green-600' : 'text-gray-400'}`}>{isOnline ? 'Online' : 'Offline'}</span></p>
                    </div>
                  </div>
                   <button 
                    onClick={toggleOnlineStatus}
                    className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${isOnline ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-green-500 hover:bg-green-600 shadow-green-200'}`}
                  >
                    {isOnline ? 'Go Offline' : 'Go Online'}
                  </button>
               </div>
             </div>

             {incomingRequest && (
               <div className="mt-4 bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded shadow-md">
                 <h4 className="font-bold text-yellow-800 flex items-center gap-2">
                   <Icon icon="mdi:car-hatchback" /> New Ride Request!
                 </h4>
                 <p className="mt-2 text-sm text-yellow-700"><strong>From:</strong> {incomingRequest.pickup.address}</p>
                 <p className="text-sm text-yellow-700"><strong>To:</strong> {incomingRequest.dropoff.address}</p>
                 <p className="text-sm font-bold text-yellow-800 mt-2">Fare: ${incomingRequest.fare}</p>
                 <div className="mt-4 flex gap-4">
                   <Button onClick={() => acceptRide(incomingRequest.rideId)}>Accept Ride</Button>
                   <button onClick={() => setIncomingRequest(null)} className="text-gray-500 hover:text-gray-800">Dismiss</button>
                 </div>
               </div>
             )}
          </div>
        )}

        {/* RIDER UI */}
        {(user.role === 'rider' || user.role === 'admin') && (
          <div className="space-y-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/create-ride" className="flex-1">
                <Button
                  fullWidth
                  icon="mdi:car-plus"
                  className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 h-16 text-lg rounded-2xl shadow-yellow-100"
                >
                  Create Public Ride
                </Button>
              </Link>
              
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between sm:justify-start gap-4 px-6 w-full sm:w-auto">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isAnonymous ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>
                    <Icon icon={isAnonymous ? "mdi:incognito" : "mdi:account-eye"} className="text-xl" />
                  </div>
                  <span className="text-sm font-bold text-gray-700">Privacy Mode</span>
                </div>
                <button 
                  onClick={togglePrivacy}
                  className={`w-12 h-6 rounded-full transition-colors relative ${isAnonymous ? 'bg-yellow-400' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${isAnonymous ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>

            {availableRides.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-yellow-50">
                  <h3 className="text-lg font-bold text-yellow-800 flex items-center gap-2">
                    <Icon icon="mdi:car-connected" /> Available Shared Rides
                  </h3>
                </div>
                <ul className="divide-y divide-gray-200">
                  {availableRides.map(ride => (
                    <li key={ride._id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-800">{ride.pickupLocation.address} → {ride.dropoffLocation.address}</p>
                        <p className="text-sm text-gray-500">
                          Passengers: {ride.riders.length}/{ride.maxRiders} | 
                          Price: <span className="font-bold text-green-600">${Math.round(ride.fare / (ride.riders.length + 1))}</span> (split)
                        </p>
                      </div>
                      <Button size="sm" onClick={() => joinRide(ride._id)}>Join</Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Your Ride History</h2>
          </div>
          
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : rides.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {rides.map(ride => (
                <li key={ride._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <p className="font-medium text-gray-900">{ride.pickupLocation.address} → {ride.dropoffLocation.address}</p>
                      <p className="text-sm text-gray-500">{new Date(ride.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-left sm:text-right w-full sm:w-auto flex sm:block justify-between items-center">
                      <p className="font-bold text-gray-900">${ride.fare}</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${ride.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {ride.status}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center text-gray-500">No rides found.</div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
