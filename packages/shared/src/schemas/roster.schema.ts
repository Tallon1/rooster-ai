import { z } from 'zod';

// Roster schemas
export const createShiftSchema = z.object({
  staffId: z.string().uuid('Invalid staff ID'),
  startTime: z.string().datetime('Invalid start time'),
  endTime: z.string().datetime('Invalid end time'),
  position: z.string().min(1, 'Position is required'),
  notes: z.string().optional(),
});

export const createRosterSchema = z.object({
  name: z.string().min(1, 'Roster name is required'),
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date'),
  shifts: z.array(createShiftSchema),
});

export const updateRosterSchema = createRosterSchema.partial();

export const rosterFilterSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  staffId: z.string().uuid().optional(),
  position: z.string().optional(),
});

// Type exports
export type CreateShiftInput = z.infer<typeof createShiftSchema>;
export type CreateRosterInput = z.infer<typeof createRosterSchema>;
export type UpdateRosterInput = z.infer<typeof updateRosterSchema>;
export type RosterFilterInput = z.infer<typeof rosterFilterSchema>;
