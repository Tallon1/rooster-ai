// Common types (export first to avoid circular dependencies)
export * from './common.types';

// Basic entity types
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// User types
export interface User extends BaseEntity {
  email: string;
  name: string;
  role: string;
}

// Export all type modules
export * from './auth.types';
export * from './staff.types';
export * from './roster.types';
export * from './tenant.types';
export * from './user.types';
export * from './ai.types';
export * from './notification.types';
