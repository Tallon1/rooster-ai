import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/notification.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router: ExpressRouter = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Notification routes - Available to all authenticated users
router.get("/", getUserNotifications);
router.put("/:id/read", markNotificationAsRead);
router.put("/read-all", markAllNotificationsAsRead);

export default router;
