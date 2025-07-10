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

// Roster CRUD operations
router.post("/", requireRole(["admin", "owner", "manager"]), createRoster);
router.get(
  "/stats",
  requireRole(["admin", "owner", "manager"]),
  getRosterStats
);
router.get("/", getAllRosters); // All authenticated users can view rosters
router.get("/:id", getRoster);
router.put("/:id", requireRole(["admin", "owner", "manager"]), updateRoster);
router.delete("/:id", requireRole(["admin", "owner", "manager"]), deleteRoster);

// Roster publishing
router.post(
  "/:id/publish",
  requireRole(["admin", "owner", "manager"]),
  publishRoster
);

// Template operations
router.post(
  "/template/:templateId",
  requireRole(["admin", "owner", "manager"]),
  createFromTemplate
);

// Shift management
router.post(
  "/:id/shifts",
  requireRole(["admin", "owner", "manager"]),
  addShift
);
router.put(
  "/shifts/:shiftId",
  requireRole(["admin", "owner", "manager"]),
  updateShift
);
router.delete(
  "/shifts/:shiftId",
  requireRole(["admin", "owner", "manager"]),
  deleteShift
);

export default router;
