import { BaseEntity } from "./common.types";
import { Staff } from "./staff.types";

export interface StoreLocation extends BaseEntity {
  name: string;
  address: string;
  isActive: boolean;
  companyId: string;
  staffAssignments?: StaffAssignmentWithDetails[];
  staffCount?: number; // ✅ Add staff count for frontend display
  _count?: {
    staffAssignments: number;
  };
}

// New interface that matches the backend response
export interface StaffAssignmentWithDetails {
  staffId: string;
  storeLocationId?: string; // Optional since backend might not always include it
  id?: string; // Optional since backend might not always include it
  createdAt?: Date; // Optional since backend might not always include it
  updatedAt?: Date; // Optional since backend might not always include it
  staff: {
    id: string;
    name: string;
    position: string;
  };
}

export interface StaffStoreLocationAssignment extends BaseEntity {
  staffId: string;
  storeLocationId: string;
  staff?: Staff;
  storeLocation?: StoreLocation;
}

export interface CreateStoreLocationInput {
  name: string;
  address: string;
  isActive?: boolean;
}

export interface UpdateStoreLocationInput
  extends Partial<CreateStoreLocationInput> {
  name?: string;
  address?: string;
  isActive?: boolean;
}

export interface AssignStaffToLocationInput {
  staffIds: string[];
}

export interface StoreLocationFilterInput {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
