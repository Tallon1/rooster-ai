import { BaseEntity } from './common.types';

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
  theme: 'light' | 'dark';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}
