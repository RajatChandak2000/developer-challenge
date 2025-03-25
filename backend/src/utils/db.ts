import mongoose from "mongoose";
import config from "../../config.json";

/**
 * Connects to MongoDB using Mongoose with proper options
 */
export const connectToDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(config.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit if DB fails
  }
};
