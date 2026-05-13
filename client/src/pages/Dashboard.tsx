import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import api from "../services/api";
import { useEffect, useState } from "react";
import { initSocket, getSocket, disconnectSocket } from "../services/socket";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "motion/react";
import StatsCard from "../components/dashboard/StatsCard";
import Map from "../components/Map";
import PlaceAutocomplete from "../components/PlaceAutocomplete";
import { usePlaceSuggestions } from "../hooks/usePlaceSuggestions";
import { useRouteStore } from "../store/routeStore";

interface Ride {
  _id: string;
  pickupLocation: { address: string };
  dropoffLocation: { address: string };
  status: string;
  fare: number;
  departureTime: string;
  createdAt: string;
}

const Dashboard = () => {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();

  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hosting state
  const [isOnline, setIsOnline] = useState(false);
  const [incomingRequest, setIncomingRequest] = useState<any>(null);

  // Rider state
  const [availableRides, setAvailableRides] = useState<any[]>([]);
  const [sosAlert, setSosAlert] = useState<any>(null);

  const [publicSettings, setPublicSettings] = useState<any>(null);

  // Search state
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [searchDate, setSearchDate] = useState<Date | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearchMinimized, setIsSearchMinimized] = useState(false);

  const { from: storeFrom, to: storeTo } = useRouteStore();

  const { suggestions: fromSuggestions, isLoading: isLoadingFrom } = usePlaceSuggestions(searchFrom);
  const { suggestions: toSuggestions, isLoading: isLoadingTo } = usePlaceSuggestions(searchTo);

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
      if (user?.role === 'student' || user?.role === 'admin') {
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

    if (user.role === 'student') {
      socket.on('new_ride_invite', (data) => {
        setIncomingRequest(data);
      });

      socket.on('ride_accepted_success', (data) => {
        navigate(`/rides/${data.rideId}`);
      });
    }

    if (user.role === 'student' || user.role === 'admin') {
      socket.on('ride_accepted', (data) => {
        navigate(`/rides/${data.rideId}`);
      });

      socket.on('new_ride_available', () => {
        console.log("[Socket] New ride available, refreshing list...");
        fetchAvailableRides();
      });

      socket.on('sos_alert', (data) => {
        console.error('[SOS] RECEIVED EMERGENCY ALERT:', data);
        setSosAlert(data);
        // Play a sound or trigger a browser notification if possible
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
      socket.emit('host_status', { isOnline: newStatus });

      if (newStatus && navigator.geolocation) {
        navigator.geolocation.watchPosition((position) => {
          socket.emit('host_location', {
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

  const joinRide = async (rideId: string, isFromSearch: boolean = false) => {
    try {
      const payload: any = { rideId };
      
      // If joining from search results, use the searched sub-route for proportional fare calculation
      if (isFromSearch && storeFrom && storeTo) {
        payload.pickupLocation = { lat: storeFrom.latitude, lng: storeFrom.longitude, address: storeFrom.name };
        payload.dropoffLocation = { lat: storeTo.latitude, lng: storeTo.longitude, address: storeTo.name };
      }

      await api.post('/rides/join', payload);
      navigate(`/rides/${rideId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to join ride");
    }
  };



  const handleSearch = async () => {
    if (!storeFrom || !storeTo) {
      setError("Please select both pickup and destination");
      return;
    }
    setIsSearching(true);
    setShowSearchResults(true);
    try {
      const response = await api.get('/rides/available', {
        params: {
          pickupLat: storeFrom.latitude,
          pickupLng: storeFrom.longitude,
          dropoffLat: storeTo.latitude,
          dropoffLng: storeTo.longitude,
          date: searchDate?.toISOString()
        }
      });
      // Filter out rides where the user is already a participant
      const filtered = response.data.filter((r: any) =>
        !r.riders.some((rider: any) =>
          (typeof rider === 'string' && rider === user?.id) ||
          (rider._id === user?.id)
        )
      );
      setSearchResults(filtered);
    } catch (err: any) {
      setError("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const activeRides = rides.filter(r => r.status !== 'completed' && r.status !== 'cancelled');

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <DashboardHeader
        name={user.name}
        role={user.role}
        walletBalance={user.walletBalance}
        pseudonym={user.pseudonym}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* SOS Alert for Admins */}
        <AnimatePresence>
          {sosAlert && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-8 p-6 bg-red-600 text-white rounded-[32px] shadow-2xl border-4 border-white flex flex-col md:flex-row items-center gap-6 z-50 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-red-700 animate-pulse opacity-50" />
              <div className="relative z-10 w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-lg">
                <Icon icon="mdi:alert-decagram" className="text-4xl animate-bounce" />
              </div>
              <div className="relative z-10 flex-1 text-center md:text-left">
                <h3 className="text-2xl font-black uppercase tracking-tighter">Emergency SOS Triggered!</h3>
                <p className="font-bold text-red-100">User <span className="text-white">{sosAlert.userName}</span> has triggered an emergency for ride <span className="text-white">#{sosAlert.rideId.slice(-6)}</span></p>
              </div>
              <div className="relative z-10 flex gap-3">
                <button
                  onClick={() => navigate(`/rides/${sosAlert.rideId}`)}
                  className="bg-white text-red-600 px-8 py-3 rounded-xl font-black shadow-lg hover:bg-gray-100 transition-all"
                >
                  View Ride
                </button>
                <button
                  onClick={() => setSosAlert(null)}
                  className="bg-red-800/50 text-white px-4 py-3 rounded-xl font-bold hover:bg-red-800 transition-all"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Broadcast Banner */}
        {publicSettings?.broadcastBanner?.isActive && (
          <motion.div
            className={`mb-8 p-4 rounded-2xl flex items-center gap-4 shadow-sm border-l-8 ${publicSettings.broadcastBanner.type === 'alert' ? 'bg-red-50 border-red-500 text-red-800' :
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
        {user.role === 'student' ? (
          /* DRIVER VIEW */
          <div className="space-y-8">
            <section className="relative h-[250px] rounded-[32px] overflow-hidden shadow-2xl group bg-gray-900">
              <div className="absolute inset-0 opacity-40">
                <Map />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/60 to-transparent" />
              <div className="absolute inset-0 p-8 flex flex-col justify-center">
                <h2 className="text-3xl md:text-5xl font-black text-white mb-2">Student Hub</h2>
                <p className="text-yellow-400 font-bold">Share rides, save costs, and build community.</p>
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
                      <h3 className="text-2xl font-black text-gray-900">Hosting Status: {isOnline ? 'ACTIVE' : 'INACTIVE'}</h3>
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
            <div className="space-y-12">

              <section className="flex flex-col md:block relative h-auto md:h-[550px] rounded-[40px] shadow-2xl group border-4 border-white overflow-hidden bg-gray-900">
                <div className="relative md:absolute md:inset-0 z-0 h-[300px] md:h-full">
                  <Map rides={showSearchResults ? searchResults : availableRides} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none z-10 hidden md:block" />
                </div>
                
                <div className="relative md:absolute md:inset-0 p-4 sm:p-8 flex flex-col justify-end z-20 bg-gray-900 md:bg-transparent">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: isSearchMinimized ? 0.95 : 1
                    }}
                    className={`max-w-4xl w-full pointer-events-auto bg-white/5 md:bg-white/10 backdrop-blur-xl p-5 sm:p-8 rounded-[24px] sm:rounded-[40px] border border-white/10 md:border-white/20 transition-all shadow-2xl ${isSearchMinimized ? 'opacity-60 hover:opacity-100' : ''}`}
                  >
                    {!isSearchMinimized && (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                        <div>
                          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-none">Find a Hop-Along</h2>
                          <p className="text-gray-400 text-[10px] sm:text-sm font-bold uppercase tracking-[0.2em] mt-2">Campus Connectivity Hub</p>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <button
                            onClick={() => navigate('/create-ride')}
                            className="flex-1 sm:flex-none bg-yellow-400 hover:bg-yellow-500 text-amber-900 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                          >
                            <Icon icon="mdi:plus-circle" className="text-lg" />
                            Host a Journey
                          </button>
                          <button
                            onClick={() => setIsSearchMinimized(true)}
                            className="w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl flex items-center justify-center text-white transition-colors shadow-lg shrink-0"
                            title="Minimize"
                          >
                            <Icon icon="mdi:chevron-down" className="text-2xl" />
                          </button>
                        </div>
                      </div>
                    )}

                    {!isSearchMinimized && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 sm:gap-4 relative z-10"
                      >
                        <div className="flex-1 relative w-full">
                          <PlaceAutocomplete
                            placeholder="From..."
                            value={searchFrom}
                            onChange={(v) => setSearchFrom(v)}
                            suggestions={fromSuggestions}
                            isLoading={isLoadingFrom}
                            locationType="from"
                            className="!bg-white !rounded-2xl"
                            hideLabel
                          />
                        </div>
                        <div className="flex-1 relative w-full">
                          <PlaceAutocomplete
                            placeholder="To..."
                            value={searchTo}
                            onChange={(v) => setSearchTo(v)}
                            suggestions={toSuggestions}
                            isLoading={isLoadingTo}
                            locationType="to"
                            className="!bg-white !rounded-2xl"
                            hideLabel
                          />
                        </div>
                        <div className="w-full lg:w-64 relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
                            <Icon icon="mdi:calendar-clock" className="text-xl" />
                          </div>
                          <input
                            type="datetime-local"
                            onChange={(e) => setSearchDate(new Date(e.target.value))}
                            className="w-full h-14 bg-white rounded-2xl pl-12 pr-4 text-gray-500 font-bold outline-none border-2 border-transparent focus:border-yellow-400 focus:text-gray-900 shadow-sm transition-colors"
                          />
                        </div>
                        <button
                          onClick={handleSearch}
                          disabled={isSearching}
                          className="w-full lg:w-auto bg-yellow-400 text-amber-900 h-14 px-8 rounded-2xl font-black shadow-xl hover:bg-yellow-500 transition-all flex items-center justify-center gap-3 shrink-0 active:scale-95"
                        >
                          {isSearching ? <Icon icon="mdi:loading" className="animate-spin text-2xl" /> : <Icon icon="mdi:magnify" className="text-2xl" />}
                          <span className="lg:hidden">Search Rides</span>
                        </button>
                      </motion.div>
                    )}

                    {isSearchMinimized && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex flex-wrap items-center gap-6 text-white/90 text-sm font-black">
                          <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl">
                            <Icon icon="mdi:map-marker" className="text-yellow-400 text-lg" />
                            {searchFrom || "Anywhere"}
                          </div>
                          <Icon icon="mdi:arrow-right-thick" className="text-yellow-400/50" />
                          <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl">
                            <Icon icon="mdi:map-marker-radius" className="text-red-400 text-lg" />
                            {searchTo || "Destination"}
                          </div>
                        </div>
                        <button
                          onClick={() => setIsSearchMinimized(false)}
                          className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                          <Icon icon="mdi:magnify" />
                          Expand Search
                        </button>
                      </div>
                    )}
                  </motion.div>
                </div>
              </section>

              <AnimatePresence>
                {showSearchResults && (
                  <motion.section
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[40px] p-10 shadow-xl border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-100">
                          <Icon icon="mdi:account-group" className="text-amber-900 text-2xl" />
                        </div>
                        <div>
                          <h3 className="text-3xl font-black text-gray-900 tracking-tight">Available Hop-Alongs</h3>
                          <p className="text-gray-400 text-sm font-bold">Pick your preferred ride for today</p>
                        </div>
                      </div>
                      <button onClick={() => setShowSearchResults(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-500 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">Clear</button>
                    </div>

                    {isSearching ? (
                      <div className="flex flex-col items-center justify-center py-24 gap-6">
                        <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Scanning campus routes...</p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {searchResults.map(ride => (
                          <motion.div
                            key={ride._id}
                            whileHover={{ y: -8 }}
                            className="bg-white p-8 rounded-[40px] border-2 border-gray-50 shadow-sm hover:shadow-2xl hover:border-yellow-200 transition-all cursor-pointer group"
                          >
                            <div className="flex justify-between items-center mb-6">
                              <div className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <Icon icon="mdi:clock-outline" className="text-lg" />
                                {new Date(ride.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              <div className="text-xs font-black text-gray-400 uppercase flex items-center gap-2">
                                <Icon icon="mdi:account-group" className="text-lg" />
                                {ride.maxRiders - ride.riders.length} Seats
                              </div>
                            </div>
                            <div className="space-y-4 mb-8">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-green-500 ring-4 ring-green-50 shrink-0" />
                                <p className="text-lg font-bold text-gray-900 truncate">{ride.pickupLocation.address.split(',')[0]}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-50 shrink-0" />
                                <p className="text-lg font-bold text-gray-900 truncate">{ride.dropoffLocation.address.split(',')[0]}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => joinRide(ride._id, true)}
                              className="w-full bg-gray-900 text-white py-5 rounded-[24px] text-sm font-black hover:bg-yellow-400 hover:text-amber-900 transition-all shadow-xl flex items-center justify-center gap-3 group-hover:scale-[1.02]"
                            >
                              Hop In <span className="opacity-20">|</span> Custom Route (Fare Proportioned)
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 border-4 border-dashed border-gray-100 rounded-[40px] p-20 text-center">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                          <Icon icon="mdi:car-off" className="text-5xl text-gray-200" />
                        </div>
                        <h4 className="text-2xl font-black text-gray-700">No rides found</h4>
                        <p className="text-gray-400 font-bold mt-2">Try adjusting the time or create a new journey!</p>
                        <button
                          onClick={() => navigate('/create-ride', {
                            state: {
                              from: searchFrom,
                              to: searchTo,
                              date: searchDate,
                              fromLoc: fromSuggestions.find(s => s.formatted === searchFrom),
                              toLoc: toSuggestions.find(s => s.formatted === searchTo)
                            }
                          })}
                          className="mt-10 bg-yellow-400 text-amber-900 px-10 py-4 rounded-[20px] font-black shadow-xl hover:bg-yellow-500 transition-all active:scale-95"
                        >
                          Create New Ride
                        </button>
                      </div>
                    )}
                  </motion.section>
                )}
              </AnimatePresence>

              {/* Active Journeys Section moved here */}
              {activeRides.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-12"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-200">
                      <Icon icon="mdi:map-marker-path" className="text-white text-xl" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Active Journeys</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeRides.map(activeRide => (
                      <motion.div
                        key={activeRide._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-900 rounded-[40px] p-8 relative overflow-hidden shadow-2xl border-2 border-green-500/30"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                        <div className="flex justify-between items-start mb-8">
                          <div>
                            <span className="bg-green-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
                              LIVE: {activeRide.status}
                            </span>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-3">Current Route</p>
                            <h4 className="text-xl font-black text-white leading-tight mt-1">
                              {activeRide.pickupLocation.address.split(',')[0]} → {activeRide.dropoffLocation.address.split(',')[0]}
                            </h4>
                          </div>
                          <div className="bg-white/10 p-3 rounded-2xl text-white">
                            <Icon icon="mdi:car-clock" className="text-2xl" />
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(`/rides/${activeRide._id}`)}
                          className="w-full bg-green-500 hover:bg-green-400 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-green-900/20 transition-all flex items-center justify-center gap-3 group"
                        >
                          Resume Journey
                          <Icon icon="mdi:arrow-right" className="group-hover:translate-x-2 transition-transform" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}



              {/* Available Shared Rides Grid */}
              <section id="available-rides" className="scroll-mt-6">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow-lg">
                    <Icon icon="mdi:account-group" className="text-amber-900 text-xl" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Available Hop-Alongs</h3>
                </div>

                {availableRides.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableRides.map(ride => (
                      <motion.div key={ride._id} whileHover={{ y: -5 }} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex -space-x-2">
                              {[1, 2, 3].slice(0, ride.riders.length).map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-400">U</div>
                              ))}
                            </div>
                            <span className="text-[10px] font-black text-yellow-600 bg-yellow-50 px-2 py-1 rounded-lg uppercase tracking-tighter">{ride.maxRiders - ride.riders.length} Seats left</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                                <Icon icon="mdi:calendar-clock" className="text-sm" />
                                {new Date(ride.departureTime).toLocaleDateString()} at {new Date(ride.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
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
                <StatsCard label="Saved" value={`₹${rides.reduce((acc, r) => acc + (r.status === 'completed' ? r.fare : 0), 0).toFixed(0)}`} icon="mdi:wallet" color="text-green-600" />
                <StatsCard label="Eco Points" value={rides.filter(r => r.status === 'completed').length * 50} icon="mdi:leaf" color="text-emerald-500" />
                <StatsCard label="Safe Journeys" value={rides.length > 0 ? "100%" : "0%"} icon="mdi:shield-check" color="text-blue-500" />
              </section>
            </div>
          </div>
        )}

        {/* SHARED RECENT ACTIVITY */}
        <section className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Recent Activity</h3>
            <button
              onClick={() => navigate("/history")}
              className="text-yellow-600 font-bold text-sm hover:underline"
            >
              Full History
            </button>
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
                        <p className="text-[10px] uppercase font-black text-gray-400 mt-2 tracking-widest">{user.role === 'student' ? 'Revenue' : 'Wallet'}</p>
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
