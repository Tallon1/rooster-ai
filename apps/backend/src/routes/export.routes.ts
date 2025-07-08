import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { exportRoster, exportStaffList } from '../controllers/export.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router: ExpressRouter = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Export routes
router.get('/roster/:id', requireRole(['admin', 'manager']), exportRoster);
router.get('/staff', requireRole(['admin', 'manager']), exportStaffList);

export default router;
