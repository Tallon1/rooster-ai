import { z } from "zod";

export const createCompanySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  domain: z.string().min(3, "Domain must be at least 3 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  employeeCount: z.number().positive("Employee count must be positive"),
  userLimit: z.number().positive("User limit must be positive").default(50),
  managerLimit: z
    .number()
    .positive("Manager limit must be positive")
    .default(10),
  tokenLimit: z
    .number()
    .positive("Token limit must be positive")
    .default(50000),
  storeLocations: z.array(z.string()).optional(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
  settings: z.record(z.any()).optional(),
});

export const updateCompanySchema = createCompanySchema.partial();

export const companyFilterSchema = z.object({
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z
    .enum(["name", "domain", "createdAt", "updatedAt"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const createUserSchema = z.object({
  companyId: z.string().cuid("Invalid company ID"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
  role: z.enum(["owner", "manager", "staff"]).optional(),
});

// ❌ Remove these duplicate type exports:
// export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
// export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
// export type CompanyFilterInput = z.infer<typeof companyFilterSchema>;
// export type CreateUserInput = z.infer<typeof createUserSchema>;
