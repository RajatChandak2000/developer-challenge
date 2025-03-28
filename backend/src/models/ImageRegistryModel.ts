// models/ImageRegistry.ts

import mongoose, { Schema, Document } from "mongoose";

export interface IImageRegistry extends Document {
  imageId: number;
  sha256: string;
  pHash: string;
  ipfsHash: string;
  artist: string;         // Ethereum address
  artistName?: string;    // from User model
  org: string;   // your org name, e.g., OrgA
  timestamp: Date;
  requireRoyalty: boolean;
}

const schema = new Schema<IImageRegistry>({
  imageId: { type: Number, required: true },
  sha256: { type: String, required: true },
  pHash: { type: String, required: true },
  ipfsHash: { type: String, required: true },
  artist: { type: String, required: true },
  artistName: { type: String },
  org: { type: String },
  timestamp: { type: Date, required: true },
  requireRoyalty: { type: Boolean, default: false }
});

export const ImageRegistryModel = mongoose.model<IImageRegistry>("ImageRegistry", schema);
