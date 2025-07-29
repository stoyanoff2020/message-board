import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  AppError,
  ValidationError,
  AuthError,
  NetworkError,
  parseApiError,
  logError,
  withRetry,
  safeAsync,
  ERROR_CODES,
  ERROR_MESSAGES,
} from '../errors'

// Mock console.error to avoid noise in tests
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

beforeEach(() => {
  mockConsoleError.mockClear()
})

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create an AppError with code and message', () => {
      const error = new AppError(ERROR_CODES.INTERNAL_ERROR, 'Custom message')
      
      expect(error.name).toBe('AppError')
      expect(error.code).toBe(ERROR_CODES.INTERNAL_ERROR)
      expect(error.message).toBe('Custom message')
      expect(error.field).toBeUndefined()
    })

    it('should use default message if none provided', () => {
      const error = new AppError(ERROR_CODES.AUTH_INVALID_CREDENTIALS)
      
      expect(error.message).toBe(ERROR_MESSAGES[ERROR_CODES.AUTH_INVALID_CREDENTIALS])
    })

    it('should include field and details', () => {
      const error = new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        'Field error',
        'email',
        { extra: 'data' }
      )
      
      expect(error.field).toBe('email')
      expect(error.details).toEqual({ extra: 'data' })
    })
  })

  describe('ValidationError', () => {
    it('should create a ValidationError', () => {
      const error = new ValidationError('email', 'Invalid email')
      
      expect(error.name).toBe('ValidationError')
      expect(error.code).toBe(ERROR_CODES.VALIDATION_ERROR)
      expect(error.field).toBe('email')
      expect(error.message).toBe('Invalid email')
    })
  })

  describe('AuthError', () => {
    it('should create an AuthError', () => {
      const error = new AuthError(ERROR_CODES.AUTH_UNAUTHORIZED, 'Not authorized')
      
      expect(error.name).toBe('AuthError')
      expect(error.code).toBe(ERROR_CODES.AUTH_UNAUTHORIZED)
      expect(error.message).toBe('Not authorized')
    })
  })

  describe('NetworkError', () => {
    it('should create a NetworkError', () => {
      const error = new NetworkError('Connection failed')
      
      expect(error.name).toBe('NetworkError')
      expect(error.code).toBe(ERROR_CODES.NETWORK_ERROR)
      expect(error.message).toBe('Connection failed')
    })
  })
})

describe('parseApiError', () => {
  it('should parse AppError instances', () => {
    const appError = new AppError(ERROR_CODES.AUTH_INVALID_CREDENTIALS, 'Invalid', 'email')
    const parsed = parseApiError(appError)
    
    expect(parsed).toEqual({
      code: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
      message: 'Invalid',
      field: 'email',
      details: undefined,
    })
  })

  it('should parse fetch errors', () => {
    const fetchError = new TypeError('fetch failed')
    const parsed = parseApiError(fetchError)
    
    expect(parsed.code).toBe(ERROR_CODES.NETWORK_ERROR)
    expect(parsed.message).toBe(ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR])
  })

  it('should parse Supabase auth errors', () => {
    const supabaseError = { code: 'invalid_credentials', message: 'Invalid login' }
    const parsed = parseApiError(supabaseError)
    
    expect(parsed.code).toBe(ERROR_CODES.AUTH_INVALID_CREDENTIALS)
    expect(parsed.message).toBe(ERROR_MESSAGES[ERROR_CODES.AUTH_INVALID_CREDENTIALS])
  })

  it('should parse HTTP status errors', () => {
    const httpError = { status: 404, message: 'Not found' }
    const parsed = parseApiError(httpError)
    
    expect(parsed.code).toBe(ERROR_CODES.NOT_FOUND)
    expect(parsed.message).toBe('Not found')
  })

  it('should handle generic errors', () => {
    const genericError = new Error('Something went wrong')
    const parsed = parseApiError(genericError)
    
    expect(parsed.code).toBe(ERROR_CODES.INTERNAL_ERROR)
    expect(parsed.message).toBe('Something went wrong')
  })

  it('should handle unknown error types', () => {
    const unknownError = 'string error'
    const parsed = parseApiError(unknownError)
    
    expect(parsed.code).toBe(ERROR_CODES.INTERNAL_ERROR)
    expect(parsed.message).toBe(ERROR_MESSAGES[ERROR_CODES.INTERNAL_ERROR])
  })
})

describe('logError', () => {
  it('should log error with context', () => {
    const error = new Error('Test error')
    logError(error, 'TestContext')
    
    expect(mockConsoleError).toHaveBeenCalledWith(
      '[TestContext]',
      expect.objectContaining({
        code: ERROR_CODES.INTERNAL_ERROR,
        message: 'Test error',
        timestamp: expect.any(String),
      })
    )
  })

  it('should log error without context', () => {
    const error = new Error('Test error')
    logError(error)
    
    expect(mockConsoleError).toHaveBeenCalledWith(
      '[ERROR]',
      expect.objectContaining({
        code: ERROR_CODES.INTERNAL_ERROR,
        message: 'Test error',
      })
    )
  })
})

describe('withRetry', () => {
  it('should succeed on first attempt', async () => {
    const operation = vi.fn().mockResolvedValue('success')
    
    const result = await withRetry(operation, 3, 100)
    
    expect(result).toBe('success')
    expect(operation).toHaveBeenCalledTimes(1)
  })

  it('should retry on failure and eventually succeed', async () => {
    const operation = vi.fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValue('success')
    
    const result = await withRetry(operation, 3, 10)
    
    expect(result).toBe('success')
    expect(operation).toHaveBeenCalledTimes(3)
  })

  it('should not retry on auth errors', async () => {
    const authError = new AuthError(ERROR_CODES.AUTH_UNAUTHORIZED)
    const operation = vi.fn().mockRejectedValue(authError)
    
    await expect(withRetry(operation, 3, 10)).rejects.toThrow(authError)
    expect(operation).toHaveBeenCalledTimes(1)
  })

  it('should not retry on validation errors', async () => {
    const validationError = new ValidationError('email', 'Invalid email')
    const operation = vi.fn().mockRejectedValue(validationError)
    
    await expect(withRetry(operation, 3, 10)).rejects.toThrow(validationError)
    expect(operation).toHaveBeenCalledTimes(1)
  })

  it('should throw last error after max retries', async () => {
    const error = new NetworkError('Network failed')
    const operation = vi.fn().mockRejectedValue(error)
    
    await expect(withRetry(operation, 2, 10)).rejects.toThrow(error)
    expect(operation).toHaveBeenCalledTimes(2)
  })
})

describe('safeAsync', () => {
  it('should return data on success', async () => {
    const operation = vi.fn().mockResolvedValue('success')
    
    const result = await safeAsync(operation)
    
    expect(result).toEqual({ data: 'success' })
    expect(mockConsoleError).not.toHaveBeenCalled()
  })

  it('should return error on failure', async () => {
    const error = new Error('Operation failed')
    const operation = vi.fn().mockRejectedValue(error)
    
    const result = await safeAsync(operation)
    
    expect(result).toEqual({
      error: expect.objectContaining({
        code: ERROR_CODES.INTERNAL_ERROR,
        message: 'Operation failed',
      }),
      data: undefined,
    })
    expect(mockConsoleError).toHaveBeenCalled()
  })

  it('should return fallback data on failure', async () => {
    const error = new Error('Operation failed')
    const operation = vi.fn().mockRejectedValue(error)
    const fallback = 'fallback'
    
    const result = await safeAsync(operation, fallback)
    
    expect(result).toEqual({
      error: expect.objectContaining({
        code: ERROR_CODES.INTERNAL_ERROR,
        message: 'Operation failed',
      }),
      data: fallback,
    })
  })
})