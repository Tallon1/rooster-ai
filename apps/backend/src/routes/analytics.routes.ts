import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import {
  getDashboardMetrics,
  getStaffUtilization,
  getDepartmentAnalytics,
  getSchedulingTrends,
  getCostAnalysis,
} from "../controllers/analytics.controller";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";

const router: ExpressRouter = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Analytics routes
router.get(
  "/dashboard",
  requireRole(["admin", "owner", "manager"]),
  getDashboardMetrics
);
router.get(
  "/staff-utilization",
  requireRole(["admin", "owner", "manager"]),
  getStaffUtilization
);
router.get(
  "/departments",
  requireRole(["admin", "owner", "manager"]),
  getDepartmentAnalytics
);
router.get(
  "/trends",
  requireRole(["admin", "owner", "manager"]),
  getSchedulingTrends
);
router.get(
  "/costs",
  requireRole(["admin", "owner", "manager"]),
  getCostAnalysis
);

export default router;
