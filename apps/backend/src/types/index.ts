// Basic API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

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

// Import specific types from shared package when needed
// Example: import { LoginInput, Staff } from '@rooster-ai/shared';
