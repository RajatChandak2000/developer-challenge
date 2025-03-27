import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
  caption: string;
  artist: mongoose.Types.ObjectId;
  fireflyKey: string;
  sha256: string;
  pHash: string;
  ipfsHash: string;
  ipfsLink: string; // IPFS link
  txId: string;
  imageId?: number; 
  derivedFrom?: mongoose.Types.ObjectId; 
  requireRoyalty?: boolean;
  likeCount: number; 
  originalArtist?: mongoose.Types.ObjectId; // Store original artist if derived
  artistName: string; // Name of the artist
  createdAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    caption: { type: String, required: true },
    artist: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fireflyKey: { type: String, required: true },
    sha256: { type: String, required: true },
    pHash: { type: String, required: true },
    ipfsHash: { type: String, required: true },
    ipfsLink: { type: String, required: true }, // This is image link to display
    txId: { type: String },
    imageId: { type: Number },
    derivedFrom: { type: Schema.Types.ObjectId, ref: "Post" },
    requireRoyalty: { type: Boolean, default: false },
    likeCount: { type: Number, default: 0 },
    originalArtist: { type: Schema.Types.ObjectId, ref: "User" }, // Store the original artist
    artistName: { type: String, required: true }, // Artist name
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const PostModel = mongoose.model<IPost>("Post", PostSchema);
