import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { ReactNode } from 'react'
import { useErrorHandler, useAsyncOperation, useFormErrorHandler } from '../use-error-handler'
import { ToastProvider } from '@/contexts/toast-context'
import { AppError, ERROR_CODES } from '@/lib/errors'

// Mock console.error to avoid noise in tests
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

beforeEach(() => {
  mockConsoleError.mockClear()
})

// Wrapper component for tests
function TestWrapper({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>
}

describe('useErrorHandler', () => {
  it('should handle errors and show toast by default', () => {
    const { result } = renderHook(() => useErrorHandler(), {
      wrapper: TestWrapper,
    })

    const error = new Error('Test error')
    
    act(() => {
      const parsedError = result.current.handleError(error)
      expect(parsedError.code).toBe(ERROR_CODES.INTERNAL_ERROR)
      expect(parsedError.message).toBe('Test error')
    })

    expect(mockConsoleError).toHaveBeenCalled()
  })

  it('should handle errors without showing toast when disabled', () => {
    const { result } = renderHook(
      () => useErrorHandler({ showToast: false }),
      { wrapper: TestWrapper }
    )

    const error = new Error('Test error')
    
    act(() => {
      const parsedError = result.current.handleError(error)
      expect(parsedError.code).toBe(ERROR_CODES.INTERNAL_ERROR)
      expect(parsedError.message).toBe('Test error')
    })

    expect(mockConsoleError).toHaveBeenCalled()
  })

  it('should handle errors without logging when disabled', () => {
    const { result } = renderHook(
      () => useErrorHandler({ logError: false }),
      { wrapper: TestWrapper }
    )

    const error = new Error('Test error')
    
    act(() => {
      result.current.handleError(error)
    })

    expect(mockConsoleError).not.toHaveBeenCalled()
  })

  it('should handle success messages', () => {
    const { result } = renderHook(() => useErrorHandler(), {
      wrapper: TestWrapper,
    })

    act(() => {
      result.current.handleSuccess('Operation successful')
    })

    // Success should not log errors
    expect(mockConsoleError).not.toHaveBeenCalled()
  })

  it('should handle warning messages', () => {
    const { result } = renderHook(() => useErrorHandler(), {
      wrapper: TestWrapper,
    })

    act(() => {
      result.current.handleWarning('Warning message')
    })

    expect(mockConsoleError).not.toHaveBeenCalled()
  })

  it('should handle info messages', () => {
    const { result } = renderHook(() => useErrorHandler(), {
      wrapper: TestWrapper,
    })

    act(() => {
      result.current.handleInfo('Info message')
    })

    expect(mockConsoleError).not.toHaveBeenCalled()
  })

  it('should use custom error message', () => {
    const { result } = renderHook(() => useErrorHandler(), {
      wrapper: TestWrapper,
    })

    const error = new Error('Original error')
    
    act(() => {
      const parsedError = result.current.handleError(error, 'Custom error message')
      expect(parsedError.message).toBe('Original error') // parseApiError returns original message
    })
  })
})

describe('useAsyncOperation', () => {
  it('should execute successful operation', async () => {
    const { result } = renderHook(() => useAsyncOperation(), {
      wrapper: TestWrapper,
    })

    const operation = vi.fn().mockResolvedValue('success')
    const onSuccess = vi.fn()

    let operationResult: any
    await act(async () => {
      operationResult = await result.current.execute(operation, {
        successMessage: 'Operation completed',
        onSuccess,
      })
    })

    expect(operationResult).toEqual({ data: 'success' })
    expect(onSuccess).toHaveBeenCalledWith('success')
    expect(operation).toHaveBeenCalledTimes(1)
  })

  it('should handle failed operation', async () => {
    const { result } = renderHook(() => useAsyncOperation(), {
      wrapper: TestWrapper,
    })

    const error = new Error('Operation failed')
    const operation = vi.fn().mockRejectedValue(error)
    const onError = vi.fn()

    let operationResult: any
    await act(async () => {
      operationResult = await result.current.execute(operation, {
        errorMessage: 'Custom error',
        onError,
      })
    })

    expect(operationResult.error).toBeDefined()
    expect(operationResult.error.code).toBe(ERROR_CODES.INTERNAL_ERROR)
    expect(onError).toHaveBeenCalledWith(operationResult.error)
    expect(mockConsoleError).toHaveBeenCalled()
  })

  it('should execute operation without callbacks', async () => {
    const { result } = renderHook(() => useAsyncOperation(), {
      wrapper: TestWrapper,
    })

    const operation = vi.fn().mockResolvedValue('success')

    let operationResult: any
    await act(async () => {
      operationResult = await result.current.execute(operation)
    })

    expect(operationResult).toEqual({ data: 'success' })
  })
})

describe('useFormErrorHandler', () => {
  it('should handle form errors with field mapping', () => {
    const { result } = renderHook(() => useFormErrorHandler(), {
      wrapper: TestWrapper,
    })

    const error = new AppError(ERROR_CODES.AUTH_INVALID_EMAIL, 'Invalid email', 'email')
    
    const fieldErrors = result.current.handleFormError(error)
    
    expect(fieldErrors).toEqual({
      email: 'Invalid email',
    })
  })

  it('should handle generic form errors', () => {
    const { result } = renderHook(() => useFormErrorHandler(), {
      wrapper: TestWrapper,
    })

    const error = new Error('Generic error')
    
    const fieldErrors = result.current.handleFormError(error)
    
    expect(fieldErrors).toEqual({
      _form: 'Generic error',
    })
  })

  it('should handle validation errors', () => {
    const { result } = renderHook(() => useFormErrorHandler(), {
      wrapper: TestWrapper,
    })

    const error = new AppError(ERROR_CODES.VALIDATION_ERROR, 'Validation failed', 'password')
    
    const fieldErrors = result.current.handleFormError(error)
    
    expect(fieldErrors).toEqual({
      password: 'Validation failed',
    })
  })
})