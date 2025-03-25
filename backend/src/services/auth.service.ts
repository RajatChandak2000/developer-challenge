import { UserModel } from "../models/Users";
import { fireflyClient } from "./firefly-contract.service";
import axios from "axios";
import jwt from "jsonwebtoken";


const createEthereumAccount = async (): Promise<string> => {
    try {
      // Here we create a new Ethereum account
      const res = await axios.post("http://localhost:5100", {
        jsonrpc: "2.0",
        method: "personal_newAccount",
        params: ["user-secure-password"],
        id: 1,
      });
  
      const newAddress = res.data.result;
  
      // We also need to unlock the account as transactions were not succesfull
      await axios.post("http://localhost:5100", {
        jsonrpc: "2.0",
        method: "personal_unlockAccount",
        params: [
          newAddress,            
          "user-secure-password", 
          0                      
        ],
        id: 2,
      });
  
      // Return the address
      return newAddress;
  
    } catch (err) {
      console.error("Failed to create or unlock Ethereum account via Geth:", err);
      throw new Error("Could not generate or unlock signing key");
    }
  };
  



/**
 * Registers a new user by generating a FireFly signing key
 * and saving user data to MongoDB. Password is hashed via schema hook.
 */
export const registerUser = async (
    username: string,
    email: string,
    password: string
  ) => {
    // 1. Check if user exists
    const existingUser = await UserModel.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      throw new Error("User with this email or username already exists");
    }
  
    // 2. Create Ethereum account using Geth
    const fireflyKey = await createEthereumAccount();
  
    // 3. Create new user (password will be hashed by model)
    const user = new UserModel({
      username,
      email,
      password,
      fireflyKey
    });
  
    await user.save();
  
    // 4. Return response
    return {
      id: user._id,
      username: user.username,
      email: user.email,
      fireflyKey: user.fireflyKey,
      createdAt: user.createdAt
    };
  };

  export const loginUser = async (email: string, password: string) => {
    const user = await UserModel.findOne({ email });
    if (!user) throw new Error("Invalid credentials");
  
    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error("Invalid credentials");
  
    const token = jwt.sign(
      { id: user._id, fireflyKey: user.fireflyKey },
      process.env.JWT_SECRET || "test_secret_rc", // Use env in prod
      { expiresIn: "1d" }
    );
  
    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        fireflyKey: user.fireflyKey
      }
    };
  };