import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import {
  createStoreLocation,
  getAllStoreLocations,
  getStoreLocation,
  updateStoreLocation,
  deleteStoreLocation,
  assignStaffToLocation,
  getLocationStaff,
  getLocationStats,
} from "../controllers/storeLocation.controller";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";

const router: ExpressRouter = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Accessible to admin, owner, manager
const managementRoles = ["admin", "owner", "manager"];

// Store location CRUD operations
router.post("/", requireRole(managementRoles), createStoreLocation);
router.get("/", getAllStoreLocations); // All authenticated users can view locations
router.get("/stats", requireRole(managementRoles), getLocationStats);
router.get("/:id", getStoreLocation);
router.put("/:id", requireRole(managementRoles), updateStoreLocation);
router.delete("/:id", requireRole(["admin", "owner"]), deleteStoreLocation);

// Staff assignment operations
router.post(
  "/:id/assign-staff",
  requireRole(managementRoles),
  assignStaffToLocation
);
router.get("/:id/staff", getLocationStaff);

export default router;
