// Shared types
export * from "./types/common.types";
export * from "./types/auth.types";
export * from "./types/user.types";
export * from "./types/storeLocation.types"; // Add before company.types
export * from "./types/company.types";
export * from "./types/staff.types";
export * from "./types/roster.types";
export * from "./types/ai.types";
export * from "./types/notification.types";

// Shared utilities
export * from "./utils";

// Shared schemas
export * from "./schemas/auth.schema";
export * from "./schemas/staff.schema";
export * from "./schemas/roster.schema";
export * from "./schemas/company.schema";
export * from "./schemas/storeLocation.schema";
export {
  createUserSchema,
  updateUserSchema,
  userFilterSchema,
} from "./schemas/user.schema";

export const SHARED_CONSTANTS = {
  APP_NAME: "Rooster AI",
  VERSION: "0.0.0",
} as const;
