import express, { Express, Request, Response } from "express";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { ApiResponse } from "@rooster-ai/shared";
import { WebSocketService } from "./services/websocket.service";

// Import routes
import authRoutes from "./routes/auth.routes";
import staffRoutes from "./routes/staff.routes";
import rosterRoutes from "./routes/roster.routes";
import notificationRoutes from "./routes/notification.routes";
import exportRoutes from "./routes/export.routes";
import analyticsRoutes from "./routes/analytics.routes";
import storeLocationRoutes from "./routes/storeLocation.routes";
import adminRoutes from "./routes/admin.routes";
import ownerRoutes from "./routes/owner.routes";

// Load environment variables
dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

// Initialize WebSocket service
export const websocketService = new WebSocketService(httpServer);

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Existing routes
app.use("/api/auth", authRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/rosters", rosterRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/locations", storeLocationRoutes);

// New enhanced routes
app.use("/api/admin", adminRoutes);
app.use("/api/owner", ownerRoutes);

// Basic health check route
app.get("/health", (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: {
      status: "OK",
      message: "Rooster AI Backend is running",
      timestamp: new Date().toISOString(),
      connectedUsers: websocketService.getConnectedUsersCount(),
    },
  };
  res.json(response);
});

// Enhanced API route with new features
app.get("/api", (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: {
      message: "Welcome to Rooster AI API",
      version: "1.0.0",
      features: [
        "Staff Management",
        "Roster Scheduling",
        "Real-time Updates",
        "Notifications",
        "Data Export",
        "Analytics",
        "Company Management",
        "Token Tracking",
        "Store Locations",
        "Owner Dashboard",
      ],
    },
  };
  res.json(response);
});

// Global error handling middleware
app.use(
  (
    error: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", error);

    const response: ApiResponse = {
      success: false,
      error:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : error.message,
    };

    res.status(500).json(response);
  }
);

// 404 handler for unmatched routes
app.use("*", (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: false,
    error: `Route ${req.originalUrl} not found`,
  };
  res.status(404).json(response);
});

// Start server
if (process.env.NODE_ENV !== "test") {
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔌 WebSocket server ready for connections`);
    console.log(`📧 Email notifications configured`);
    console.log(`📊 Analytics engine ready`);
    console.log(`📄 Export services available`);
    console.log(`👑 Admin management system ready`);
    console.log(`🏢 Company management enabled`);
    console.log(`🎯 Token tracking active`);
  });
}

export default app;
