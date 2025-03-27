import { fireflyClient } from "./firefly-contract.service";
import { IPost, PostModel } from "../models/Posts";
import { UserModel } from "../models/Users";
import config from "../../config.json";
import mongoose from "mongoose";
import { Notification } from "../models/Notifications";
import { sendNotificationToUser } from "../index";

const likeApiName = `likeApiV2-${config.VERSION}`; // same name you used in setup

export const handleLikePost = async (postId: string, userId: string) => {

  const user = await UserModel.findById(userId);
  if (!user) throw new Error("User not found");

  const post = await PostModel.findById(postId).populate("derivedFrom");
  if (!post) throw new Error("Post not found");

  const targetPost = (post.derivedFrom ? post.derivedFrom : post) as IPost;
  const imageId = targetPost.imageId;
  if (imageId === undefined || imageId === null) return { message:"Image not yet registered on-chain"};

    // Check if the user has already liked the post
  if (user.likedPosts.includes(postId)) {
    return { message: "User already liked this post." };
  }

  // Check if already liked the orignal post
  // Edge case where usesr already liked a derived post and liking another derived post
  const check = await fireflyClient.queryContractAPI(likeApiName, "hasLiked", {
    input: {
      imageId,
      user: user.fireflyKey,
    },
    key: config.SIGNING_KEY,
  });

  


  const hasLiked = check.output as boolean;
  if (!hasLiked) {

    // Check if the oringial post liked by the user or not, if not then like the orignal as well
    const tx = await fireflyClient.invokeContractAPI(likeApiName, "likePost", {
        input: { imageId },
        key: user.fireflyKey,
      });
  }
  

  user.likedPosts.push(postId);
  await user.save();




  if (post.derivedFrom) {
    // If the post is dervied one then incrase the like in the database for that post

    post.likeCount += 1;     
    const message = `Your post was liked by ${user.username} and has received this many ${post.likeCount} likes`
    sendNotificationToUser(post.artist.toString(),message);
    await Notification.create({
        userId: post.artist.toString(),
        message,
        read: false,
      }); 
    await post.save();
  }
  return {
    message: "Post liked successfully",
    imageId,
    originalPostId: targetPost._id,
  };
};
