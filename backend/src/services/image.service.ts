import crypto from "crypto";
const { Jimp } = require("jimp");
import sharp from "sharp";
import * as blockhash from "blockhash-core";

import { fireflyClient, contractApiName } from "./firefly-contract.service";
import { hammingDistance } from "../utils/hashing";
import { PostModel } from "../models/Posts";
import { UserModel } from "../models/Users";
import config from "../../config.json";

/**
 * Handle the full image upload pipeline:
 * - Compute sha256 and pHash
 * - Check MongoDB for duplicates
 * - If duplicate & royalty required, return prompt
 * - If confirmed, simulate royalty payment
 * - Upload to IPFS via FireFly
 * - Register image metadata on-chain via FireFly
 * - Save metadata in MongoDB (imageId added later via listener)
 */

export const handleImageUpload = async (
  file: Express.Multer.File,
  caption: string,
  userId: string,
  requireRoyalty?: boolean,
  payRoyaltyFlag?: boolean
) => {
  try {
    console.log (" In handleImageUpload");

    const shaHash = crypto.createHash("sha256").update(file.buffer).digest("hex");
    console.log("SHA-256 hash:", shaHash);

    if (!["image/jpeg", "image/png"].includes(file.mimetype)) {
      console.warn(" Unsupported MIME type, please upload only jpeg or png:", file.mimetype);
      return;
    }

    console.log("Resizing image...");
    const resizedBuffer = await sharp(file.buffer)
      .resize(256, 256, { fit: "fill" })
      .raw()
      .toBuffer();

    const imageData = {
      data: new Uint8ClampedArray(resizedBuffer),
      width: 256,
      height: 256,
    };

    console.log("Generating perceptual hash...");
    const pHashBuffer = await blockhash.bmvbhash(imageData, 16);
    const pHashHex = Buffer.from(pHashBuffer).toString("hex").slice(0, 32);
    console.log("pHash:", pHashHex);

    console.log("Fetching user from DB");
    const user = await UserModel.findById(userId);
    if (!user) {
      console.error(" User not found:", userId);
      return;
    }

    console.log("Here we check for similar or exact posts in DB...");
    // For now we fetch all posts and check in all posts 
    const allPosts = await PostModel.find({}, "sha256 pHash txId ipfsHash _id imageId artist requireRoyalty");

    for (const post of allPosts) {
      const isExact = post.sha256 === shaHash;
      const dist = hammingDistance(pHashHex, post.pHash);
      const isSimilar = dist <= 10;

      if ((isExact || isSimilar) && post.txId) {
        console.log(`Match found! Type: ${isExact ? "Exact" : "Similar"} | Distance: ${dist}`);
        console.log("Transaction id of that post:",post.txId)
        
        const txDetails = await fireflyClient.getTransaction(post.txId);
        console.log("Fetched txDetails:", txDetails?.id || "null");

        if (txDetails) {

          if (post.requireRoyalty && !payRoyaltyFlag) {
            console.log("Royalty required! Sending the request back to frontend");
            return {
              requiresRoyalty: true,
              originalPost: {
                postId: post._id,
                artist: post.artist,
                ipfsHash: post.ipfsHash,
              },
              message: "Royalty required. Confirm before uploading",
            };
          }

          if (post.requireRoyalty && payRoyaltyFlag) {
            console.log("Simulating royalty payment");
            await fireflyClient.invokeContractAPI(
              contractApiName,
              "payRoyalty",
              {
                input: { imageId: post.imageId },
                key: user.fireflyKey,
              },
              {
                confirm: true,
                requestConfig: {
                  headers: { "x-firefly-value": "1" },
                },
              }
            );
            console.log("Royalty payment simulated.");
          }

          console.log("Uploading derived image to IPFS...");
          const upload = await fireflyClient.uploadDataBlob(file.buffer, {
            filename: file.originalname,
            contentType: file.mimetype,
          });
          const published = await fireflyClient.publishDataBlob(upload.id);
          const ipfsHash = published.blob.public;

          console.log("Registering derived image on-chain...");
          const tx = await fireflyClient.invokeContractAPI(contractApiName, "registerImage", {
            input: {
              sha256Hash: `0x${shaHash}`,
              pHash: `0x${pHashHex}`,
              ipfsHash,
              requireRoyalty: false
            },
            key: user.fireflyKey,
          });

          console.log("Saving the derived image in DB...");
          const derivedPost = await PostModel.create({
            caption,
            artist: user._id,
            fireflyKey: user.fireflyKey,
            sha256: shaHash,
            pHash: pHashHex,
            ipfsHash,
            txId: tx.tx,
            derivedFrom: post._id,
          });

          return {
            message: isExact
              ? "Exact duplicate uploaded as derived"
              : "Similar image uploaded as derived",
            ipfsHash,
            txId: tx.tx,
            derivedPostId: derivedPost._id,
            matchType: isExact ? "exact" : "similar",
          };
        }
      }
    }

    console.log("No match found. Treating it as original upload.");

    console.log("So Uploading original image to IPFS...");
    const upload = await fireflyClient.uploadDataBlob(file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });
    const published = await fireflyClient.publishDataBlob(upload.id);
    const ipfsHash = published.blob.public;

    console.log("Registering original image on-chain...");
    const tx = await fireflyClient.invokeContractAPI(contractApiName, "registerImage", {
      input: {
        sha256Hash: `0x${shaHash}`,
        pHash: `0x${pHashHex}`,
        ipfsHash,
        requireRoyalty: requireRoyalty || false,
      },
      key: user.fireflyKey,
    });

    console.log("Saving original image in DB...");
   
    const newPost = await PostModel.create({
      caption,
      artist: user._id,
      fireflyKey: user.fireflyKey,
      sha256: shaHash,
      pHash: pHashHex,
      ipfsHash,
      txId: tx.tx,
      requireRoyalty: requireRoyalty || false,
    });

    console.log("Upload completed!");
    return {
      message: "Image uploaded and registered successfully",
      ipfsHash,
      txId: tx.tx,
      postId: newPost._id,
    };
  } catch (error: any) {
    console.error(" Upload error:", error);
    return { error: error.message || "Failed to upload image" };
  }
};
