import { motion } from "motion/react";

interface ChatBubbleProps {
  content: string;
  isCurrentUser: boolean;
  senderName: string;
  timestamp: string;
  profilePic?: string | null;
}

const ChatBubble = ({
  content,
  isCurrentUser,
  senderName,
  timestamp,
  profilePic,
}: ChatBubbleProps) => {
  return (
    <motion.div
      className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-4`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`flex ${
          isCurrentUser ? "flex-row-reverse" : "flex-row"
        } max-w-[80%]`}
      >
        {/* Profile Image */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            {profilePic ? (
              <img
                src={profilePic}
                alt={senderName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-medium text-gray-500">
                {senderName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className={`${isCurrentUser ? "mr-2" : "ml-2"} flex flex-col`}>
          {/* Sender name */}
          <span
            className={`text-xs ${
              isCurrentUser ? "text-right" : "text-left"
            } text-gray-500 mb-1`}
          >
            {isCurrentUser ? "You" : senderName}
          </span>

          {/* Message bubble */}
          <div
            className={`px-4 py-2 rounded-lg ${
              isCurrentUser
                ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-white"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            <p className="text-sm">{content}</p>
          </div>

          {/* Timestamp */}
          <span
            className={`text-xs ${
              isCurrentUser ? "text-right" : "text-left"
            } text-gray-500 mt-1`}
          >
            {timestamp}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatBubble;
