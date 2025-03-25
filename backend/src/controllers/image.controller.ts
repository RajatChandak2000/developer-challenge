import { Request, Response } from "express";
import { UserModel } from "../models/Users";
import { handleImageUpload } from "../services/image.service";
import mongoose from "mongoose";

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
