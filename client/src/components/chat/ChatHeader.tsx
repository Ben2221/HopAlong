import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

interface ChatHeaderProps {
  destination: string;
  memberCount: number;
  ride?: any;
  date?: string;
  isLoading?: boolean;
}

const ChatHeader = ({
  destination,
  memberCount,
  ride,
  date,
  isLoading = false,
}: ChatHeaderProps) => {
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <motion.div
        className="bg-white shadow-md px-4 py-3 flex items-center gap-4 sticky top-0 z-10"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.button
          className="p-2 rounded-full hover:bg-gray-100"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => void navigate(-1)}
        >
          <Icon icon="mdi:arrow-left" className="text-xl text-gray-700" />
        </motion.button>

        <div className="flex-1">
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-5 bg-gray-200 rounded-md w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded-md w-1/3"></div>
            </div>
          ) : (
            <>
              <h2 className="font-bold text-gray-800 truncate">{destination}</h2>
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-500">
                  <Icon
                    icon="mdi:account-multiple"
                    className="inline-block mr-1"
                  />
                  {memberCount} {memberCount === 1 ? "person" : "people"}
                </div>
                {date && (
                  <div className="text-sm text-gray-500">
                    <Icon icon="mdi:calendar" className="inline-block mx-1" />
                    {date}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <motion.button
          className="p-2 rounded-full hover:bg-gray-100"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowInfo(true)}
        >
          <Icon
            icon="mdi:information-outline"
            className="text-xl text-gray-700"
          />
        </motion.button>
      </motion.div>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfo && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md cursor-pointer"
            onClick={() => setShowInfo(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-yellow-400">
                <h3 className="text-xl font-black text-amber-900">Ride Information</h3>
                <button 
                  onClick={() => setShowInfo(false)}
                  className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full text-amber-900 transition-colors"
                >
                  <Icon icon="mdi:close" className="text-xl" />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Route Details</p>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-1 h-full bg-green-500 rounded-full" />
                      <div>
                        <p className="text-[9px] font-black text-green-600 uppercase">Pickup</p>
                        <p className="font-bold text-gray-800 text-sm">{ride?.pickupLocation?.address || "Loading..."}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-1 h-full bg-red-500 rounded-full" />
                      <div>
                        <p className="text-[9px] font-black text-red-600 uppercase">Dropoff</p>
                        <p className="font-bold text-gray-800 text-sm">{ride?.dropoffLocation?.address || "Loading..."}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-50">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Passengers</p>
                  <div className="space-y-3">
                    {ride?.riders?.map((rider: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center text-xs font-black text-gray-500">
                          {(rider.isAnonymous ? rider.pseudonym : rider.name)?.charAt(0) || "U"}
                        </div>
                        <p className="font-bold text-gray-700 text-sm">
                          {rider.isAnonymous ? rider.pseudonym : rider.name}
                          {idx === 0 && <span className="ml-2 text-[8px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">ORG</span>}
                        </p>
                      </div>
                    ))}
                    {ride?.host && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center text-xs font-black text-blue-600">
                          {ride.host.name?.charAt(0) || "D"}
                        </div>
                        <p className="font-bold text-blue-700 text-sm">
                          {ride.host.name} (Host)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-50 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                    <span className="bg-green-50 text-green-700 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter">{ride?.status || "active"}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ride ID</p>
                    <p className="text-xs font-mono font-bold text-gray-500">#{ride?._id?.slice(-6) || "N/A"}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatHeader;
