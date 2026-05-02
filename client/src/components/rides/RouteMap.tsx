import { motion } from "motion/react";
import { Icon } from "@iconify/react";

interface RouteMapProps {
  startPlace: string;
  endPlace: string;
  startTime: string;
  distance?: number; // New prop for distance
  isLoading?: boolean;
}

const RouteMap = ({
  startPlace,
  endPlace,
  startTime,
  distance = 0, // Default to 0 if not provided
  isLoading = false,
}: RouteMapProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  return (
    <motion.div
      className="bg-white rounded-lg shadow-sm overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {isLoading ? (
        <div className="animate-pulse p-6 space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ) : (
        <>
          <div className="m-4 text-md font-medium text-gray-800">
            <Icon
              icon="mdi:clock-outline"
              className="inline mr-1 text-yellow-500"
            />
            {formatDate(startTime)}
          </div>

          <div className="p-5 space-y-4">
            <div className="space-y-3">
              <motion.div
                className="flex items-start"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="mt-1 mr-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <Icon icon="mdi:circle-small" className="text-green-600" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    START POINT
                  </p>
                  <p className="font-medium text-gray-800">{startPlace}</p>
                </div>
              </motion.div>

              <div className="flex items-center ml-3">
                <div className="w-0.5 h-6 bg-gray-200 ml-3"></div>
              </div>

              <motion.div
                className="flex items-start"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="mt-1 mr-3">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                    <Icon icon="mdi:map-marker" className="text-red-600" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    DESTINATION
                  </p>
                  <p className="font-medium text-gray-800">{endPlace}</p>
                </div>
              </motion.div>
            </div>

            <motion.div
              className="mt-6 p-4 bg-gray-50 rounded-lg flex items-center justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Icon
                icon="mdi:map-marker-distance"
                className="text-xl text-yellow-500 mr-2"
              />
              <div className="text-center">
                <p className="text-sm text-gray-500 font-medium">
                  TOTAL DISTANCE
                </p>
                <p className="text-lg font-bold bg-gradient-to-r from-yellow-400 to-amber-500 text-transparent bg-clip-text">
                  {distance.toFixed(1)} km
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default RouteMap;
