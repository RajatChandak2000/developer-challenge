import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
  caption: string;
  artist: mongoose.Types.ObjectId;
  fireflyKey: string;
  sha256: string;
  pHash: string;
  ipfsHash: string;
  txId: string;
  imageId?: number; //  this is the image id we get from the blockchain
  derivedFrom?: mongoose.Types.ObjectId; // this will check if this post is a duplicate
  requireRoyalty?: boolean; // if original creator wants royalties or not
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
    txId: { type: String, required: true },

    imageId: { type: Number },
    derivedFrom: { type: Schema.Types.ObjectId, ref: "Post" },
    requireRoyalty: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const PostModel = mongoose.model<IPost>("Post", PostSchema);