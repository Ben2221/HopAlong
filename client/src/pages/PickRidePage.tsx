import { motion } from "motion/react";
import { Icon } from "@iconify/react";
import { useRideStore } from "../store/rideCreationStore";
import { useRouteStore } from "../store/routeStore";
import RideCard from "../components/dashboard/RideCard";
import CreateRideCard from "../components/dashboard/CreateRideCard";
import EmptyRideState from "../components/dashboard/EmptyRideState";
import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { API_DOMAIN } from "../env";

const PickRidePage = () => {
  const { rides } = useRideStore();
  const routeData = useRouteStore();
  const authStore = useAuthStore();
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoinRide = async (rideId: string) => {
    if (!routeData.from || !routeData.to || !routeData.rideDateTime) {
      setError("Route information is incomplete");
      return;
    }

    try {
      setIsJoining(true);
      setError(null);

      // Get user token from localStorage or other auth storage
      const token = authStore.token;

      // Format coordinates as "latitude,longitude"
      const start = `${routeData.from.latitude.toString()},${routeData.from.longitude.toString()}`;
      const end = `${routeData.to.latitude.toString()},${routeData.to.longitude.toString()}`;

      const response = await fetch(API_DOMAIN + "/api/route/merge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          start,
          end,
          startTime: routeData.rideDateTime.toISOString(),
          rideId: rideId,
        }),
      });

      if (!response.ok) {
        const errorData: unknown = await response.json();
        if (
          errorData &&
          typeof errorData === "object" &&
          "message" in errorData
        ) {
          throw new Error((errorData as { message: string }).message);
        } else {
          throw new Error("Failed to join ride");
        }
      }

      const data: unknown = await response.json();

      // Handle successful response
      console.log("Successfully joined ride:", data);

      // TODO: Update local state or redirect user
    } catch (err) {
      console.error("Error joining ride:", err);
      setError("Failed to join ride");
      console.error("Error joining ride:", err);
    } finally {
      setIsJoining(false);
    }
  };

  const handleCreateRide = async () => {
    if (!routeData.from || !routeData.to || !routeData.rideDateTime) {
      setError("Please complete your route information first");
      return;
    }

    try {
      setIsCreating(true);
      setError(null);

      // Get user token from localStorage or other auth storage
      const token = authStore.token ?? "";

      // Format coordinates as "latitude,longitude"
      const start = `${routeData.from.latitude.toString()},${routeData.from.longitude.toString()}`;
      const end = `${routeData.to.latitude.toString()},${routeData.to.longitude.toString()}`;
      const response = await fetch(API_DOMAIN + "/api/route/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          start,
          end,
          startTime: routeData.rideDateTime.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData: unknown = await response.json();
        if (
          errorData &&
          typeof errorData === "object" &&
          "message" in errorData
        ) {
          throw new Error((errorData as { message: string }).message);
        } else {
          throw new Error("Failed to create ride");
        }
      }

      const data: unknown = await response.json();

      // Handle successful response
      console.log("Successfully created ride:", data);

      // TODO: Update local state or redirect user
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to create ride");
      } else {
        setError("An unknown error occurred");
      }
      console.error("Error creating ride:", err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="mb-8 text-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-800">
            Find Your{" "}
            <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-transparent bg-clip-text">
              Perfect Ride
            </span>
          </h1>
          <p className="mt-2 text-gray-600">
            Join an existing ride or create your own
          </p>

          {error && (
            <motion.div
              className="mt-4 p-2 bg-red-100 text-red-700 rounded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.div>
          )}
        </motion.div>

        <motion.div
          className="space-y-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {rides.length > 0 ? (
            <>
              <div className="mb-4 flex items-center">
                <Icon icon="mdi:check-circle" className="text-green-500 mr-2" />
                <p className="text-gray-700 font-medium">
                  We found {rides.length} matching{" "}
                  {rides.length === 1 ? "ride" : "rides"} for your route
                </p>
              </div>

              <div className="space-y-5">
                {rides.map((rideMatch, index) => (
                  <RideCard
                    key={rideMatch.ride.id}
                    ride={{
                      id: rideMatch.ride.id,
                      date: rideMatch.ride.start,
                      from: rideMatch.ride.primaryRoute.startPlaceName,
                      to: rideMatch.ride.primaryRoute.endPlaceName,
                      status: "active",
                    }}
                    matchDetails={{
                      timeDifference: rideMatch.timeDifference,
                      overlapPercentage: rideMatch.overlapPercentage,
                    }}
                    showJoinButton={true}
                    animationDelay={index * 0.1}
                    onJoinRide={() => {
                      void handleJoinRide(rideMatch.ride.id);
                    }}
                    isLoading={isJoining}
                  />
                ))}
              </div>
            </>
          ) : (
            <EmptyRideState />
          )}

          {/* Create your own ride card */}
          <div className="mt-10">
            <div className="mb-4 border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Or create your own ride
              </h2>
            </div>
            <CreateRideCard
              routeData={routeData}
              onCreateRide={() => {
                void handleCreateRide();
              }}
              isLoading={isCreating}
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PickRidePage;
