// routes/like.routes.ts
import express from "express";
import { requireAuth } from "../middleware/auth.middleware"; 
import { checkIfUserLikedPost, likePostController } from "../controllers/like.controller";

const router = express.Router();

// POST /api/post/:postId/like
router.post("/:postId/like", requireAuth, likePostController);
router.get("/hasLikedPost/:postId", requireAuth, checkIfUserLikedPost);

export default router;