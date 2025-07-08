// Utility functions
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Export all utility modules
export * from './validation';
export * from './constants';
