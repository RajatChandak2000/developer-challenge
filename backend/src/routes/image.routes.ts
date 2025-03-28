import express from "express";
import multer from "multer";
import { uploadImage } from "../controllers/image.controller";
import { getAllPosts } from "../controllers/image.controller";
import { requireAuth } from "../middleware/auth.middleware"; 

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/post", requireAuth, upload.single("image"), uploadImage);
router.get("/posts", requireAuth, getAllPosts);

export default router;