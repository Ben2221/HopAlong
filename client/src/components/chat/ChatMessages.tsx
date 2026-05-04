import { useRef, useEffect } from "react";
import { motion } from "motion/react";
import ChatBubble from "./ChatBubble";
import { Icon } from "@iconify/react";

export interface Message {
  id: string;
  content: string;
  sentAt: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
}

interface ChatMessagesProps {
  messages: Message[];
  currentUserId: string;
  isLoading: boolean;
}

const ChatMessages = ({
  messages,
  currentUserId,
  isLoading,
}: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="flex justify-center items-center h-full">
          <div className="flex flex-col items-center">
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <Icon icon="mdi:loading" className="text-yellow-400 text-3xl" />
            </motion.div>
            <span className="text-gray-500 mt-2">Loading messages...</span>
          </div>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="flex justify-center items-center h-full text-center p-4">
          <div>
            <motion.div
              className="flex justify-center mb-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="p-4 rounded-full bg-yellow-50">
                <Icon
                  icon="mdi:chat-outline"
                  className="text-4xl text-yellow-400"
                />
              </div>
            </motion.div>
            <h3 className="text-gray-800 font-medium mb-2">No messages yet</h3>
            <p className="text-gray-500 text-sm">
              Be the first to send a message to your ride partners!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="flex-1 overflow-y-auto px-4 py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {messages.map((message) => (
        <ChatBubble
          key={message.id}
          content={message.content}
          isCurrentUser={message.senderEmail === currentUserId}
          senderName={message.senderName}
          timestamp={formatTimestamp(message.sentAt)}
        />
      ))}
      <div ref={messagesEndRef} />
    </motion.div>
  );
};

export default ChatMessages;
