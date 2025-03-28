import axios from "axios";
import config from "../../config.json";

const FIRE_FLY_BASE = `${config.HOST}/api/v1/namespaces/${config.NAMESPACE}`;
const CONTRACT_ADDRESS = config.IMAGE_REGISTRY_ADDRESS;
const LISTENER_NAME = "image-registered-listener";
const SUBSCRIPTION_NAME = "image-registered-sub";
const TOPIC = "image-events";

export async function setupEventFlow(interfaceId: string) {
  try {
    // DELETE existing listener by name
    try {
      await axios.delete(`${FIRE_FLY_BASE}/contracts/listeners/${LISTENER_NAME}`);
      console.log("Deleted existing listener.");
    } catch (err: any) {
      if (err.response?.status !== 404) {
        console.warn("Failed to delete listener:", err.response?.data || err.message);
      } else {
        console.log("No existing listener found.");
      }
    }

    // DELETE existing subscription by name
    try {
      // Get all subscriptions in this namespace
      const { data: subscriptions } = await axios.get(`${FIRE_FLY_BASE}/subscriptions`);
  
      // Find the one matching your name (FireFly stores names as fully qualified: "namespace:subname")
      const fullName = `${SUBSCRIPTION_NAME}`;
      const existingSub = subscriptions.find((sub: any) => sub.name === fullName);
  
      if (existingSub) {
        console.log(`Deleting existing subscription: ${existingSub.id}`);
        await axios.delete(`${FIRE_FLY_BASE}/subscriptions/${existingSub.id}`);
      } else {
        console.log("No existing subscription found.");
      }
    } catch (err: any) {
      console.error("Failed to delete subscription:", err.response?.data || err.message);
    }

    // CREATE new listener
    const { data: newListener } = await axios.post(`${FIRE_FLY_BASE}/contracts/listeners`, {
      name: LISTENER_NAME,
      topic: TOPIC,
      filters: [
        {
          interface: { id: interfaceId },
          location: { address: CONTRACT_ADDRESS },
          eventPath: "ImageRegistered"
        }
      ],
      options: { firstEvent: "oldest" }
    });

    console.log("Blockchain event listener created:", newListener);

    // CREATE new subscription
    const { data: newSub } = await axios.post(`${FIRE_FLY_BASE}/subscriptions`, {
      name: SUBSCRIPTION_NAME,
      namespace: config.NAMESPACE,
      transport: "websockets",
      topic: TOPIC,
      filter: {
        events: "blockchain_event_received",
        blockchainevent: {
          listener: newListener.id
        }
      },
      options: { firstEvent: "-1", withData: false }
    });

    console.log("Subscription created:", newSub);
  } catch (err: any) {
    console.error("Failed to set up event flow:", err.response?.data || err.message);
    throw err;
  }
}

export async function setupRoyaltyEventFlow(interfaceId: string) {
  const LISTENER_NAME = "royalty-listener";
  const SUBSCRIPTION_NAME = "royalty-subscription";
  const TOPIC = "royalty-events";

  try {
    //Delete existing listener by name
    try {
      console.log(`Attempting to delete listener: ${LISTENER_NAME}`);
      await axios.delete(`${FIRE_FLY_BASE}/contracts/listeners/${LISTENER_NAME}`);
      console.log("Deleted existing royalty listener.");
    } catch (err: any) {
      if (err.response?.status !== 404) {
        console.warn("Failed to delete royalty listener:", err.response?.data || err.message);
      } else {
        console.log("No existing royalty listener found.");
      }
    }

    //Delete existing subscription by name (must use UUID)
    try {
      const { data: subscriptions } = await axios.get(`${FIRE_FLY_BASE}/subscriptions`);
      const fullName = `${SUBSCRIPTION_NAME}`;
      const existingSub = subscriptions.find((s: any) => s.name === fullName);

      if (existingSub) {
        console.log(`Deleting existing royalty subscription: ${existingSub.id}`);
        await axios.delete(`${FIRE_FLY_BASE}/subscriptions/${existingSub.id}`);
      } else {
        console.log("No existing royalty subscription found.");
      }
    } catch (err: any) {
      console.warn("Failed to delete royalty subscription:", err.response?.data || err.message);
    }

    //Create new listener
    const { data: newListener } = await axios.post(`${FIRE_FLY_BASE}/contracts/listeners`, {
      name: LISTENER_NAME,
      topic: TOPIC,
      filters: [
        {
          interface: { id: interfaceId },
          location: { address: CONTRACT_ADDRESS },
          eventPath: "RoyaltyPaid",
        },
      ],
      options: { firstEvent: "oldest" },
    });

    console.log("Created new royalty listener:", newListener);

    //Create new subscription
    const { data: newSub } = await axios.post(`${FIRE_FLY_BASE}/subscriptions`, {
      name: SUBSCRIPTION_NAME,
      namespace: config.NAMESPACE,
      transport: "websockets",
      topic: TOPIC,
      filter: {
        events: "blockchain_event_received",
        blockchainevent: {
          listener: newListener.id,
        },
      },
      options: { firstEvent: "-1", withData: false },
    });

    console.log("Created new royalty subscription:", newSub);
  } catch (err: any) {
    console.error("Error setting up royalty listener and subscription:", err.response?.data || err.message);
  }
}
