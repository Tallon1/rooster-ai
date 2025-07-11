import { z } from "zod";

export const createStoreLocationSchema = z.object({
  name: z.string().min(2, "Location name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  isActive: z.boolean().default(true).optional(),
});

export const updateStoreLocationSchema = createStoreLocationSchema.partial();

export const assignStaffToLocationSchema = z.object({
  staffIds: z
    .array(z.string().cuid("Invalid staff ID"))
    .min(1, "At least one staff member must be selected"),
});

export const storeLocationFilterSchema = z.object({
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(["name", "address", "createdAt"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

// ❌ Remove these type exports to avoid conflicts:
// export type CreateStoreLocationInput = z.infer<typeof createStoreLocationSchema>;
// export type UpdateStoreLocationInput = z.infer<typeof updateStoreLocationSchema>;
// export type AssignStaffToLocationInput = z.infer<typeof assignStaffToLocationSchema>;
// export type StoreLocationFilterInput = z.infer<typeof storeLocationFilterSchema>;
