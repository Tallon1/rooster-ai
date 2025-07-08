import { BaseEntity } from './common.types';

// Roster types
export interface Shift extends BaseEntity {
  staffId: string;
  rosterId: string;
  startTime: Date;
  endTime: Date;
  position: string;
  notes?: string;
  isConfirmed: boolean;
  tenantId: string;
}

export interface Roster extends BaseEntity {
  name: string;
  startDate: Date;
  endDate: Date;
  isPublished: boolean;
  tenantId: string;
  shifts: Shift[];
}

export interface RosterSummary {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  totalShifts: number;
  isPublished: boolean;
}

export interface WeeklyRoster {
  weekStart: Date;
  weekEnd: Date;
  shifts: Shift[];
}

export interface RosterStats {
  totalHours: number;
  totalShifts: number;
  staffCount: number;
  averageHoursPerStaff: number;
}
