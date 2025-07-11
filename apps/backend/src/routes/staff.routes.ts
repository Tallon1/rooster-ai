import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import {
  createStaff,
  getStaff,
  getAllStaff,
  updateStaff,
  deleteStaff,
  getStaffStats,
  updateStaffAvailability,
} from "../controllers/staff.controller";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";

const router: ExpressRouter = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Accessible to admin, owner, manager
const managementRoles = ["admin", "owner", "manager"];

// Staff CRUD operations
router.post("/", requireRole(managementRoles), createStaff);
router.get("/stats", requireRole(managementRoles), getStaffStats);
router.get("/", getAllStaff); // All authenticated users can view staff list
router.get("/:id", getStaff);
router.put("/:id", requireRole(managementRoles), updateStaff);
router.delete("/:id", requireRole(["admin", "owner"]), deleteStaff);

// Staff availability management
router.put(
  "/:id/availability",
  requireRole(managementRoles),
  updateStaffAvailability
);

export default router;
