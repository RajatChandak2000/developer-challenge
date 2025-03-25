import FireFly from "@hyperledger/firefly-sdk";
import bodyparser from "body-parser";
import express from "express";
import multer from "multer";
import { setupImageRegistryContract, fireflyClient } from "./services/firefly-contract.service";
import { handleImageUpload } from "./services/image.service";
import config from "../config.json";
import imageRoutes from "./routes/image.routes";
import { connectToDatabase } from "./utils/db";
import authRoutes from "./routes/auth.route";
import mongoose from "mongoose";
import { PostModel } from "./models/Posts";
import { setupEventFlow } from "./utils/listner";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(bodyparser.json());

app.use("/api", imageRoutes);
app.use("/api/auth", authRoutes);

async function listenToEvents() {
  fireflyClient.listen(
    { filter: { events: "blockchain_event_received" } },
    async (socket, event) => {
      if ("blockchainEvent" in event) {
        console.log("==========================================================")
        // console.log("Received blockchain event:", event);

        const blockchainEvent = event.blockchainEvent as unknown as {
          info?: { signature?: string };
          output?: {
            imageId: string;
            sha256Hash: string;
            [key: string]: any;
          };
        };
        
        const sig = blockchainEvent.info?.signature;
        const payload = blockchainEvent.output;
        
        if (sig?.includes("ImageRegistered") && payload) {
          const imageId = Number(payload.imageId);
          const sha256Hash = payload.sha256Hash?.replace(/^0x/, "");

          console.log("ImageRegistered event:", { imageId, sha256Hash });

          const updated = await PostModel.findOneAndUpdate(
            { sha256: sha256Hash },
            { imageId },
            { new: true }
          );

          if (updated) {
            console.log(`Post updated with imageId ${imageId}`);
          } else {
            console.warn(" No matching post found for sha256:", sha256Hash);
          }
        }
      }
    }
  );
}


async function init() {
  await connectToDatabase();
  const interfaceId = await setupImageRegistryContract();
  console.log("Interface id", interfaceId)
  //await setupEventFlow(interfaceId);
  await listenToEvents();

  app.listen(config.PORT, () =>
    console.log(`Kaleido DApp backend listening on port ${config.PORT}!`)
  );
}

init().catch((err) => {
  console.error(err.stack);
});

module.exports = {
  app,
};
