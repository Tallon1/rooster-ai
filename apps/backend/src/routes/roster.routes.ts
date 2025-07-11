import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import {
  createRoster,
  getRoster,
  getAllRosters,
  updateRoster,
  deleteRoster,
  publishRoster,
  addShift,
  updateShift,
  deleteShift,
  createFromTemplate,
  getRosterStats,
} from "../controllers/roster.controller";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";

const router: ExpressRouter = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Accessible to admin, owner, manager
const managementRoles = ["admin", "owner", "manager"];

// Roster CRUD operations
router.post("/", requireRole(managementRoles), createRoster);
router.get("/stats", requireRole(managementRoles), getRosterStats);
router.get("/", getAllRosters); // All authenticated users can view rosters
router.get("/:id", getRoster);
router.put("/:id", requireRole(managementRoles), updateRoster);
router.delete("/:id", requireRole(managementRoles), deleteRoster);

// Roster publishing
router.post("/:id/publish", requireRole(managementRoles), publishRoster);

// Template operations
router.post(
  "/template/:templateId",
  requireRole(managementRoles),
  createFromTemplate
);

// Shift management
router.post("/:id/shifts", requireRole(managementRoles), addShift);
router.put("/shifts/:shiftId", requireRole(managementRoles), updateShift);
router.delete("/shifts/:shiftId", requireRole(managementRoles), deleteShift);

export default router;
