import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  fireflyKey: string;
  createdAt: Date;
  likedPosts: string[];
  comparePassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fireflyKey: { type: String, required: true },
  likedPosts: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

// Here we save passwrod 
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// We compare passwrods to check if user correct
UserSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
  return bcrypt.compare(enteredPassword, this.password);
};

export const UserModel = mongoose.model<IUser>("User", UserSchema);
