import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useAuthStore } from "../store/authStore";
import api from "../services/api";
import { initSocket, getSocket } from "../services/socket";

import { Icon } from "@iconify/react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon as LeafletIcon, LatLngExpression } from "leaflet";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

const pickupIcon = new LeafletIcon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const dropoffIcon = new LeafletIcon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const driverIcon = new LeafletIcon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Auto-pan the map to driver location when it updates
function PanToDriver({ position }: { position: LatLngExpression | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.panTo(position, { animate: true, duration: 1 });
    }
  }, [map, position]);
  return null;
}

interface RideData {
  _id: string;
  status: string;
  fare: number;
  pickupLocation: {
    coordinates: [number, number]; // [lng, lat]
    address: string;
  };
  dropoffLocation: {
    coordinates: [number, number];
    address: string;
  };
  riders: { 
    id: string; 
    name: string; 
    email: string; 
    pseudonym: string; 
    isAnonymous: boolean 
  }[];
  riderSegments: {
    userId: string;
    pickupLocation: { address: string; coordinates: [number, number] };
    dropoffLocation: { address: string; coordinates: [number, number] };
    distance: number;
  }[];
  driver?: { id: string; name: string; email: string };
  maxRiders: number;
}

const STATUS_STEPS = ["pending", "accepted", "ongoing", "completed"];

const RideDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuthStore();

  const [ride, setRide] = useState<RideData | null>(null);
  const [driverLocation, setDriverLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!token || !id || !user) {
      navigate("/login");
      return;
    }

    const fetchRide = async () => {
      try {
        const response = await api.get(`/rides/${id}`);
        console.log("[Diagnostic] Ride data fetched:", response.data);
        setRide(response.data);
      } catch (err: any) {
        console.error("[Diagnostic] Fetch error:", err);
        setError(err.response?.data?.message || err.message || "Failed to fetch ride");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRide();

    const socket = getSocket() || initSocket(token);

    socket.on("ride_status_updated", (data: { status: string }) => {
      setRide((prev) => (prev ? { ...prev, status: data.status } : null));
    });

    socket.on("driver_moved", (data: { lat: number; lng: number }) => {
      setDriverLocation(data);
    });

    socket.on("rider_joined", () => {
      // Re-fetch ride to get updated list of riders
      fetchRide();
    });

    // Notify room that we've joined
    socket.emit("join_ride_room", { rideId: id });

    return () => {
      socket.off("ride_status_updated");
      socket.off("driver_moved");
      socket.off("rider_joined");
    };
  }, [id, token, user, navigate]);

  const updateStatus = async (newStatus: string) => {
    if (!ride) return;
    const socket = getSocket();
    if (socket) {
      setUpdating(true);
      socket.emit("update_ride_status", { rideId: ride._id, status: newStatus });
      setRide({ ...ride, status: newStatus });
      setUpdating(false);
    }
  };

  const handleDeleteRide = async () => {
    if (!ride) return;
    if (!window.confirm("Are you sure you want to delete this ride? This action cannot be undone.")) return;

    try {
      setUpdating(true);
      await api.delete(`/rides/${ride._id}`);
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Delete error:", err);
      alert(err.response?.data?.message || "Failed to delete ride");
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    let watchId: number | null = null;
    
    if (user?.role === 'driver' && (ride?.status === 'accepted' || ride?.status === 'ongoing')) {
      const socket = getSocket();
      if (socket && navigator.geolocation) {
        console.log("[Tracking] Starting live location broadcast...");
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const locationData = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            socket.emit('driver_location', locationData);
            setDriverLocation(locationData);
          },
          (err) => console.error("[Tracking] Geolocation error:", err),
          { enableHighAccuracy: true }
        );
      }
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [user?.role, ride?.status, ride?._id]);

  // Rough ETA calculation (Distance in KM / Avg Campus Speed 20km/h)
  const calculateETA = () => {
    if (!driverLocation || !ride) return null;
    
    // Simple Euclidean distance for MVP (could use Haversine)
    const latDiff = ride.dropoffLocation.coordinates[1] - driverLocation.lat;
    const lngDiff = ride.dropoffLocation.coordinates[0] - driverLocation.lng;
    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // Approx km
    
    const timeInMinutes = Math.round((distance / 20) * 60) + 2; // +2 mins buffer
    return timeInMinutes > 0 ? timeInMinutes : 1;
  };

  const eta = calculateETA();

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading ride details...</p>
        </div>
      </div>
    );

  if (error || !ride)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <Icon icon="mdi:alert-circle" className="text-red-500 text-5xl mb-4" />
          <p className="text-red-600 font-medium">{error || "Ride not found"}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 px-4 py-2 bg-yellow-400 text-white rounded-lg font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );

  // Convert GeoJSON [lng, lat] → [lat, lng] for Leaflet
  const pickupPos: LatLngExpression = [
    ride?.pickupLocation?.coordinates?.[1] || 0,
    ride?.pickupLocation?.coordinates?.[0] || 0,
  ];
  const dropoffPos: LatLngExpression = [
    ride?.dropoffLocation?.coordinates?.[1] || 0,
    ride?.dropoffLocation?.coordinates?.[0] || 0,
  ];
  const driverPos: LatLngExpression | null = driverLocation
    ? [driverLocation.lat, driverLocation.lng]
    : null;

  // Ensure mapCenter is never invalid
  const mapCenter: LatLngExpression = driverPos || pickupPos;
  const currentStep = STATUS_STEPS.indexOf(ride.status);

  const isOrganizer = user && ride && ride.riders.length > 0 && 
    ((ride.riders[0] as any)._id === user.id || (ride.riders[0] as any).id === user.id);
  const isAdmin = user?.role === 'admin';
  const canManageRide = isOrganizer || user?.role === 'driver' || isAdmin;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <motion.div
        className="bg-gradient-to-r from-yellow-400 to-amber-500 pt-12 pb-6 px-4 sm:px-6 lg:px-8"
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center text-white transition-all shadow-inner"
            >
              <Icon icon="mdi:arrow-left" className="text-xl" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Active Journey</h1>
              <p className="text-yellow-100 text-xs font-bold uppercase tracking-widest opacity-80">Ride ID: {ride._id.slice(-6)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
              onClick={() => navigate(`/chat?rideId=${ride._id}`)}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2 transition-all"
             >
                <Icon icon="mdi:chat-processing" className="text-lg" />
                Trip Chat
             </button>
             <span
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg ${
                ride.status === "completed"
                  ? "bg-green-500 text-white"
                  : ride.status === "cancelled"
                  ? "bg-red-500 text-white"
                  : "bg-white text-yellow-600"
              }`}
            >
              {ride.status}
            </span>
            {(isOrganizer || isAdmin) && ride.status !== 'completed' && (
              <button
                onClick={handleDeleteRide}
                disabled={updating}
                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl transition-all shadow-lg flex items-center justify-center disabled:opacity-50"
                title="Delete Ride"
              >
                <Icon icon="mdi:trash-can" className="text-xl" />
              </button>
            )}
            {!isOrganizer && !isAdmin && ride.status === 'pending' && (
               <button
                 onClick={async () => {
                    if (window.confirm("Are you sure you want to leave this ride?")) {
                      try {
                        setUpdating(true);
                        await api.post('/rides/leave', { rideId: ride._id });
                        navigate('/dashboard');
                      } catch (err: any) {
                        alert(err.response?.data?.message || "Failed to leave ride");
                      } finally {
                        setUpdating(false);
                      }
                    }
                 }}
                 disabled={updating}
                 className="bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50"
               >
                 Leave Ride
               </button>
            )}
          </div>
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* Status Progress Bar */}
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6">
          <h2 className="font-black text-gray-400 mb-6 text-[10px] uppercase tracking-[0.2em]">
            Journey Status
          </h2>
          <div className="flex items-center justify-between gap-2">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center relative">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-500 shadow-sm ${
                      i <= currentStep
                        ? "bg-yellow-400 text-amber-900 scale-110"
                        : "bg-gray-100 text-gray-300"
                    }`}
                  >
                    {i < currentStep ? (
                      <Icon icon="mdi:check-bold" className="text-xl" />
                    ) : (
                      i + 1
                    )}
                  </div>
                    <span className={`text-[10px] font-black mt-3 capitalize tracking-tighter transition-colors ${i <= currentStep ? 'text-gray-900' : 'text-gray-300'}`}>
                    {step}
                  </span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className="flex-1 h-1 mx-2 relative bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-yellow-400"
                      initial={{ width: 0 }}
                      animate={{ width: i < currentStep ? "100%" : "0%" }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Map & Live Info */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-[40px] shadow-xl overflow-hidden border border-gray-100">
            <div className="px-8 py-4 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <h2 className="font-black text-gray-900 tracking-tight">Live Tracking</h2>
              </div>
              {eta && (
                <div className="bg-yellow-50 text-yellow-700 px-4 py-1 rounded-full text-xs font-black uppercase">
                   Arriving in ~{eta} mins
                </div>
              )}
            </div>
            <MapContainer
              center={mapCenter}
              zoom={15}
              style={{ height: "450px", width: "100%" }}
              scrollWheelZoom
              className="z-0"
            >
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={pickupPos} icon={pickupIcon}>
                <Popup className="custom-popup">
                  <p className="font-black">Pickup Point</p>
                  <p className="text-xs text-gray-500">{ride?.pickupLocation?.address}</p>
                </Popup>
              </Marker>
              <Marker position={dropoffPos} icon={dropoffIcon}>
                <Popup>
                  <p className="font-black">Dropoff Point</p>
                  <p className="text-xs text-gray-500">{ride?.dropoffLocation?.address}</p>
                </Popup>
              </Marker>
              {driverPos && (
                <Marker position={driverPos} icon={driverIcon}>
                  <Popup>
                    <p className="font-black">Driver is here</p>
                  </Popup>
                </Marker>
              )}
              <PanToDriver position={driverPos} />
            </MapContainer>
          </div>

          {/* Side Info Cards */}
          <div className="space-y-6">
             {/* Fare Breakdown */}
             <div className="bg-amber-900 text-white rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                <h2 className="font-black text-yellow-400/50 text-[10px] uppercase tracking-widest mb-6">Payment Summary</h2>
                <div className="space-y-6">
                   <div className="flex justify-between items-end">
                      <p className="text-sm font-bold text-white/60 uppercase">Total Trip Fare</p>
                      <p className="text-3xl font-black text-white">₹{ride.fare.toFixed(2)}</p>
                   </div>
                   <div className="h-[1px] bg-white/10 w-full" />
                   <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-black text-yellow-400">Your Split Cost</p>
                        <p className="text-[10px] text-white/40 uppercase">Divided by {ride.riders.length} riders</p>
                      </div>
                      <p className="text-4xl font-black text-yellow-400">₹{(ride.fare / ride.riders.length).toFixed(2)}</p>
                   </div>
                </div>
             </div>

             {/* Driver Actions or Rider Message */}
             <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
                {canManageRide ? (
                  <div className="space-y-6">
                    <h2 className="font-black text-gray-400 text-[10px] uppercase tracking-widest">Journey Management</h2>
                    {ride.status !== "completed" && ride.status !== "cancelled" ? (
                      <div className="space-y-3">
                        {(ride.status === "pending" || ride.status === "accepted") && (
                          <button
                            onClick={() => updateStatus("ongoing")}
                            disabled={updating}
                            className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                          >
                            Start Journey / Pickup
                          </button>
                        )}
                        {ride.status === "ongoing" && (
                          <button
                            onClick={() => updateStatus("completed")}
                            disabled={updating}
                            className="w-full bg-green-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50"
                          >
                            Trip Complete / Drop Off
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="text-center font-bold text-gray-400 py-4 italic">Ride Concluded</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <h2 className="font-black text-gray-400 text-[10px] uppercase tracking-widest">Your Safety</h2>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        const socket = getSocket();
                        if (socket && window.confirm("Trigger SOS? This will alert campus security and share your live location.")) {
                          socket.emit('sos_trigger', { rideId: ride._id });
                          alert("Emergency alert sent! Stay calm, security is being notified.");
                        }
                      }}
                      className="w-full flex items-center gap-4 p-4 rounded-[24px] border-2 border-red-100 bg-red-50 hover:bg-red-100 transition-all group"
                    >
                       <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-200 group-hover:animate-pulse">
                          <Icon icon="mdi:alert-decagram" className="text-2xl" />
                       </div>
                       <div className="text-left">
                          <p className="font-black text-red-600">SOS Trigger</p>
                          <p className="text-[10px] text-red-400 font-bold uppercase">Share live tracking with campus security</p>
                       </div>
                    </motion.button>
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Riders & Driver List */}
        <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100">
           <div className="flex items-center justify-between mb-8">
              <h2 className="font-black text-gray-900 text-xl tracking-tight">Trip Members</h2>
              <span className="bg-gray-100 px-4 py-1.5 rounded-full text-xs font-black text-gray-500 uppercase tracking-widest">{ride.riders.length + (ride.driver ? 1 : 0)} Total</span>
           </div>
           
           <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Driver First if exists */}
              {ride.driver && typeof ride.driver === 'object' && 'name' in (ride.driver as any) && (
                <div className="p-4 bg-blue-50 rounded-3xl border border-blue-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black shadow-lg">
                    {(ride.driver as any).name?.charAt(0) || 'D'}
                  </div>
                  <div>
                    <p className="font-black text-blue-900 leading-none">{(ride.driver as any).name}</p>
                    <p className="text-[9px] uppercase font-black text-blue-400 mt-1">Certified Driver</p>
                  </div>
                </div>
              )}
              {/* Riders */}
              {ride.riders.map((r, idx) => {
                const segment = ride.riderSegments.find(s => s.userId === (r as any)._id || s.userId === (r as any).id);
                const isDifferent = segment && (
                  segment.pickupLocation.address !== ride.pickupLocation.address ||
                  segment.dropoffLocation.address !== ride.dropoffLocation.address
                );

                return (
                  <div key={(r as any)._id || idx} className="p-4 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white text-yellow-600 rounded-2xl flex items-center justify-center font-black shadow-sm">
                        {(r.isAnonymous ? r.pseudonym : r.name)?.charAt(0) || 'U'}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-black text-gray-900 leading-none truncate">{r.isAnonymous ? r.pseudonym : r.name}</p>
                        <p className="text-[9px] uppercase font-black text-gray-400 mt-1">{idx === 0 ? 'Organizer' : 'Passenger'}</p>
                      </div>
                    </div>
                    {isDifferent && (
                      <div className="bg-white/50 p-3 rounded-2xl border border-gray-100/50 space-y-2">
                         <div className="flex items-start gap-2">
                           <Icon icon="mdi:map-marker-radius" className="text-green-500 text-xs mt-0.5" />
                           <p className="text-[10px] text-gray-600 leading-tight"><span className="font-bold">Pickup:</span> {segment.pickupLocation.address.split(',')[0]}</p>
                         </div>
                         <div className="flex items-start gap-2">
                           <Icon icon="mdi:map-marker-check" className="text-red-500 text-xs mt-0.5" />
                           <p className="text-[10px] text-gray-600 leading-tight"><span className="font-bold">Dropoff:</span> {segment.dropoffLocation.address.split(',')[0]}</p>
                         </div>
                      </div>
                    )}
                  </div>
                );
              })}
           </div>
        </div>
        {/* Floating Chat Button */}
        {ride.status !== 'completed' && ride.status !== 'cancelled' && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(`/chat?rideId=${ride._id}`)}
            className="fixed bottom-8 right-8 w-16 h-16 bg-yellow-400 text-amber-900 rounded-full shadow-2xl flex items-center justify-center z-50 hover:bg-yellow-300 transition-colors"
          >
            <Icon icon="mdi:chat" className="text-3xl" />
            <span className="absolute -top-1 -right-1 bg-red-500 w-4 h-4 rounded-full border-2 border-white animate-pulse" />
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default RideDetail;
