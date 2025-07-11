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

// Accessible to admin, owner, manager
const managementRoles = ["admin", "owner", "manager"];

// Analytics routes
router.get("/dashboard", requireRole(managementRoles), getDashboardMetrics);
router.get(
  "/staff-utilization",
  requireRole(managementRoles),
  getStaffUtilization
);
router.get(
  "/departments",
  requireRole(managementRoles),
  getDepartmentAnalytics
);
router.get("/trends", requireRole(managementRoles), getSchedulingTrends);
router.get("/costs", requireRole(managementRoles), getCostAnalysis);

export default router;
