import { motion } from "motion/react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

interface ChatHeaderProps {
  destination: string;
  memberCount: number;
  date?: string;
  isLoading?: boolean;
}

const ChatHeader = ({
  destination,
  memberCount,
  date,
  isLoading = false,
}: ChatHeaderProps) => {
  const navigate = useNavigate();

  return (
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
      >
        <Icon
          icon="mdi:information-outline"
          className="text-xl text-gray-700"
        />
      </motion.button>
    </motion.div>
  );
};

export default ChatHeader;
