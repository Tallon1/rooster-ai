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
  companyId: string;
  avatar?: string;
  preferences: Record<string, any>;
  availability?: StaffAvailability[];
  shifts?: Shift[];
  _count?: {
    shifts: number;
  };
}

export interface StaffAvailability extends BaseEntity {
  staffId: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isActive: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  isActive: boolean;
  avatar?: string;
}

export interface StaffFilter {
  department?: string;
  position?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface StaffStats {
  totalStaff: number;
  activeStaff: number;
  departments: Array<{
    name: string;
    count: number;
  }>;
  positions: Array<{
    name: string;
    count: number;
  }>;
}

// Import Shift type to avoid circular dependency
interface Shift {
  id: string;
  startTime: Date;
  endTime: Date;
  position: string;
  notes?: string;
  isConfirmed: boolean;
  roster?: {
    id: string;
    name: string;
  };
}
