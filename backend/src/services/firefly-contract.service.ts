import FireFly from "@hyperledger/firefly-sdk";
import imageRegistryABI from "../../../solidity/artifacts/contracts/ImageRegistry_v2.sol/ImageRegistryV2.json";
import config from "../../config.json";

const firefly = new FireFly({
  host: config.HOST,
  namespace: config.NAMESPACE,
});

const ffiName = `imageRegistryV2FFI-${config.VERSION}`;
const apiName = `imageApiV2-${config.VERSION}`;


let interfaceId = "";


export const setupImageRegistryContract = async () => {
  try {
    const interfaces = await firefly.getContractInterfaces();

    const existingImageFFI = interfaces.find(i => i.name === ffiName && i.version === config.VERSION);
    if (existingImageFFI) {
      console.log("ImageRegistry Interface already exists. Reusing:", existingImageFFI.id);
      interfaceId = existingImageFFI.id;
    } else {
      const generatedFFI = await firefly.generateContractInterface({
        name: ffiName,
        namespace: config.NAMESPACE,
        version: config.VERSION,
        input: { abi: imageRegistryABI.abi },
        description: "FFI for ImageRegistryV2",
      });

      const createdInterface = await firefly.createContractInterface(generatedFFI, {
        confirm: true,
      });
      interfaceId = createdInterface.id;

      await firefly.createContractAPI(
        {
          interface: { id: interfaceId },
          location: { address: config.IMAGE_REGISTRY_ADDRESS },
          name: apiName,
        },
        { confirm: true }
      );

      console.log("ImageRegistry Contract API created.");
    }

  } catch (e: any) {
    console.error("FireFly setup failed:", e.message);
  }

  return {interfaceId};
};

export const fireflyClient = firefly;
export const contractApiName = apiName;
