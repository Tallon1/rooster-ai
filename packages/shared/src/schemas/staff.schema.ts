import { z } from 'zod';

// Staff schemas
export const createStaffSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  position: z.string().min(1, 'Position is required'),
  department: z.string().min(1, 'Department is required'),
  hourlyRate: z.number().positive('Hourly rate must be positive').optional(),
  startDate: z.string().datetime(),
  isActive: z.boolean().default(true),
});

export const updateStaffSchema = createStaffSchema.partial();

export const staffFilterSchema = z.object({
  department: z.string().optional(),
  position: z.string().optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
});

// Type exports
export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
export type StaffFilterInput = z.infer<typeof staffFilterSchema>;
