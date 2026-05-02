import { motion } from "motion/react";

interface RideProps {
  id: string;
  date: string;
  from: string;
  to: string;
  status: string;
}

interface MatchDetails {
  timeDifference?: number; // in minutes
  overlapPercentage?: number; // 0-100
}

const RideCard = ({
  ride,
  matchDetails,
  showJoinButton = false,
  animationDelay = 0,
  onJoinRide,
  isLoading = false,
  onViewDetails,
}: {
  ride: RideProps;
  matchDetails?: MatchDetails;
  showJoinButton?: boolean;
  animationDelay?: number;
  onJoinRide?: () => void;
  isLoading?: boolean;
  onViewDetails?: () => void;
}) => {
  const formatDate = (dateString: string) => {
    console.log("Date String:", dateString);
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-IN", {
      month: "short",
      day: "numeric",
    }).format(date);
  };
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeDifference = (minutes?: number) => {
    if (minutes === undefined) return "";
    if (minutes < 60) return `${minutes.toString()} hours`;
    return `${Math.floor(minutes / 60).toString()}h ${(
      minutes % 60
    ).toString()}m`;
  };

  const handleJoinClick = () => {
    if (onJoinRide && !isLoading) {
      onJoinRide();
    }
  };

  return (
    <motion.div
      className="bg-white rounded-lg shadow overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      transition={{ duration: 0.3, delay: animationDelay }}
    >
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <motion.h3
              className="text-lg font-semibold text-gray-800"
              whileHover={{ color: "#EAB308" }}
            >
              {ride.from} → {ride.to}
            </motion.h3>
            <p className="text-gray-500 text-sm mt-1">
              {formatDate(ride.date)} at {formatTime(ride.date)}
            </p>

            {matchDetails && (
              <div className="mt-2 flex flex-wrap gap-2">
                {matchDetails.timeDifference !== undefined && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <svg
                      className="mr-1.5 h-2 w-2 text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 8 8"
                    >
                      <circle cx="4" cy="4" r="3" />
                    </svg>
                    Time difference:{" "}
                    {formatTimeDifference(matchDetails.timeDifference)}
                  </span>
                )}
                {matchDetails.overlapPercentage !== undefined && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg
                      className="mr-1.5 h-2 w-2 text-green-400"
                      fill="currentColor"
                      viewBox="0 0 8 8"
                    >
                      <circle cx="4" cy="4" r="3" />
                    </svg>
                    Route match: {Math.round(matchDetails.overlapPercentage)}%
                  </span>
                )}
              </div>
            )}
          </div>
          <motion.div
            className={`px-3 py-1 text-xs font-medium rounded-full ${
              ride.status === "completed"
                ? "bg-green-100 text-green-800"
                : ride.status === "active"
                ? "bg-blue-100 text-blue-800"
                : "bg-red-100 text-red-800"
            }`}
            whileHover={{ scale: 1.05 }}
          >
            {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
          </motion.div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <motion.button
            className="text-sm text-yellow-500 hover:text-amber-600 font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onViewDetails}
          >
            View Details
          </motion.button>

          {ride.status === "completed" && (
            <motion.button
              className="text-sm text-yellow-500 hover:text-amber-600 font-medium ml-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Book Again
            </motion.button>
          )}

          {showJoinButton && (
            <motion.button
              className={`px-4 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-full font-medium text-sm ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              whileHover={!isLoading ? { scale: 1.05 } : {}}
              whileTap={!isLoading ? { scale: 0.95 } : {}}
              onClick={handleJoinClick}
              disabled={isLoading}
              animate={
                !isLoading
                  ? {
                      boxShadow: [
                        "0 0 0 0 rgba(251, 191, 36, 0.7)",
                        "0 0 0 10px rgba(251, 191, 36, 0)",
                      ],
                    }
                  : {}
              }
              transition={
                !isLoading
                  ? {
                      boxShadow: {
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "loop",
                      },
                    }
                  : {}
              }
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  Joining...
                </span>
              ) : (
                "Join Ride"
              )}
            </motion.button>
          )}
        </div>
      </div>

      <motion.div
        className="h-1 bg-gradient-to-r from-yellow-400 to-amber-500"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{ transformOrigin: "left" }}
      />
    </motion.div>
  );
};

export default RideCard;
