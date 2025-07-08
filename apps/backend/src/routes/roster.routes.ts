import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
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
  getRosterStats
} from '../controllers/roster.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router: ExpressRouter = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Roster CRUD operations
router.post('/', requireRole(['admin', 'manager']), createRoster);
router.get('/stats', requireRole(['admin', 'manager']), getRosterStats);
router.get('/', getAllRosters);
router.get('/:id', getRoster);
router.put('/:id', requireRole(['admin', 'manager']), updateRoster);
router.delete('/:id', requireRole(['admin', 'manager']), deleteRoster);

// Roster publishing
router.post('/:id/publish', requireRole(['admin', 'manager']), publishRoster);

// Template operations
router.post('/template/:templateId', requireRole(['admin', 'manager']), createFromTemplate);

// Shift management
router.post('/:id/shifts', requireRole(['admin', 'manager']), addShift);
router.put('/shifts/:shiftId', requireRole(['admin', 'manager']), updateShift);
router.delete('/shifts/:shiftId', requireRole(['admin', 'manager']), deleteShift);

export default router;
