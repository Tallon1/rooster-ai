import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import {
  getDashboardMetrics,
  getStaffUtilization,
  getDepartmentAnalytics,
  getSchedulingTrends,
  getCostAnalysis
} from '../controllers/analytics.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router: ExpressRouter = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Analytics routes (admin and manager only)
router.get('/dashboard', requireRole(['admin', 'manager']), getDashboardMetrics);
router.get('/staff-utilization', requireRole(['admin', 'manager']), getStaffUtilization);
router.get('/departments', requireRole(['admin', 'manager']), getDepartmentAnalytics);
router.get('/trends', requireRole(['admin', 'manager']), getSchedulingTrends);
router.get('/costs', requireRole(['admin', 'manager']), getCostAnalysis);

export default router;
