import { Request, Response } from "express";
import { registerUser } from "../services/auth.service";
import { loginUser } from "../services/auth.service";

/**
 * Controller for POST /api/auth/register
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Basic input validation to check if user has provided all the fields
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email, and password are required." });
    }

    // Register the new user
    const newUser = await registerUser(username, email, password);

    return res.status(201).json({
      message: "User registered successfully!!",
      user: newUser
    });
  } catch (err: any) {
    console.error("Registration failed:", err.message);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
  
      const data = await loginUser(email, password);
  
      return res.status(200).json({
        message: "Login successful",
        token: data.token,
        user: data.user
      });
    } catch (err: any) {
      console.error("Login error:", err.message);
      return res.status(401).json({ error: err.message || "Invalid credentials" });
    }
  };