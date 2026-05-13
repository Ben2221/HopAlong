import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useAuthStore } from "../store/authStore";
import ChatHeader from "../components/chat/ChatHeader";
import ChatInput from "../components/chat/ChatInput";
import ChatMessages, { Message } from "../components/chat/ChatMessages";
import PremiumChatBackground from "../components/chat/PremiumChatBackground";
import { getSocket, initSocket } from "../services/socket";
import api from "../services/api";
import { Icon } from "@iconify/react";

interface RideData {
  _id: string;
  pickupLocation: { address: string };
  dropoffLocation: { address: string };
  riders: any[];
  host?: any;
  status: string;
}

const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const rideId = searchParams.get("rideId");
  const { token, user } = useAuthStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [ride, setRide] = useState<RideData | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isLoadingRide, setIsLoadingRide] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!rideId || !token || !user) {
      navigate("/login");
      return;
    }

    const fetchRideAndHistory = async () => {
      try {
        setIsLoadingRide(true);
        setIsLoadingMessages(true);

        // Fetch Ride Details
        const rideRes = await api.get(`/rides/${rideId}`);
        setRide(rideRes.data);
        setIsLoadingRide(false);

        // Fetch History
        const chatRes = await api.get(`/chat/${rideId}`);
        setMessages(chatRes.data.messages);
        setIsLoadingMessages(false);
      } catch (err: any) {
        console.error("Error loading chat:", err);
        setError(err.response?.data?.message || "Failed to load chat");
        setIsLoadingRide(false);
        setIsLoadingMessages(false);
      }
    };

    fetchRideAndHistory();

    const socket = getSocket() || initSocket(token);

    socket.on("new_message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.emit("join_ride_room", { rideId });

    return () => {
      socket.off("new_message");
    };
  }, [rideId, token, user, navigate]);

  const sendMessage = (content: string) => {
    if (!rideId || !content.trim()) return;
    
    const socket = getSocket();
    if (socket) {
      setIsSending(true);
      socket.emit("send_message", { rideId, content });
      setIsSending(false);
    }
  };

  const memberCount = (ride?.riders?.length || 0) + (ride?.host ? 1 : 0);

  return (
    <div className="h-screen flex flex-col bg-slate-50 relative overflow-hidden">
      <PremiumChatBackground />

      {/* Header */}
      <div className="z-50">
        <ChatHeader
          destination={ride?.dropoffLocation?.address?.split(',')[0] ?? "Loading..."}
          memberCount={memberCount}
          ride={ride}
          isLoading={isLoadingRide}
        />
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          className="m-4 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 flex items-center gap-3 z-20"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Icon icon="mdi:alert-circle" className="text-xl" />
          <p className="font-bold text-sm">{error}</p>
        </motion.div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-hidden flex flex-col z-10">
        <ChatMessages
          messages={messages}
          currentUserId={user?.email || ""}
          isLoading={isLoadingMessages}
        />
      </div>
      
      <div className="z-20">
        <ChatInput
          onSendMessage={sendMessage}
          isDisabled={isSending || isLoadingMessages || !!error}
        />
      </div>
    </div>
  );
};

export default ChatPage;
