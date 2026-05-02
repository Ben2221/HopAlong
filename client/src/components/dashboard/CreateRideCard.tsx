import { motion } from "motion/react";
import { Icon } from "@iconify/react";

const CreateRideCard = ({
  routeData,
  onCreateRide,
  isLoading = false,
}: {
  routeData: {
    from: {
      name: string | null;
      formattedAddress: string;
      lat?: number;
      lng?: number;
    } | null;
    to: {
      name: string | null;
      formattedAddress: string;
      lat?: number;
      lng?: number;
    } | null;
    rideDateTime: Date | null;
  };
  onCreateRide?: () => void;
  isLoading?: boolean;
}) => {
  const { from, to, rideDateTime } = routeData;

  const formatDateTime = (date: Date | null) => {
    if (!date) return "Not specified";
    return new Intl.DateTimeFormat("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleCreateClick = () => {
    if (onCreateRide && !isLoading) {
      onCreateRide();
    }
  };

  return (
    <motion.div
      className="bg-white rounded-lg shadow overflow-hidden border border-yellow-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div className="p-5">
        <div className="flex items-center mb-4">
          <motion.div
            className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3"
            whileHover={{ scale: 1.1, backgroundColor: "#fbbf24" }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Icon icon="mdi:car-outline" className="text-yellow-500 text-xl" />
          </motion.div>
          <h3 className="text-lg font-semibold text-gray-800">
            Create your own ride
          </h3>
        </div>

        {from && to ? (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex items-start mb-3">
                <div className="min-w-[24px] mr-3 mt-1">
                  <Icon
                    icon="mdi:map-marker"
                    className="text-green-500 text-xl"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">FROM</p>
                  <p className="text-gray-800">{from.name}</p>
                  <p className="text-xs text-gray-500">
                    {from.formattedAddress}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="min-w-[24px] mr-3 mt-1">
                  <Icon
                    icon="mdi:map-marker"
                    className="text-red-500 text-xl"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">TO</p>
                  <p className="text-gray-800">{to.name}</p>
                  <p className="text-xs text-gray-500">{to.formattedAddress}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <div className="min-w-[24px] mr-3">
                <Icon
                  icon="mdi:clock-outline"
                  className="text-blue-500 text-xl"
                />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  DEPARTURE TIME
                </p>
                <p className="text-gray-800">{formatDateTime(rideDateTime)}</p>
              </div>
            </div>

            <motion.button
              className={`w-full py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-md font-medium ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
              onClick={handleCreateClick}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                "Create Ride"
              )}
            </motion.button>

            <p className="text-center text-gray-500 text-sm">
              Anyone will be able to join your ride
            </p>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">
              Please select your route first to create a ride
            </p>
            <motion.button
              className="mt-3 px-4 py-2 bg-gray-100 text-gray-800 rounded-md font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Select Route
            </motion.button>
          </div>
        )}
      </div>

      <motion.div
        className="h-1 bg-gradient-to-r from-yellow-400 to-amber-500"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{ transformOrigin: "left" }}
      />
    </motion.div>
  );
};

export default CreateRideCard;
