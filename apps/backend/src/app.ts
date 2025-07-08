import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { ApiResponse } from "@rooster-ai/shared";

// Import routes
import authRoutes from "./routes/auth.routes";
import staffRoutes from "./routes/staff.routes";

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/staff", staffRoutes);

// Basic health check route
app.get("/health", (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: {
      status: "OK",
      message: "Rooster AI Backend is running",
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
});

// Basic API route
app.get("/api", (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: {
      message: "Welcome to Rooster AI API",
      version: "0.0.0",
    },
  };
  res.json(response);
});

// Start server
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

export default app;
