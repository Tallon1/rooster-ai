import { BaseEntity } from "./common.types";

export interface UserProfile extends BaseEntity {
  email: string;
  name: string;
  role: string;
  tenantId: string;
  isActive: boolean;
  lastLoginAt?: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: "light" | "dark";
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

export interface CreateUserInput {
  companyId?: string; // Required for admin-created users
  firstName: string;
  lastName: string;
  email: string;
  password?: string; // Optional - will be auto-generated if not provided
  phone?: string;
  role?: "owner" | "manager" | "staff";
  staffData?: {
    position: string;
    department: string;
    hourlyRate?: number;
    startDate: string;
  };
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
}

export interface UserFilterInput {
  companyId?: string;
  role?: "admin" | "owner" | "manager" | "staff";
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface UserHierarchyStats {
  totalUsers: number;
  usersByCompany: Array<{
    tenantId: string;
    _count: { id: number };
  }>;
  usersByRole: Array<{
    roleId: string;
    _count: { id: number };
    role: { name: string };
  }>;
}
