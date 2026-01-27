/**
 * Application Constants
 * Centralized constants to avoid hardcoded values throughout the codebase
 */

// API Configuration
export const DEFAULT_API_URL = 'http://localhost:8000';
export const API_PREFIX = '/api';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 200;

// Message Limits
export const MAX_MESSAGE_LENGTH = 1500;
export const MESSAGE_WARNING_THRESHOLD = 1400;

// Date Formatting
export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

// Query Configuration
export const QUERY_STALE_TIME = 30000; // 30 seconds
export const QUERY_RETRY_ATTEMPTS = 2;

// UI Constants
export const DEBOUNCE_DELAY = 300; // milliseconds
export const TOAST_DURATION = 5000; // milliseconds

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error: Unable to connect to the server. Please check if the backend is running and CORS is configured.',
  AUTH_REQUIRED: 'Your session has expired. Please log in again.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  RATE_LIMIT: 'Too many requests. Please try again later.',
  GENERIC: 'An unexpected error occurred. Please try again.',
  DM_SEND_FAILED: 'Failed to send DM. Please try again.',
  DM_SEND_SUCCESS: 'DM sent successfully!',
  LOAD_FAILED: 'Failed to load data. Please try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  DM_SENT: 'DM sent successfully!',
  SETTINGS_SAVED: 'Settings saved successfully',
  INSTAGRAM_CONNECTED: 'Instagram account connected successfully',
  INSTAGRAM_DISCONNECTED: 'Instagram account disconnected',
} as const;

// Validation Messages
export const VALIDATION_MESSAGES = {
  MESSAGE_REQUIRED: 'Please enter a message',
  MESSAGE_TOO_LONG: `Message must be ${MAX_MESSAGE_LENGTH} characters or less`,
  NO_COMMENT_INTERACTION: 'No comment interaction found to reply to',
} as const;
