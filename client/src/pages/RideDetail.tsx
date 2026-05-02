import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useAuthStore } from "../store/authStore";
import api from "../services/api";
import { initSocket, getSocket } from "../services/socket";
import Button from "../components/Button";
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
  driver?: { name: string; email: string };
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
        setRide(response.data);
      } catch (err: any) {
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
    ride.pickupLocation.coordinates[1],
    ride.pickupLocation.coordinates[0],
  ];
  const dropoffPos: LatLngExpression = [
    ride.dropoffLocation.coordinates[1],
    ride.dropoffLocation.coordinates[0],
  ];
  const driverPos: LatLngExpression | null = driverLocation
    ? [driverLocation.lat, driverLocation.lng]
    : null;

  const mapCenter = driverPos ?? pickupPos;
  const currentStep = STATUS_STEPS.indexOf(ride.status);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <motion.div
        className="bg-gradient-to-r from-yellow-400 to-amber-500 pt-12 pb-6 px-4 sm:px-6 lg:px-8"
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-1 text-white/80 hover:text-white mb-2 text-sm"
            >
              <Icon icon="mdi:arrow-left" /> Dashboard
            </button>
            <h1 className="text-2xl font-bold text-white">Active Ride</h1>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-bold uppercase ${
              ride.status === "completed"
                ? "bg-green-500 text-white"
                : ride.status === "cancelled"
                ? "bg-red-500 text-white"
                : "bg-white text-yellow-600"
            }`}
          >
            {ride.status}
          </span>
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* Status Progress Bar */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wide">
            Ride Progress
          </h2>
          <div className="flex items-center justify-between">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                      i <= currentStep
                        ? "bg-yellow-400 text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {i < currentStep ? (
                      <Icon icon="mdi:check" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span className="text-xs mt-1 capitalize text-gray-500">
                    {step}
                  </span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-1 rounded transition-colors ${
                      i < currentStep ? "bg-yellow-400" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
            <Icon icon="mdi:map-marker" className="text-yellow-500 text-lg" />
            <h2 className="font-bold text-gray-700">Live Map</h2>
            {driverPos && (
              <span className="ml-auto text-xs text-green-600 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"></span>
                Driver location live
              </span>
            )}
          </div>
          <MapContainer
            center={mapCenter}
            zoom={14}
            style={{ height: "360px", width: "100%" }}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={pickupPos} icon={pickupIcon}>
              <Popup>
                <strong>Pickup</strong>
                <br />
                {ride.pickupLocation.address}
              </Popup>
            </Marker>
            <Marker position={dropoffPos} icon={dropoffIcon}>
              <Popup>
                <strong>Dropoff</strong>
                <br />
                {ride.dropoffLocation.address}
              </Popup>
            </Marker>
            {driverPos && (
              <Marker position={driverPos} icon={driverIcon}>
                <Popup>
                  <strong>Driver</strong>
                  <br />
                  {ride.driver?.name}
                </Popup>
              </Marker>
            )}
            <PanToDriver position={driverPos} />
          </MapContainer>
        </div>

        {/* Details grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Route */}
          <div className="bg-white rounded-xl shadow p-5 space-y-4">
            <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">
              Route
            </h2>
            <div className="flex items-start gap-3">
              <Icon icon="mdi:circle" className="text-green-500 mt-1" />
              <div>
                <p className="text-xs text-gray-400 uppercase">Pickup</p>
                <p className="font-medium">{ride.pickupLocation.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon icon="mdi:map-marker" className="text-red-500 mt-1" />
              <div>
                <p className="text-xs text-gray-400 uppercase">Dropoff</p>
                <p className="font-medium">{ride.dropoffLocation.address}</p>
              </div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Total Fare</span>
                <span className="font-bold text-lg text-yellow-600">
                  ₹{ride.fare.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-yellow-200">
                <span className="text-gray-600 text-sm font-medium">Your Split</span>
                <span className="font-bold text-xl text-green-600">
                  ₹{(ride.fare / ride.riders.length).toFixed(2)}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 text-center italic">Cost is split equally between all {ride.riders.length} passengers</p>
            </div>
          </div>

          {/* People */}
          <div className="bg-white rounded-xl shadow p-5 space-y-4">
            <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">
              People
            </h2>
            <div className="space-y-3">
              {ride.riders.map((r, idx) => (
                <div key={r.id || idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center font-bold text-yellow-600">
                    {(r.isAnonymous ? r.pseudonym : r.name).charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{r.isAnonymous ? r.pseudonym : r.name}</p>
                    <p className="text-xs text-gray-400">Rider {idx === 0 ? '(Organizer)' : ''}</p>
                  </div>
                </div>
              ))}
            </div>

            {ride.driver ? (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                  {ride.driver.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-blue-900">
                    {ride.driver.name}
                  </p>
                  <p className="text-xs text-blue-500">Driver</p>
                </div>
                <Icon
                  icon="mdi:check-decagram"
                  className="text-blue-500 ml-auto text-lg"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-400"></div>
                <span className="text-sm">Waiting for a driver...</span>
              </div>
            )}

            {/* Driver Action Buttons */}
            {user?.role === "driver" &&
              ride.status !== "completed" &&
              ride.status !== "cancelled" && (
                <div className="space-y-3 pt-2">
                  <p className="text-xs font-bold uppercase text-gray-400">
                    Driver Actions
                  </p>
                  {ride.status === "accepted" && (
                    <Button
                      fullWidth
                      icon="mdi:car-arrow-right"
                      onClick={() => updateStatus("ongoing")}
                      disabled={updating}
                    >
                      Start Ride — Picking Up Rider
                    </Button>
                  )}
                  {ride.status === "ongoing" && (
                    <Button
                      fullWidth
                      icon="mdi:flag-checkered"
                      className="bg-green-500 hover:bg-green-600"
                      onClick={() => updateStatus("completed")}
                      disabled={updating}
                    >
                      Complete Ride — Drop Off
                    </Button>
                  )}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RideDetail;
