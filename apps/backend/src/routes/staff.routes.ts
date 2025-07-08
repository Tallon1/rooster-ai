import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import {
  createStaff,
  getStaff,
  getAllStaff,
  updateStaff,
  deleteStaff,
  getStaffStats,
  updateStaffAvailability
} from '../controllers/staff.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router: ExpressRouter = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Staff CRUD operations
router.post('/', requireRole(['admin', 'manager']), createStaff);
router.get('/stats', requireRole(['admin', 'manager']), getStaffStats);
router.get('/', getAllStaff);
router.get('/:id', getStaff);
router.put('/:id', requireRole(['admin', 'manager']), updateStaff);
router.delete('/:id', requireRole(['admin']), deleteStaff);

// Staff availability management
router.put('/:id/availability', requireRole(['admin', 'manager']), updateStaffAvailability);

export default router;
