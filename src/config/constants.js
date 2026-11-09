export const STORAGE_KEY = 'myActivityData';

export const REPEAT_TYPES = Object.freeze({
  ONCE: 'once',
  SPECIFIC_DATE: 'specific_date',
  MONTHLY_DATE: 'monthly_date',
  MONTHLY_MULTIPLE: 'monthly_multiple',
  DAILY: 'daily',
  INTERVAL: 'interval',
  DAYS: 'days',
});

export const TASK_STATUS = Object.freeze({
  PENDING: 'pending',
  COMPLETED: 'completed',
});

export const DAY_NAMES = Object.freeze({
  0: 'Min', 1: 'Sen', 2: 'Sel', 3: 'Rab',
  4: 'Kam', 5: 'Jum', 6: 'Sab',
});

export const DEFAULT_CATEGORIES = [
  { id: 'c1', name: 'Work', color: '#3b82f6' },
  { id: 'c2', name: 'Personal', color: '#10b981' },
];

export const CONFETTI_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6'];