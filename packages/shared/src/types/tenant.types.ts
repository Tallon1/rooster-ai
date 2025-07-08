import { BaseEntity } from './common.types';

export interface Tenant extends BaseEntity {
  name: string;
  domain: string;
  isActive: boolean;
  subscriptionPlan: string;
  maxUsers: number;
  settings: TenantSettings;
}

export interface TenantSettings {
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  weekStartDay: number;
  allowOvertime: boolean;
  maxShiftHours: number;
}
