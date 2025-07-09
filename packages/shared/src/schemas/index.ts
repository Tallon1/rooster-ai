import { z } from "zod";

// Basic validation schemas
export const emailSchema = z.string().email();
export const passwordSchema = z.string().min(8);

// Export all schema modules
export * from "./auth.schema";
export * from "./staff.schema";
export * from "./roster.schema";
export * from "./company.schema";
