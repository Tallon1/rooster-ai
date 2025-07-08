import { BaseEntity } from './common.types';

export interface Notification extends BaseEntity {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  data?: Record<string, any>;
}

export type NotificationType = 
  | 'roster_published' 
  | 'shift_assigned' 
  | 'shift_changed' 
  | 'system_update';

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
}
