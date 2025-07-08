import { BaseEntity } from './common.types';

// Staff types
export interface Staff extends BaseEntity {
  name: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  hourlyRate?: number;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  tenantId: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  isActive: boolean;
}

export interface StaffFilter {
  department?: string;
  position?: string;
  isActive?: boolean;
  search?: string;
}

export interface StaffStats {
  totalStaff: number;
  activeStaff: number;
  departments: string[];
  positions: string[];
}
