import { Request, Response } from "express";
import { UserModel } from "../models/Users";
import { ImageRegistryModel } from "../models/ImageRegistryModel";
import { handleImageUpload } from "../services/image.service";
import { PostModel } from "../models/Posts";
import mongoose from "mongoose";

/**
 * Controller for POST /api/post"
 */
export const uploadImage = async (req: Request, res: Response) => {
  const file = req.file;
  const { caption, requireRoyalty, payRoyalty } = req.body;

  const user = (req as any).user;

  if (!file || !caption || !user?.id || !user?.fireflyKey) {
    return res.status(400).json({ error: "Missing image, caption, or user info" });
  }

  const userRecord = await UserModel.findById(user.id);
  if (!userRecord) {
    return res.status(404).json({ error: "User not found" });
  }
  const userObjectId = userRecord._id as mongoose.Types.ObjectId;
  const userIdString = userObjectId.toString()
  if (!userRecord) return res.status(404).json({ error: "User not found" });

  // Now we pass the use id to the image service and we also pass the payRoyalty flag
  const result = await handleImageUpload(file, caption, userIdString,requireRoyalty === "true", payRoyalty === "true");
  res.status(200).json(result);
};

/**
 * Controller for GET /api/posts"
 */
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    //To fetch the posts and just give arsitst name and if derived from as well
    const posts = await PostModel.find({})
      .sort({ createdAt: -1 })
      .populate("artist", "username")
      .populate("derivedFrom", "artistName");

    res.status(200).json(posts);
  } catch (error: any) {
    console.error("Error fetching posts:", error.message);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};
