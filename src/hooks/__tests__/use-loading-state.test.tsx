import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { useLoadingState, useMultipleLoadingStates, useDebouncedLoadingState } from '../use-loading-state'
import { ToastProvider } from '@/contexts/toast-context'

// Mock console.error to avoid noise in tests
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

beforeEach(() => {
  mockConsoleError.mockClear()
})

// Wrapper component for tests
function TestWrapper({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>
}

describe('useLoadingState', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useLoadingState(), {
      wrapper: TestWrapper
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.data).toBe(null)
  })

  it('should initialize with custom loading state', () => {
    const { result } = renderHook(() => useLoadingState({ initialLoading: true }), {
      wrapper: TestWrapper
    })

    expect(result.current.isLoading).toBe(true)
  })

  it('should execute successful operation', async () => {
    const { result } = renderHook(() => useLoadingState<string>(), {
      wrapper: TestWrapper
    })

    const mockOperation = vi.fn().mockResolvedValue('success')
    const onSuccess = vi.fn()

    let executeResult: any
    await act(async () => {
      executeResult = await result.current.execute(mockOperation, {
        successMessage: 'Operation completed',
        onSuccess
      })
    })

    expect(executeResult).toEqual({ data: 'success' })
    expect(result.current.data).toBe('success')
    expect(result.current.error).toBe(null)
    expect(result.current.isLoading).toBe(false)
    expect(onSuccess).toHaveBeenCalledWith('success')
    expect(mockOperation).toHaveBeenCalledWith(expect.any(AbortSignal))
  })

  it('should handle operation errors', async () => {
    const { result } = renderHook(() => useLoadingState(), {
      wrapper: TestWrapper
    })

    const error = new Error('Operation failed')
    const mockOperation = vi.fn().mockRejectedValue(error)
    const onError = vi.fn()

    let executeResult: any
    await act(async () => {
      executeResult = await result.current.execute(mockOperation, {
        errorMessage: 'Custom error message',
        onError
      })
    })

    expect(executeResult.error).toBeDefined()
    expect(result.current.data).toBe(null)
    expect(result.current.error).toBe('Operation failed')
    expect(result.current.isLoading).toBe(false)
    expect(onError).toHaveBeenCalledWith(error)
  })

  it('should handle operation cancellation', async () => {
    const { result } = renderHook(() => useLoadingState(), {
      wrapper: TestWrapper
    })

    const mockOperation = vi.fn().mockImplementation(
      (signal: AbortSignal) => new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => {
          const error = new Error('Aborted')
          error.name = 'AbortError'
          reject(error)
        })
        setTimeout(() => resolve('success'), 1000)
      })
    )

    // Start operation
    const executePromise = act(async () => {
      return result.current.execute(mockOperation)
    })

    // Reset (which should cancel the operation)
    act(() => {
      result.current.reset()
    })

    const executeResult = await executePromise

    expect(executeResult.error).toBe('Operation was cancelled')
    expect(result.current.isLoading).toBe(false)
  })

  it('should reset state', () => {
    const { result } = renderHook(() => useLoadingState(), {
      wrapper: TestWrapper
    })

    // Set some state
    act(() => {
      result.current.setLoading(true)
      result.current.setError('Some error')
      result.current.setData('Some data')
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.error).toBe('Some error')
    expect(result.current.data).toBe('Some data')

    // Reset
    act(() => {
      result.current.reset()
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.data).toBe(null)
  })

  it('should allow manual state updates', () => {
    const { result } = renderHook(() => useLoadingState(), {
      wrapper: TestWrapper
    })

    act(() => {
      result.current.setLoading(true)
      result.current.setError('Manual error')
      result.current.setData('Manual data')
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.error).toBe('Manual error')
    expect(result.current.data).toBe('Manual data')
  })

  it('should not reset data when resetOnStart is false', async () => {
    const { result } = renderHook(() => useLoadingState<string>(), {
      wrapper: TestWrapper
    })

    // Set initial data
    act(() => {
      result.current.setData('initial data')
    })

    const mockOperation = vi.fn().mockResolvedValue('new data')

    await act(async () => {
      await result.current.execute(mockOperation, { resetOnStart: false })
    })

    expect(result.current.data).toBe('new data')
  })
})

describe('useMultipleLoadingStates', () => {
  it('should manage multiple loading states', () => {
    const { result } = renderHook(() => useMultipleLoadingStates())

    expect(result.current.isAnyLoading).toBe(false)
    expect(result.current.hasAnyError).toBe(false)

    act(() => {
      result.current.setLoading('operation1', true)
      result.current.setLoading('operation2', false)
    })

    expect(result.current.isLoading('operation1')).toBe(true)
    expect(result.current.isLoading('operation2')).toBe(false)
    expect(result.current.isAnyLoading).toBe(true)
  })

  it('should manage multiple error states', () => {
    const { result } = renderHook(() => useMultipleLoadingStates())

    act(() => {
      result.current.setError('operation1', 'Error 1')
      result.current.setError('operation2', 'Error 2')
    })

    expect(result.current.getError('operation1')).toBe('Error 1')
    expect(result.current.getError('operation2')).toBe('Error 2')
    expect(result.current.hasAnyError).toBe(true)
  })

  it('should clear individual errors', () => {
    const { result } = renderHook(() => useMultipleLoadingStates())

    act(() => {
      result.current.setError('operation1', 'Error 1')
      result.current.setError('operation2', 'Error 2')
    })

    act(() => {
      result.current.clearError('operation1')
    })

    expect(result.current.getError('operation1')).toBe(null)
    expect(result.current.getError('operation2')).toBe('Error 2')
    expect(result.current.hasAnyError).toBe(true)
  })

  it('should clear all errors', () => {
    const { result } = renderHook(() => useMultipleLoadingStates())

    act(() => {
      result.current.setError('operation1', 'Error 1')
      result.current.setError('operation2', 'Error 2')
    })

    act(() => {
      result.current.clearAllErrors()
    })

    expect(result.current.getError('operation1')).toBe(null)
    expect(result.current.getError('operation2')).toBe(null)
    expect(result.current.hasAnyError).toBe(false)
  })
})

describe('useDebouncedLoadingState', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should debounce loading state', async () => {
    const { result } = renderHook(() => useDebouncedLoadingState(300), {
      wrapper: TestWrapper
    })

    expect(result.current.debouncedLoading).toBe(false)

    const mockOperation = vi.fn().mockResolvedValue('success')

    // Start operation
    act(() => {
      result.current.execute(mockOperation)
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.debouncedLoading).toBe(false)

    // Fast forward past debounce time
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current.debouncedLoading).toBe(true)

    // Wait for operation to complete
    await act(async () => {
      await vi.runAllTimersAsync()
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.debouncedLoading).toBe(false)
  })

  it('should not show debounced loading for quick operations', async () => {
    const { result } = renderHook(() => useDebouncedLoadingState(300), {
      wrapper: TestWrapper
    })

    const mockOperation = vi.fn().mockResolvedValue('success')

    await act(async () => {
      await result.current.execute(mockOperation)
    })

    expect(result.current.debouncedLoading).toBe(false)
  })
})