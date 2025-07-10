import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import {
  createManagerUser,
  createStaffUser,
  getCompanyUsers,
  updateUserRole,
  getCompanyOverview,
  updateCompanySettings,
} from "../controllers/owner.controller";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";

const router: ExpressRouter = Router();

// Apply authentication and owner requirement to all routes
router.use(authenticateToken);
router.use(requireRole(["owner"])); // Owner-only routes

// User Management (Owner can create Manager and Staff users)
router.post("/users/manager", createManagerUser);
router.post("/users/staff", createStaffUser);
router.get("/users", getCompanyUsers);
router.put("/users/:id/role", updateUserRole);

// Company Management
router.get("/company/overview", getCompanyOverview);
router.put("/company/settings", updateCompanySettings);

export default router;
