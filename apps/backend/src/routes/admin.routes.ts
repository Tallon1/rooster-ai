import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  suspendCompany,
  updateTokenLimit,
  createOwnerUser,
  createManagerUser,
  createStaffUser,
  getAllUsers,
  getTokenUsageStats,
  getCompanyTokenUsage,
  getDashboardStats,
} from "../controllers/admin.controller";
import { authenticateToken, requireAdmin } from "../middleware/auth.middleware";

const router: ExpressRouter = Router();

// Apply authentication and admin requirement to all routes
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * Company Management Routes
 */
router.post("/companies", createCompany);
router.get("/companies", getAllCompanies);
router.get("/companies/:id", getCompanyById);
router.put("/companies/:id", updateCompany);
router.post("/companies/:id/suspend", suspendCompany);
router.put("/companies/:id/token-limit", updateTokenLimit);

/**
 * User Management Routes
 */
router.post("/users/owner", createOwnerUser);
router.post("/users/manager", createManagerUser);
router.post("/users/staff", createStaffUser);
router.get("/users", getAllUsers);

/**
 * Token Management Routes
 */
router.get("/tokens/usage", getTokenUsageStats);
router.get("/companies/:companyId/tokens", getCompanyTokenUsage);

/**
 * Dashboard Statistics
 */
router.get("/dashboard/stats", getDashboardStats);

export default router;
