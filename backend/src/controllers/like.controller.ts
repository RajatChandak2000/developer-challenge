// controllers/like.controller.ts
import { Request, Response } from "express";
import { handleLikePost } from "../services/like.service";
import { UserModel } from "../models/Users";

export const likePostController = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;
    const user = (req as any).user;
    const userId = user?.id;


    const result = await handleLikePost(postId, userId);
    res.status(200).json(result);
  } catch (error: any) {
    console.log("Like post error:", error.message);
    res.status(500).json("Failed to like post" );
  }
};

export const checkIfUserLikedPost = async (req: Request, res: Response) => {
    const postId = req.params.postId.toString();
    let user = (req as any).user;
    const userId = user?.id;
  
    // Get user
    user = await UserModel.findById(userId);
    if (!user) return res.status(404).send({ message: "User not found" });
  
    // Check if the postId is in the likedPosts array (as a string)
    const hasLiked = Boolean(user.likedPosts.includes(postId));
   
    return res.status(200).send({ hasLiked });
  };
