import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import {
  exportRoster,
  exportStaffList,
} from "../controllers/export.controller";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";

const router: ExpressRouter = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Accessible to admin, owner, manager
const managementRoles = ["admin", "owner", "manager"];

// Export routes
router.get("/roster/:id", requireRole(managementRoles), exportRoster);
router.get("/staff", requireRole(managementRoles), exportStaffList);

export default router;
