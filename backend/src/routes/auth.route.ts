import express from "express";
import { register } from "../controllers/auth.controller";
import { login } from "../controllers/auth.controller";

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user and generate Ethereum address
 */
router.post("/register", register);
router.post("/login", login);

export default router;
