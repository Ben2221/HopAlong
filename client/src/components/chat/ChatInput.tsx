import React, { useState } from "react";
import { motion } from "motion/react";
import { Icon } from "@iconify/react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isDisabled?: boolean;
}

const ChatInput = ({ onSendMessage, isDisabled = false }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isDisabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  return (
    <motion.form
      className="bg-white border-t border-gray-200 px-4 py-3 sticky bottom-0"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
    >
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            className={`w-full py-3 px-4 pr-12 border rounded-full focus:ring-yellow-400 focus:border-yellow-400 transition-colors ${
              isDisabled ? "bg-gray-100" : "bg-white"
            }`}
            placeholder={isDisabled ? "Loading chat..." : "Type a message..."}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
            }}
            disabled={isDisabled}
          />
          <motion.button
            type="button"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              // Here you could add emoji picker functionality
            }}
          >
            <Icon icon="mdi:emoticon-outline" className="text-xl" />
          </motion.button>
        </div>
        <motion.button
          type="submit"
          className={`p-3 rounded-full ${
            message.trim() && !isDisabled
              ? "bg-gradient-to-r from-yellow-400 to-amber-500"
              : "bg-gray-200"
          } flex items-center justify-center`}
          whileHover={message.trim() && !isDisabled ? { scale: 1.05 } : {}}
          whileTap={message.trim() && !isDisabled ? { scale: 0.95 } : {}}
          disabled={!message.trim() || isDisabled}
        >
          <Icon
            icon="mdi:send"
            className={`text-xl ${
              message.trim() && !isDisabled ? "text-white" : "text-gray-500"
            }`}
          />
        </motion.button>
      </div>
    </motion.form>
  );
};

export default ChatInput;
