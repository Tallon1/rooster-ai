// Application constants
export const APP_CONFIG = {
  NAME: 'Rooster AI',
  VERSION: '0.0.0',
  DESCRIPTION: 'AI-powered staff rostering platform',
} as const;

// API constants
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
  },
  STAFF: {
    LIST: '/api/staff',
    CREATE: '/api/staff',
    GET: '/api/staff/:id',
    UPDATE: '/api/staff/:id',
    DELETE: '/api/staff/:id',
  },
  ROSTER: {
    LIST: '/api/rosters',
    CREATE: '/api/rosters',
    GET: '/api/rosters/:id',
    UPDATE: '/api/rosters/:id',
    DELETE: '/api/rosters/:id',
    PUBLISH: '/api/rosters/:id/publish',
  },
} as const;

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
} as const;

// Permissions
export const PERMISSIONS = {
  STAFF_READ: 'staff:read',
  STAFF_WRITE: 'staff:write',
  ROSTER_READ: 'roster:read',
  ROSTER_WRITE: 'roster:write',
  ADMIN_PANEL: 'admin:panel',
} as const;

// Time constants
export const TIME_CONSTANTS = {
  MINUTES_PER_HOUR: 60,
  HOURS_PER_DAY: 24,
  DAYS_PER_WEEK: 7,
  MILLISECONDS_PER_SECOND: 1000,
  SECONDS_PER_MINUTE: 60,
} as const;

// Validation constants
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 255,
} as const;
