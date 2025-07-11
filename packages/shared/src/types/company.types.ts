import { BaseEntity } from "./common.types";
import { User } from "./auth.types";
import { StoreLocation } from "./storeLocation.types";

export interface Company extends BaseEntity {
  name: string;
  domain: string;
  address: string;
  employeeCount: number;
  isActive: boolean;
  userLimit: number;
  managerLimit: number;
  tokenLimit: number;
  settings: CompanySettings;
  storeLocations?: StoreLocation[];
  users?: User[];
  _count?: {
    users: number;
    staff: number;
    rosters: number;
    storeLocations: number;
  };
}

export interface CompanySettings {
  timezone: string;
  currency: string;
  weekStartDay: number;
  [key: string]: any;
}

export interface CreateCompanyInput {
  name: string;
  domain: string;
  address: string;
  employeeCount: number;
  userLimit?: number;
  managerLimit?: number;
  tokenLimit?: number;
  storeLocations?: string[];
  timezone?: string;
  currency?: string;
  settings?: Record<string, any>;
}

export interface UpdateCompanyInput {
  name?: string;
  domain?: string;
  address?: string;
  employeeCount?: number;
  userLimit?: number;
  managerLimit?: number;
  tokenLimit?: number;
  isActive?: boolean;
  settings?: Record<string, any>;
}

export interface CompanyFilterInput {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateUserInput {
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}
