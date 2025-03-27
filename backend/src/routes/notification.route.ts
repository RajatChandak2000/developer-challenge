// routes/notification.routes.ts
import express from "express";
import { Notification } from "../models/Notifications";

const router = express.Router();

router.get("/notifications/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

export default router;
