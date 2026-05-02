import { Centrifuge } from "centrifuge";

interface CentrifugeOptions {
  token: string;
  url: string;
}

let centrifuge: Centrifuge | null = null;

export const initCentrifuge = ({
  token,
  url,
}: CentrifugeOptions): Centrifuge => {
  if (centrifuge) {
    centrifuge.disconnect();
  }

  centrifuge = new Centrifuge(url);
  centrifuge.setToken(token);

  centrifuge.on("connected", (ctx) => {
    console.log("Connected to Centrifugo", ctx);
  });

  centrifuge.on("disconnected", (ctx) => {
    console.log("Disconnected from Centrifugo", ctx);
  });

  centrifuge.connect();

  return centrifuge;
};

export const subscribeToChatChannel = (
  channel: string,
  onPublish: (data: unknown) => void
) => {
  console.log("Subscribing to channel:", channel);
  if (!centrifuge) {
    console.error("Centrifuge not initialized");
    return null;
  }
  const existingSubscription = centrifuge.getSubscription(channel);
  if (existingSubscription) {
    console.log("Already subscribed to channel:", channel);
    existingSubscription.unsubscribe();
  }

  interface ChatSender {
    id: string;
    firstName: string;
    lastName: string;
    profilePic: string;
  }

  interface ChatMessage {
    id: string;
    content: string;
    senderId: string;
    rideId: string;
    sentAt: string;
    sender: ChatSender;
  }

  interface Publication {
    channel: string;
    data: ChatMessage;
  }

  interface CentrifugePublication {
    data: string | Publication;
  }

  const subscription = centrifuge.newSubscription(channel);
  subscription.on("publication", (publication: CentrifugePublication) => {
    console.log("Received publication:", publication);
    const data: Publication =
      typeof publication.data === "string"
        ? (JSON.parse(publication.data) as Publication)
        : publication.data;
    console.log("Parsed data:", data);
    onPublish(data);
  });
  subscription.on("subscribed", () => {
    console.log(`Subscribed to channel: ${channel}`);
  });

  subscription.subscribe();

  // Trigger actual connection establishement.
  centrifuge.connect();

  return subscription;
};

export const disconnectCentrifuge = () => {
  if (centrifuge) {
    centrifuge.disconnect();
    centrifuge = null;
  }
};
