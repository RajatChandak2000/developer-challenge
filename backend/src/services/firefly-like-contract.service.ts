import FireFly from "@hyperledger/firefly-sdk";
import likeRegistryABI from "../../../solidity/artifacts/contracts/LikePost_v2.sol/LikeRegistry_V2.json"
import config from "../../config.json";

const firefly = new FireFly({
  host: config.HOST,
  namespace: config.NAMESPACE,
});

const ffiName = `likeRegistryV2FFI-${config.VERSION}`;
const apinamee = `likeApiV2-${config.VERSION}`;

let likeInterfaceId = "";

export const setupLikeRegistryContract = async () => {
  try {
    const interfaces = await firefly.getContractInterfaces();
    const existing = interfaces.find(i => i.name === ffiName && i.version === config.VERSION);

    if (existing) {
      console.log("LikeRegistry Interface already exists. Reusing:", existing.id);
      likeInterfaceId = existing.id;
    } else {
      const generatedFFI = await firefly.generateContractInterface({
        name: ffiName,
        namespace: config.NAMESPACE,
        version: config.VERSION,
        input: { abi: likeRegistryABI.abi },
        description: "FFI for LikeRegistry",
      });

      const createdInterface = await firefly.createContractInterface(generatedFFI, { confirm: true });
      likeInterfaceId = createdInterface.id;

      await firefly.createContractAPI({
        interface: { id: likeInterfaceId },
        location: { address: config.LIKE_REGISTRY_ADDRESS },
        name: apinamee,
      }, { confirm: true });

      console.log(" LikeRegistry Contract API created.");
    }
  } catch (e: any) {
    console.error("LikeRegistry setup failed:", e.message);
  }

  return likeInterfaceId;
};

export const likeApiName = apinamee;
