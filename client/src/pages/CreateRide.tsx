import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import Map from "../components/Map";
import { usePlaceSuggestions } from "../hooks/usePlaceSuggestions";
import PlaceAutocomplete from "../components/PlaceAutocomplete";
import DateTimePicker from "../components/DateTimePicker";
import Button from "../components/Button";
import { useRouteStore } from "../store/routeStore";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import { useAuthStore } from "../store/authStore";
import api from "../services/api";
import { getSocket, initSocket } from "../services/socket";

const CreateRide = () => {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const resetRouteStore = useRouteStore((state) => state.resetOnPageLoad);
  const storeFrom = useRouteStore((state) => state.from);
  const storeTo = useRouteStore((state) => state.to);

  useEffect(() => {
    resetRouteStore();
  }, [resetRouteStore]);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [maxRiders, setMaxRiders] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nearbyRides, setNearbyRides] = useState<any[]>([]);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);

  // Memoize expensive API calls and computations
  const { suggestions: fromSuggestions, isLoading: isLoadingFrom } =
    usePlaceSuggestions(fromQuery);

  const { suggestions: toSuggestions, isLoading: isLoadingTo } =
    usePlaceSuggestions(toQuery);

  // Memoize validation states
  const isLocationSelectionValid = useMemo(() => {
    return !!storeFrom && !!storeTo;
  }, [storeFrom, storeTo]);

  const isTimeSelectionValid = useMemo(() => {
    return !!selectedDateTime;
  }, [selectedDateTime]);

  // Handle input changes
  const handleFromChange = (value: string) => {
    setFrom(value);
    setFromQuery(value);
  };

  const handleToChange = (value: string) => {
    setTo(value);
    setToQuery(value);
  };

  useEffect(() => {
    const fetchNearby = async () => {
      if (storeFrom && storeTo) {
        setIsLoadingNearby(true);
        try {
          const response = await api.get('/rides/available', {
            params: {
              pickupLat: storeFrom.latitude,
              pickupLng: storeFrom.longitude,
              dropoffLat: storeTo.latitude,
              dropoffLng: storeTo.longitude
            }
          });
          setNearbyRides(response.data);
        } catch (err) {
          console.error("Failed to fetch nearby rides", err);
        } finally {
          setIsLoadingNearby(false);
        }
      }
    };
    fetchNearby();
  }, [storeFrom, storeTo]);

  const handleJoinExisting = async (rideId: string) => {
    if (!storeFrom || !storeTo || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api.post('/rides/join', {
        rideId,
        pickupLocation: { lat: storeFrom.latitude, lng: storeFrom.longitude, address: storeFrom.name },
        dropoffLocation: { lat: storeTo.latitude, lng: storeTo.longitude, address: storeTo.name }
      });
      navigate(`/rides/${rideId}`);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to join ride");
      setIsSubmitting(false);
    }
  };

  const handleShowTimePicker = () => {
    setShowTimePicker(true);
  };

  const handleDateTimeSelected = useCallback((dateTime: Date | null) => {
    setSelectedDateTime(dateTime);
  }, []);

  const handleConfirmRide = async () => {
    if (!selectedDateTime || isSubmitting || !storeFrom || !storeTo || !token) return;

    setIsSubmitting(true);
    
    try {
      // 1. Get fare estimate
      const response = await api.post('/rides/estimate', {
        pickupLocation: { lat: storeFrom.latitude, lng: storeFrom.longitude },
        dropoffLocation: { lat: storeTo.latitude, lng: storeTo.longitude }
      });

      const fare = response.data.fare;

      // 2. Initialize socket if needed
      const socket = getSocket() || initSocket(token);

      // 3. Listen for success to navigate directly (Register BEFORE emitting)
      const handleSuccess = (data: { rideId: string }) => {
        socket.off('ride_request_success', handleSuccess);
        navigate(`/rides/${data.rideId}`);
      };

      socket.on('ride_request_success', handleSuccess);

      // 4. Emit request_ride
      socket.emit('request_ride', {
        pickup: { lat: storeFrom.latitude, lng: storeFrom.longitude, address: storeFrom.name },
        dropoff: { lat: storeTo.latitude, lng: storeTo.longitude, address: storeTo.name },
        fare,
        isPublic,
        maxRiders
      });

      // Timeout fallback to dashboard if socket event takes too long
      setTimeout(() => {
        socket.off('ride_request_success', handleSuccess);
        // Only navigate if we're still on the create page (prevents double nav)
        if (window.location.pathname === '/create-ride') {
          navigate("/dashboard");
        }
      }, 5000);

    } catch (err: any) {
      console.error("Failed to create ride:", err);
      alert(err.response?.data?.message || "Failed to create ride. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-10">
      <DashboardHeader
        name={user.name}
        role={user.role}
        walletBalance={user.walletBalance}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 w-full flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Create a New Journey</h2>
        </div>

        <div className="h-[300px] md:h-[400px] rounded-[32px] overflow-hidden shadow-2xl mb-8 relative">
          <Map />
        </div>

        <motion.div
          className="bg-white shadow-2xl rounded-[32px] p-8 border border-gray-100"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {!showTimePicker ? (
                <motion.div
                  key="location-selection"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -300 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <PlaceAutocomplete
                      label="From"
                      placeholder="Enter pickup location"
                      value={from}
                      onChange={handleFromChange}
                      suggestions={fromSuggestions}
                      isLoading={isLoadingFrom}
                      icon="mdi:map-marker-radius"
                      locationType="from"
                      delay={0.1}
                    />

                    <PlaceAutocomplete
                      label="To"
                      placeholder="Enter destination"
                      value={to}
                      onChange={handleToChange}
                      suggestions={toSuggestions}
                      isLoading={isLoadingTo}
                      icon="mdi:map-marker-check"
                      locationType="to"
                      delay={0.2}
                    />
                  </div>

                  <div className="flex justify-center my-8">
                    <Button
                      icon="mdi:clock-outline"
                      onClick={handleShowTimePicker}
                      disabled={!isLocationSelectionValid}
                    >
                      Choose time
                    </Button>
                  </div>

                  <div className="h-6 min-h-6">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isLocationSelectionValid ? 0 : 1 }}
                      style={{
                        visibility: isLocationSelectionValid ? "hidden" : "visible",
                      }}
                      className="text-center text-yellow-600 text-sm"
                    >
                      <Icon icon="mdi:information" className="inline-block mr-1" />
                      Please select both pickup and destination locations
                    </motion.div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="time-selection"
                  initial={{ opacity: 0, x: 300 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <DateTimePicker onDateTimeSelected={handleDateTimeSelected} />

                  <div className="bg-gray-50 p-4 rounded-xl mb-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-gray-800">Public Ride (Carpool)</h4>
                        <p className="text-xs text-gray-500">Allow others to join and split the fare</p>
                      </div>
                      <button
                        onClick={() => setIsPublic(!isPublic)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${isPublic ? 'bg-yellow-400' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isPublic ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>

                    {isPublic && (
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <div>
                          <h4 className="font-bold text-gray-800">Max Passengers</h4>
                          <p className="text-xs text-gray-500">Maximum people in the car</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setMaxRiders(Math.max(1, maxRiders - 1))}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                          >
                            -
                          </button>
                          <span className="font-bold w-4 text-center">{maxRiders}</span>
                          <button
                            onClick={() => setMaxRiders(Math.min(6, maxRiders + 1))}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center">
                    <Button
                      icon="mdi:check-circle"
                      onClick={handleConfirmRide}
                      disabled={!isTimeSelectionValid || isSubmitting}
                    >
                      {isSubmitting ? "Processing..." : "Confirm Ride"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Nearby Available Rides */}
        <AnimatePresence>
          {isLocationSelectionValid && !showTimePicker && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-10"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-lg">
                  <Icon icon="mdi:car-multiple" className="text-white text-lg" />
                </div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Available Hop-Alongs on your route</h3>
              </div>

              {isLoadingNearby ? (
                <div className="flex justify-center p-10">
                  <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : nearbyRides.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nearbyRides.map(ride => (
                    <motion.div 
                      key={ride._id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white p-6 rounded-3xl border-2 border-green-100 shadow-sm flex justify-between items-center"
                    >
                      <div>
                        <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">On your way</p>
                        <h4 className="font-black text-gray-900 truncate max-w-[200px]">
                          {ride.pickupLocation.address.split(',')[0]} → {ride.dropoffLocation.address.split(',')[0]}
                        </h4>
                        <div className="flex items-center gap-2 mt-2">
                          <Icon icon="mdi:account-group" className="text-gray-400" />
                          <span className="text-xs font-bold text-gray-500">{ride.maxRiders - ride.riders.length} seats available</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleJoinExisting(ride._id)}
                        disabled={isSubmitting}
                        className="bg-green-500 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-green-600 transition-all shadow-lg"
                      >
                        Join This
                      </button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-100/50 border-2 border-dashed border-gray-200 rounded-3xl p-8 text-center">
                  <p className="text-gray-500 font-bold text-sm">No existing rides matching your route yet.</p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase font-black">You can create your own ride above!</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CreateRide;
