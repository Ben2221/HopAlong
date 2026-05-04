import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Icon } from "@iconify/react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isDisabled?: boolean;
}

const COMMON_EMOJIS = ["😊", "👋", "🚗", "🤝", "👍", "🙌", "📍", "🕙", "🆗", "✨"];

const ChatInput = ({ onSendMessage, isDisabled = false }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isDisabled) {
      onSendMessage(message.trim());
      setMessage("");
      setShowEmojiPicker(false);
    }
  };

  const addEmoji = (emoji: string) => {
    setMessage((prev) => prev + emoji);
  };

  return (
    <motion.form
      className="bg-white/80 backdrop-blur-md border-t border-gray-100 px-4 py-4 sticky bottom-0 z-30"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
    >
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-4 mb-2 p-3 bg-white rounded-2xl shadow-2xl border border-gray-100 flex gap-2 z-40"
          >
            {COMMON_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => addEmoji(emoji)}
                className="text-xl hover:scale-125 transition-transform p-1"
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3">
        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            className={`w-full py-4 px-6 pr-14 border-none rounded-2xl focus:ring-2 focus:ring-yellow-400 transition-all shadow-sm ${
              isDisabled ? "bg-gray-50 text-gray-400" : "bg-gray-100 text-gray-900"
            }`}
            placeholder={isDisabled ? "Chat disabled..." : "Type your message..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isDisabled}
          />
          <button
            type="button"
            className="absolute right-4 text-gray-400 hover:text-yellow-500 transition-colors"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={isDisabled}
          >
            <Icon icon={showEmojiPicker ? "mdi:emoticon" : "mdi:emoticon-outline"} className="text-2xl" />
          </button>
        </div>
        
        <motion.button
          type="submit"
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
            message.trim() && !isDisabled
              ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-yellow-200"
              : "bg-gray-200 text-gray-400 shadow-none cursor-not-allowed"
          }`}
          whileHover={message.trim() && !isDisabled ? { scale: 1.05, y: -2 } : {}}
          whileTap={message.trim() && !isDisabled ? { scale: 0.95 } : {}}
          disabled={!message.trim() || isDisabled}
        >
          <Icon icon="mdi:send" className="text-2xl" />
        </motion.button>
      </div>
    </motion.form>
  );
};

export default ChatInput;
