import crypto from "crypto";
const { Jimp } = require("jimp");
import sharp from "sharp";
import * as blockhash from "blockhash-core";
import { Notification } from "../models/Notifications";
import { sendNotificationToUser } from "../index";
import { fireflyClient, contractApiName } from "./firefly-contract.service";
import { hammingDistance } from "../utils/hashing";
import { PostModel } from "../models/Posts";
import { UserModel } from "../models/Users";


/**
 * Image service handle the full image upload pipeline:
 * - First we compute sha256 and pHash of incoming image
 * - Check MongoDB for duplicates and then check if present in blockcahin
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
    // For now we fetch all posts and check for similarity in all posts
    const allPosts = await PostModel.find({}, "sha256 pHash txId ipfsHash _id imageId artist requireRoyalty likeCount");

    for (const post of allPosts) {
      let basePost = post;
      if (post.derivedFrom) {
        const resolved = await PostModel.findById(post.derivedFrom);
        if (resolved) {
          console.log(` Found derived post. Using original post ${resolved._id} instead.`);
          basePost = resolved;
        }
      }
      const isExact = basePost.sha256 === shaHash;
      const dist = hammingDistance(pHashHex, basePost.pHash);
      const isSimilar = dist <= 10; //Current threshold set at 10 
      



      if ((isExact || isSimilar) && basePost.txId) {
        console.log(`Match found! Type: ${isExact ? "Exact" : "Similar"} | Distance: ${dist}`);
        console.log("Transaction id of that post:",basePost.txId)
        

        //Check if transaction actually happend
        const txDetails = await fireflyClient.getTransaction(basePost.txId);
        console.log(txDetails)
        console.log("Fetched txDetails:", txDetails?.id || "null");

        if (txDetails) {


          // Check if the orignal post require royalty by the owner
          if (basePost.requireRoyalty && !payRoyaltyFlag) {
            console.log("Royalty required! Sending the request back to frontend");
            return {
              requiresRoyalty: true,
              originalPost: {
                postId: basePost._id,
                artist: basePost.artist,
                ipfsHash: basePost.ipfsHash,
              },
              message: "Royalty required. Confirm before uploading",
            };
          }

          if (basePost.requireRoyalty && payRoyaltyFlag) {
            console.log("Simulating royalty payment");

            // We call the payRoyalty function in our smart contract
            const response = await fireflyClient.invokeContractAPI(
              contractApiName,
              "payRoyalty",
              {
                input: { imageId: basePost.imageId },
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

          

          console.log("Saving the derived image in DB...");
          const ipfsLink = `http://localhost:10207/ipfs/${ipfsHash}`;

          const derivedPost = await PostModel.create({
            caption,
            artist: user._id,
            fireflyKey: user.fireflyKey,
            sha256: shaHash,
            pHash: pHashHex,
            imageId: basePost.imageId,
            ipfsHash,
            ipfsLink,
            derivedFrom: basePost._id,
            originalArtist: basePost.artistName, // Store the original artist
            artistName: user.username, 
            likeCount: 0,
          });


          const message = isExact
          ? `Your post has been exactly duplicated by: ${user.username}`
          : `A similar image has been uploaded by: ${user.username}`;
    
        sendNotificationToUser(basePost.artist.toString(),message); // Send notification via WebSocket
    
        // Save the notification in the database for the original artist
        await Notification.create({
          userId: basePost.artist.toString(),
          message,
          read: false,
        });

          return {
            message: isExact
              ? "Exact duplicate uploaded as derived"
              : "Similar image uploaded as derived",
            ipfsHash,
            derivedPostId: derivedPost._id,
            matchType: isExact ? "exact" : "similar",
          };
        }
      }
    }

    console.log("No match found. Treating it as original upload.");


    // Upload image to IPFS
    console.log("So Uploading original image to IPFS...");
    const upload = await fireflyClient.uploadDataBlob(file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });
    const published = await fireflyClient.publishDataBlob(upload.id);
    const ipfsHash = published.blob.public;

    // Register the image on-chain
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
   
    const ipfsLink = `http://localhost:10207/ipfs/${ipfsHash}`;
    const newPost = await PostModel.create({
      caption,
      artist: user._id,
      fireflyKey: user.fireflyKey,
      sha256: shaHash,
      pHash: pHashHex,
      ipfsHash,
      ipfsLink,
      txId: tx.tx,
      requireRoyalty: requireRoyalty || false,
      artistName: user.username, // Store the artist's name
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
