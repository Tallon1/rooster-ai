import { z } from 'zod';

export const createUserSchema = z.object({
  companyId: z.string().cuid('Invalid company ID').optional(),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  phone: z.string().optional(),
  role: z.enum(['owner', 'manager', 'staff']).optional(),
  staffData: z.object({
    position: z.string().min(1, 'Position is required'),
    department: z.string().min(1, 'Department is required'),
    hourlyRate: z.number().positive('Hourly rate must be positive').optional(),
    startDate: z.string().datetime('Invalid start date')
  }).optional()
});

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional()
});

export const userFilterSchema = z.object({
  companyId: z.string().cuid().optional(),
  role: z.enum(['admin', 'owner', 'manager', 'staff']).optional(),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'email', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserFilterInput = z.infer<typeof userFilterSchema>;
