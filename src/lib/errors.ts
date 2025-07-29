// Centralized error handling utilities

export interface ApiError {
  code: string
  message: string
  field?: string
  details?: any
}

export interface ValidationError {
  field: string
  message: string
}

// Standard error codes
export const ERROR_CODES = {
  // Authentication errors
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_USER_NOT_FOUND: 'AUTH_USER_NOT_FOUND',
  AUTH_EMAIL_ALREADY_EXISTS: 'AUTH_EMAIL_ALREADY_EXISTS',
  AUTH_WEAK_PASSWORD: 'AUTH_WEAK_PASSWORD',
  AUTH_INVALID_EMAIL: 'AUTH_INVALID_EMAIL',
  AUTH_SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED',
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  AUTH_FORBIDDEN: 'AUTH_FORBIDDEN',

  // Message errors
  MESSAGE_NOT_FOUND: 'MESSAGE_NOT_FOUND',
  MESSAGE_INVALID_PHONE: 'MESSAGE_INVALID_PHONE',
  MESSAGE_TITLE_REQUIRED: 'MESSAGE_TITLE_REQUIRED',
  MESSAGE_DESCRIPTION_REQUIRED: 'MESSAGE_DESCRIPTION_REQUIRED',
  MESSAGE_PHONE_REQUIRED: 'MESSAGE_PHONE_REQUIRED',

  // General errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  BAD_REQUEST: 'BAD_REQUEST',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]

// Error messages mapping
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: 'Invalid email or password',
  [ERROR_CODES.AUTH_USER_NOT_FOUND]: 'User not found',
  [ERROR_CODES.AUTH_EMAIL_ALREADY_EXISTS]: 'An account with this email already exists',
  [ERROR_CODES.AUTH_WEAK_PASSWORD]: 'Password must be at least 8 characters long',
  [ERROR_CODES.AUTH_INVALID_EMAIL]: 'Please enter a valid email address',
  [ERROR_CODES.AUTH_SESSION_EXPIRED]: 'Your session has expired. Please log in again',
  [ERROR_CODES.AUTH_UNAUTHORIZED]: 'You must be logged in to perform this action',
  [ERROR_CODES.AUTH_FORBIDDEN]: 'You do not have permission to perform this action',

  [ERROR_CODES.MESSAGE_NOT_FOUND]: 'Message not found',
  [ERROR_CODES.MESSAGE_INVALID_PHONE]: 'Please enter a valid phone number',
  [ERROR_CODES.MESSAGE_TITLE_REQUIRED]: 'Title is required',
  [ERROR_CODES.MESSAGE_DESCRIPTION_REQUIRED]: 'Description is required',
  [ERROR_CODES.MESSAGE_PHONE_REQUIRED]: 'Contact phone is required',

  [ERROR_CODES.VALIDATION_ERROR]: 'Please check your input and try again',
  [ERROR_CODES.NETWORK_ERROR]: 'Network error. Please check your connection and try again',
  [ERROR_CODES.INTERNAL_ERROR]: 'An unexpected error occurred. Please try again later',
  [ERROR_CODES.NOT_FOUND]: 'The requested resource was not found',
  [ERROR_CODES.BAD_REQUEST]: 'Invalid request. Please check your input',
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please wait a moment and try again',
}

// Custom error classes
export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly field?: string
  public readonly details?: any

  constructor(code: ErrorCode, message?: string, field?: string, details?: any) {
    super(message || ERROR_MESSAGES[code])
    this.name = 'AppError'
    this.code = code
    this.field = field
    this.details = details
  }
}

export class ValidationError extends AppError {
  constructor(field: string, message?: string) {
    super(ERROR_CODES.VALIDATION_ERROR, message, field)
    this.name = 'ValidationError'
  }
}

export class AuthError extends AppError {
  constructor(code: ErrorCode, message?: string, field?: string) {
    super(code, message, field)
    this.name = 'AuthError'
  }
}

export class NetworkError extends AppError {
  constructor(message?: string) {
    super(ERROR_CODES.NETWORK_ERROR, message)
    this.name = 'NetworkError'
  }
}

// Error parsing utilities
export function parseApiError(error: any): ApiError {
  // Handle AppError instances
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      field: error.field,
      details: error.details,
    }
  }

  // Handle fetch errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      code: ERROR_CODES.NETWORK_ERROR,
      message: ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR],
    }
  }

  // Handle Supabase auth errors
  if (error?.code) {
    const supabaseCode = error.code
    let appErrorCode: ErrorCode = ERROR_CODES.INTERNAL_ERROR

    switch (supabaseCode) {
      case 'invalid_credentials':
      case 'email_not_confirmed':
        appErrorCode = ERROR_CODES.AUTH_INVALID_CREDENTIALS
        break
      case 'user_not_found':
        appErrorCode = ERROR_CODES.AUTH_USER_NOT_FOUND
        break
      case 'email_address_invalid':
        appErrorCode = ERROR_CODES.AUTH_INVALID_EMAIL
        break
      case 'weak_password':
        appErrorCode = ERROR_CODES.AUTH_WEAK_PASSWORD
        break
      case 'signup_disabled':
      case 'email_address_not_authorized':
        appErrorCode = ERROR_CODES.AUTH_FORBIDDEN
        break
      default:
        appErrorCode = ERROR_CODES.INTERNAL_ERROR
    }

    return {
      code: appErrorCode,
      message: ERROR_MESSAGES[appErrorCode],
      details: error,
    }
  }

  // Handle HTTP response errors
  if (error?.status) {
    let appErrorCode: ErrorCode = ERROR_CODES.INTERNAL_ERROR

    switch (error.status) {
      case 400:
        appErrorCode = ERROR_CODES.BAD_REQUEST
        break
      case 401:
        appErrorCode = ERROR_CODES.AUTH_UNAUTHORIZED
        break
      case 403:
        appErrorCode = ERROR_CODES.AUTH_FORBIDDEN
        break
      case 404:
        appErrorCode = ERROR_CODES.NOT_FOUND
        break
      case 429:
        appErrorCode = ERROR_CODES.RATE_LIMIT_EXCEEDED
        break
      default:
        appErrorCode = ERROR_CODES.INTERNAL_ERROR
    }

    return {
      code: appErrorCode,
      message: error.message || ERROR_MESSAGES[appErrorCode],
    }
  }

  // Handle generic errors
  return {
    code: ERROR_CODES.INTERNAL_ERROR,
    message: error?.message || ERROR_MESSAGES[ERROR_CODES.INTERNAL_ERROR],
    details: error,
  }
}

// Error logging utility
export function logError(error: any, context?: string) {
  const parsedError = parseApiError(error)
  
  console.error(`[${context || 'ERROR'}]`, {
    code: parsedError.code,
    message: parsedError.message,
    field: parsedError.field,
    details: parsedError.details,
    timestamp: new Date().toISOString(),
    stack: error?.stack,
  })
}

// Retry utility for network operations
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      // Don't retry on certain error types
      const parsedError = parseApiError(error)
      if (
        parsedError.code === ERROR_CODES.AUTH_UNAUTHORIZED ||
        parsedError.code === ERROR_CODES.AUTH_FORBIDDEN ||
        parsedError.code === ERROR_CODES.VALIDATION_ERROR ||
        parsedError.code === ERROR_CODES.BAD_REQUEST
      ) {
        throw error
      }

      if (attempt === maxRetries) {
        break
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }

  throw lastError
}

// Safe async operation wrapper
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<{ data?: T; error?: ApiError }> {
  try {
    const data = await operation()
    return { data }
  } catch (error) {
    const parsedError = parseApiError(error)
    logError(error, 'safeAsync')
    return { error: parsedError, data: fallback }
  }
}