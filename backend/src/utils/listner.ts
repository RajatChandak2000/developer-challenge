import axios from "axios";
import config from "../../config.json";

const FIRE_FLY_BASE = `${config.HOST}/api/v1/namespaces/${config.NAMESPACE}`;
const CONTRACT_ADDRESS = config.IMAGE_REGISTRY_ADDRESS;
const LISTENER_NAME = "image-registered-listener";
const SUBSCRIPTION_NAME = "image-registered-sub";
const TOPIC = "image-events";

export async function setupEventFlow(interfaceId: string) {
  try {
    // Step 1: Get all existing listeners
    const { data: listeners } = await axios.get(`${FIRE_FLY_BASE}/contracts/listeners`);
    const existingListener = listeners.find((l: any) =>
      l.name === LISTENER_NAME &&
      l.interface?.id === interfaceId &&
      l.location?.address?.toLowerCase() === CONTRACT_ADDRESS.toLowerCase() &&
      l.filters?.some(
        (f: any) =>
          f.eventPath === "ImageRegistered" &&
          f.location?.address?.toLowerCase() === CONTRACT_ADDRESS.toLowerCase() &&
          f.interface?.id === interfaceId
      )
    );

    let listenerId = existingListener?.id;

    if (!listenerId) {
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

      listenerId = newListener.id;
      console.log("Blockchain event listener created:", newListener);
    } else {
      console.log("Listener already exists. Skipping listener creation.");
    }

    // Step 2: Check for existing subscription
    const { data: subscriptions } = await axios.get(`${FIRE_FLY_BASE}/subscriptions`);
    const existingSub = subscriptions.find(
      (s: any) =>
        s.name === SUBSCRIPTION_NAME &&
        s.filter?.blockchainevent?.listener === listenerId
    );

    if (!existingSub) {
      const { data: newSub } = await axios.post(`${FIRE_FLY_BASE}/subscriptions`, {
        name: SUBSCRIPTION_NAME,
        namespace: config.NAMESPACE,
        transport: "websockets",
        topic: TOPIC,
        filter: {
          events: "blockchain_event_received",
          blockchainevent: {
            listener: listenerId
          }
        },
        options: { firstEvent: "-1", withData: false }
      });

      console.log("Subscription created:", newSub);
    } else {
      console.log("Subscription already exists. Skipping subscription creation.");
    }
  } catch (err: any) {
    console.error("Failed to set up event flow:", err.response?.data || err.message);
    throw err;
  }
}
