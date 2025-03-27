import axios from "axios";
import config from "../../config.json";

const FIRE_FLY_BASE = `${config.HOST}/api/v1/namespaces/${config.NAMESPACE}`;
const CONTRACT_ADDRESS = config.LIKE_REGISTRY_ADDRESS; 
const LISTENER_NAME = "like-listener";
const SUBSCRIPTION_NAME = "like-subscription";
const TOPIC = "like-events";

export async function setupLikeEventFlow(interfaceId: string) {
  try {

    // First we fetch all listeners and check if listener already is already in place
    const { data: listeners } = await axios.get(`${FIRE_FLY_BASE}/contracts/listeners`);
    const existingListener = listeners.find((l: any) =>
      l.name === LISTENER_NAME &&
      l.interface?.id === interfaceId &&
      l.location?.address?.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()
    );

    let listenerId = existingListener?.id;

    if (!listenerId) {
      // If listner not already present then create one
      const { data: newListener } = await axios.post(`${FIRE_FLY_BASE}/contracts/listeners`, {
        name: LISTENER_NAME,
        topic: TOPIC,
        filters: [
          {
            interface: { id: interfaceId },
            location: { address: CONTRACT_ADDRESS },
            eventPath: "PostLiked"
          }
        ],
        options: { firstEvent: "oldest" }
      });
      listenerId = newListener.id;
    }

    const { data: subscriptions } = await axios.get(`${FIRE_FLY_BASE}/subscriptions`);
    const existingSub = subscriptions.find(
      (s: any) =>
        s.name === SUBSCRIPTION_NAME &&
        s.filter?.blockchainevent?.listener === listenerId
    );


    if (!existingSub) {

      // We create a subscription 
      await axios.post(`${FIRE_FLY_BASE}/subscriptions`, {
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
    }
  } catch (err: any) {
    console.error("Error setting up like listener:", err.response?.data || err.message);
  }
}
