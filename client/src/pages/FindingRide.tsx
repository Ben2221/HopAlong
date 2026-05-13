import { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/ui/Spinner";
import { useRouteStore } from "../store/routeStore";
import { useAuthStore } from "../store/authStore";
import { initSocket, getSocket } from "../services/socket";
import api from "../services/api";

const loadingMessages = [
  "Revving our engines...",
  "Calculating the optimal route to avoid traffic...",
  "Scanning for nearby hosts...",
  "Warming up the seat heaters...",
  "Assigning your ride a cool codename...",
];

export default function FindingRide() {
  const navigate = useNavigate();
  const { from, to, isPublic, maxRiders } = useRouteStore();
  const { token, user } = useAuthStore();
  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const hasRequested = useRef(false);

  useEffect(() => {
    if (hasRequested.current) return;
    
    if (!token || !user) {
      navigate('/login');
      return;
    }
    
    if (!from || !to) {
      navigate('/dashboard');
      return;
    }

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);

    const socket = getSocket() || initSocket(token);
    
    // Estimate fare and emit request
    const requestRide = async () => {
      try {
        const response = await api.post('/rides/estimate', {
          pickupLocation: { lat: from.latitude, lng: from.longitude },
          dropoffLocation: { lat: to.latitude, lng: to.longitude }
        });
        
        socket.emit('request_ride', {
          pickup: { lat: from.latitude, lng: from.longitude, address: from.name },
          dropoff: { lat: to.latitude, lng: to.longitude, address: to.name },
          fare: response.data.fare,
          isPublic,
          maxRiders
        });

      } catch (err: any) {
        setError(err.message || "Failed to request ride");
      }
    };

    hasRequested.current = true;
    requestRide();

    // Listen for events
    socket.on('ride_accepted', (data) => {
      // Redirect to the active ride view
      navigate(`/rides/${data.rideId}`);
    });

    socket.on('ride_request_failed', (data) => {
      setError(data.message);
    });

    return () => {
      clearInterval(interval);
      socket.off('ride_accepted');
      socket.off('ride_request_failed');
    };
  }, [from, to, token, user, navigate]);

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Finding Your Ride
          </h1>

          <div className="mb-6 flex justify-center">
            <Spinner size="lg" color="text-yellow-400" />
          </div>

          <div className="h-16 flex items-center justify-center">
            <motion.p
              key={messageIndex}
              className="text-lg text-gray-600"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {loadingMessages[messageIndex]}
            </motion.p>
          </div>

          <div className="mt-6 py-4 px-6 bg-yellow-50 rounded-lg">
            <p className="text-sm text-gray-600">
              From: <span className="font-medium">{from?.name}</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              To: <span className="font-medium">{to?.name}</span>
            </p>
          </div>

          {error && (
            <div className="mt-4 text-red-500 text-sm font-medium">Error: {error}</div>
          )}
        </div>

        <motion.div
          className="h-1 w-full bg-gradient-to-r from-yellow-400 to-amber-500 mt-6"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{ transformOrigin: "left" }}
        />
      </motion.div>
    </motion.div>
  );
}
