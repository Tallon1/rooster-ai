import { z } from 'zod';

// Shift schemas
export const createShiftSchema = z.object({
  staffId: z.string().cuid('Invalid staff ID'),
  startTime: z.string().datetime('Invalid start time'),
  endTime: z.string().datetime('Invalid end time'),
  position: z.string().min(1, 'Position is required'),
  notes: z.string().optional(),
});

export const updateShiftSchema = createShiftSchema.partial().extend({
  isConfirmed: z.boolean().optional(),
});

// Roster schemas
export const createRosterSchema = z.object({
  name: z.string().min(1, 'Roster name is required'),
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date'),
  isTemplate: z.boolean().default(false),
  notes: z.string().optional(),
  shifts: z.array(createShiftSchema).optional(),
});

export const updateRosterSchema = createRosterSchema.partial();

export const rosterFilterSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  isPublished: z.boolean().optional(),
  isTemplate: z.boolean().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'startDate', 'endDate', 'createdAt']).default('startDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Type exports
export type CreateShiftInput = z.infer<typeof createShiftSchema>;
export type UpdateShiftInput = z.infer<typeof updateShiftSchema>;
export type CreateRosterInput = z.infer<typeof createRosterSchema>;
export type UpdateRosterInput = z.infer<typeof updateRosterSchema>;
export type RosterFilterInput = z.infer<typeof rosterFilterSchema>;
