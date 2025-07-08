// Frontend-specific roster types that match the API response structure
export interface FrontendStaff {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  avatar?: string;
}

export interface RosterShift {
  id: string;
  startTime: Date;
  endTime: Date;
  position: string;
  notes?: string;
  isConfirmed: boolean;
  staff: FrontendStaff;
}

export interface FrontendRoster {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isPublished: boolean;
  isTemplate: boolean;
  notes?: string;
  shifts: RosterShift[];
  createdAt: Date;
  updatedAt: Date;
}
