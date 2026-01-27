/**
 * Error Handler for Wallinst Frontend
 */

import { ApiError } from './api-client';
import { ApiErrorCode } from './types';

export function handleApiError(error: unknown): {
  message: string;
  code: string;
  userMessage: string;
} {
  if (error instanceof ApiError) {
    let userMessage = error.message;

    switch (error.code) {
      case ApiErrorCode.AUTHENTICATION_ERROR:
        userMessage = 'Your session has expired. Please log in again.';
        break;
      case ApiErrorCode.AUTHORIZATION_ERROR:
        userMessage = 'You do not have permission to perform this action.';
        break;
      case ApiErrorCode.VALIDATION_ERROR:
        userMessage = error.message;
        break;
      case ApiErrorCode.NOT_FOUND:
        userMessage = 'The requested resource was not found.';
        break;
      case ApiErrorCode.RATE_LIMIT_EXCEEDED:
        userMessage = 'Too many requests. Please try again later.';
        break;
      case ApiErrorCode.INTERNAL_ERROR:
        userMessage = 'An unexpected error occurred. Please try again.';
        break;
      default:
        userMessage = error.message || 'An error occurred';
    }

    return {
      message: error.message,
      code: error.code,
      userMessage,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
      userMessage: 'An unexpected error occurred. Please try again.',
    };
  }

  return {
    message: 'Unknown error',
    code: 'UNKNOWN_ERROR',
    userMessage: 'An unexpected error occurred. Please try again.',
  };
}

export function getFieldError(
  error: ApiError,
  fieldName: string
): string | null {
  if (error.details && error.details.field === fieldName) {
    return error.message;
  }
  return null;
}
