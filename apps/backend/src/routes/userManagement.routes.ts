import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import {
  createOwnerUser,
  createManagerUser,
  createStaffUser,
  getAllUsers,
  updateUser,
  deactivateUser,
  getUserHierarchyStats,
} from "../controllers/userManagement.controller";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";

const router: ExpressRouter = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Accessible to admin, owner, manager
const managementRoles = ["admin", "owner", "manager"];

/**
 * Hierarchical User Creation Routes
 */
// Admin-only: Create Owner users for any company
router.post("/owner", requireRole(["admin"]), createOwnerUser);

// Admin or Owner: Create Manager users
router.post("/manager", requireRole(["admin", "owner"]), createManagerUser);

// Admin, Owner, or Manager: Create Staff users
router.post("/staff", requireRole(managementRoles), createStaffUser);

/**
 * User Management Routes
 */
// Get all users (with role-based filtering)
router.get("/", getAllUsers);

// Update user details
router.put("/:id", requireRole(managementRoles), updateUser);

// Deactivate user (soft delete)
router.delete("/:id", requireRole(["admin", "owner"]), deactivateUser);

/**
 * Statistics Routes
 */
// Get user hierarchy statistics
router.get("/stats/hierarchy", getUserHierarchyStats);

export default router;
