import { fireflyClient } from "./firefly-contract.service";
import { IPost, PostModel } from "../models/Posts";
import { UserModel } from "../models/Users";
import config from "../../config.json";
import mongoose from "mongoose";
import { Notification } from "../models/Notifications";
import { sendNotificationToUser } from "../index";
import { ImageRegistryModel } from "../models/ImageRegistryModel";

const likeApiName = `likeApiV2-${config.VERSION}`; // same name you used in setup

export const handleLikePost = async (postId: string, userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user) throw new Error("User not found");

  const post = await PostModel.findById(postId);
  if (!post) throw new Error("Post not found");

  const imageId = post.imageId;
  if (imageId === undefined || imageId === null)
    throw new Error("Post is not registered on-chain yet");

  if (user.likedPosts.includes(postId)) {
    return { message: "User already liked this post." };
  }

  const targetPost = await ImageRegistryModel.findById(post.derivedFrom);

  if (targetPost) {
    const baseImageId = targetPost.imageId;
    console.log("baseImage id", baseImageId);

    if (baseImageId === undefined || baseImageId === null)
      return { message: "Image not yet registered on-chain" };

    // Check if user already liked the original image
    const checkBase = await fireflyClient.queryContractAPI(likeApiName, "hasLiked", {
      input: {
        imageId: baseImageId,
        user: user.fireflyKey,
      },
      key: config.SIGNING_KEY,
    });

    const hasLikedBase = checkBase.output as boolean;

    if (!hasLikedBase) {
      await fireflyClient.invokeContractAPI(likeApiName, "likePost", {
        input: { imageId: baseImageId },
        key: user.fireflyKey,
      });
    }
  }

  // Now like the current (derived or original) image
  const checkSelf = await fireflyClient.queryContractAPI(likeApiName, "hasLiked", {
    input: {
      imageId: imageId,
      user: user.fireflyKey,
    },
    key: config.SIGNING_KEY,
  });

  const hasLiked = checkSelf.output as boolean;
  if (!hasLiked) {
    await fireflyClient.invokeContractAPI(likeApiName, "likePost", {
      input: { imageId: imageId },
      key: user.fireflyKey,
    });
  }
  user.likedPosts.push(postId);
  await user.save();

  return {
    message: "Post liked successfully",
  };
};
