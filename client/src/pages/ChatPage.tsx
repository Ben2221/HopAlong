import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { API_DOMAIN } from "../env";
import { useAuthStore } from "../store/authStore";
import ChatHeader from "../components/chat/ChatHeader";
import ChatInput from "../components/chat/ChatInput";
import ChatMessages, { Message } from "../components/chat/ChatMessages";
import TaxiPatternBackground from "../components/chat/TaxiPatternBackground";
import {
  initCentrifuge,
  subscribeToChatChannel,
  disconnectCentrifuge,
} from "../services/centrifuge";

interface RideDetails {
  id: string;
  primaryRoute: {
    startPlaceName: string;
    endPlaceName: string;
  };
  start: string;
  members: {
    id: string;
    firstName: string;
    lastName: string;
  }[];
  owner: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

const CENTRIFUGO_WS_URL = "ws://localhost:8000/connection/websocket";

const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const rideId = searchParams.get("rideId");
  const { token, user } = useAuthStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [rideDetails, setRideDetails] = useState<RideDetails | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isLoadingRide, setIsLoadingRide] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Subscribe to chat and load previous messages
  useEffect(() => {
    if (!rideId || !token) return;

    const loadPreviousMessages = async () => {
      if (!rideId || !token) return;

      try {
        setIsLoadingMessages(true);
        const response = await fetch(`${API_DOMAIN}/chat/previous`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            rideId,
            limit: 50,
            offset: 0,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to load previous messages");
        }
        const data: unknown = await response.json();

        if (data && typeof data === "object" && "messages" in data) {
          setMessages(data.messages as Message[]);
        } else {
          throw new Error(
            typeof data === "object" && data !== null && "message" in data
              ? String(data.message)
              : "Failed to load previous messages"
          );
        }
      } catch (err) {
        console.error("Error loading previous messages:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoadingMessages(false);
      }
    };

    const fetchRideDetails = async () => {
      try {
        // First, subscribe to the chat channel
        const response = await fetch(`${API_DOMAIN}/chat/subscribe`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            rideId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to subscribe to chat");
        }

        const data: unknown = await response.json();

        if (
          data &&
          typeof data === "object" &&
          "success" in data &&
          data.success
        ) {
          // Initialize Centrifugo connection
          initCentrifuge({
            token: (
              data as { success: boolean; token: string; channel: string }
            ).token,
            url: CENTRIFUGO_WS_URL,
          });

          // Subscribe to channel
          subscribeToChatChannel(
            (data as { success: boolean; token: string; channel: string })
              .channel,
            (messageData) => {
              setMessages((prevMessages) => [
                ...prevMessages,
                messageData as Message,
              ]);
            }
          );
        } else {
          throw new Error(
            typeof data === "object" && data !== null && "message" in data
              ? String(data.message)
              : "Failed to subscribe to chat"
          );
        }

        // Then load previous messages
        await loadPreviousMessages();

        // Finally fetch ride details
        const rideResponse = await fetch(`${API_DOMAIN}/api/rides/${rideId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!rideResponse.ok) {
          throw new Error("Failed to load ride details");
        }

        const rideData: unknown = await rideResponse.json();
        setRideDetails(
          (rideData as { success: boolean; ride: unknown }).ride as RideDetails
        );
        setIsLoadingRide(false);
      } catch (err) {
        console.error("Error setting up chat:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
        setIsLoadingRide(false);
      }
    };

    void fetchRideDetails();

    return () => {
      disconnectCentrifuge();
    };
  }, [rideId, token]);

  const sendMessage = async (content: string) => {
    if (!rideId || !token || !content.trim()) return;

    try {
      setIsSending(true);
      const response = await fetch(`${API_DOMAIN}/chat/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          rideId,
          content,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      // No need to update messages here as it will come through the Centrifugo subscription
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSending(false);
    }
  };

  const formatRideDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate member count (including owner)
  const memberCount = rideDetails ? (rideDetails.members.length || 0) + 1 : 0;

  return (
    <div className="h-screen flex flex-col bg-gray-50 relative">
      <TaxiPatternBackground />

      {/* Chat Header */}
      <ChatHeader
        destination={rideDetails?.primaryRoute.endPlaceName ?? "Loading..."}
        memberCount={memberCount}
        date={
          rideDetails?.start ? formatRideDate(rideDetails.start) : undefined
        }
        isLoading={isLoadingRide}
      />

      {/* Error Message */}
      {error && (
        <motion.div
          className="m-4 p-3 bg-red-100 text-red-700 rounded-md"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}

      {/* Messages Container */}
      <ChatMessages
        messages={messages}
        currentUserId={user ? user.email : ""}
        isLoading={isLoadingMessages}
      />
      <ChatInput
        onSendMessage={(c) => {
          void sendMessage(c);
        }}
        isDisabled={isSending || isLoadingMessages || !!error}
      />
    </div>
  );
};

export default ChatPage;
