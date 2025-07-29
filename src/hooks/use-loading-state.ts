import { useState, useCallback, useRef, useEffect } from 'react'
import { useErrorHandler } from './use-error-handler'

export interface LoadingState {
  isLoading: boolean
  error: string | null
  data: any
}

export interface UseLoadingStateOptions {
  initialLoading?: boolean
  showToast?: boolean
  context?: string
}

export function useLoadingState<T = any>(options: UseLoadingStateOptions = {}) {
  const { initialLoading = false, showToast = true, context } = options
  
  const [isLoading, setIsLoading] = useState(initialLoading)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<T | null>(null)
  
  const { handleError, handleSuccess } = useErrorHandler({ 
    showToast, 
    context: context || 'LoadingState' 
  })
  
  const abortControllerRef = useRef<AbortController | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const execute = useCallback(async <R = T>(
    operation: (signal?: AbortSignal) => Promise<R>,
    options: {
      successMessage?: string
      errorMessage?: string
      onSuccess?: (data: R) => void
      onError?: (error: any) => void
      resetOnStart?: boolean
    } = {}
  ): Promise<{ data?: R; error?: string }> => {
    const { 
      successMessage, 
      errorMessage, 
      onSuccess, 
      onError, 
      resetOnStart = true 
    } = options

    // Cancel previous operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    try {
      setIsLoading(true)
      
      if (resetOnStart) {
        setError(null)
        setData(null)
      }

      const result = await operation(signal)
      
      // Check if operation was aborted
      if (signal.aborted) {
        return { error: 'Operation was cancelled' }
      }

      setData(result as any)
      setError(null)
      
      if (successMessage) {
        handleSuccess(successMessage)
      }
      
      onSuccess?.(result)
      
      return { data: result }
    } catch (err: any) {
      // Don't handle aborted operations as errors
      if (signal.aborted || err.name === 'AbortError') {
        return { error: 'Operation was cancelled' }
      }

      const parsedError = handleError(err, errorMessage)
      setError(parsedError.message)
      setData(null)
      
      onError?.(err)
      
      return { error: parsedError.message }
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }, [handleError, handleSuccess])

  const reset = useCallback(() => {
    setIsLoading(false)
    setError(null)
    setData(null)
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  const setLoadingState = useCallback((loading: boolean) => {
    setIsLoading(loading)
  }, [])

  const setErrorState = useCallback((error: string | null) => {
    setError(error)
  }, [])

  const setDataState = useCallback((data: T | null) => {
    setData(data)
  }, [])

  return {
    isLoading,
    error,
    data,
    execute,
    reset,
    setLoading: setLoadingState,
    setError: setErrorState,
    setData: setDataState
  }
}

// Hook for managing multiple loading states
export function useMultipleLoadingStates() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<Record<string, string | null>>({})

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: loading }))
  }, [])

  const setError = useCallback((key: string, error: string | null) => {
    setErrors(prev => ({ ...prev, [key]: error }))
  }, [])

  const clearError = useCallback((key: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[key]
      return newErrors
    })
  }, [])

  const clearAllErrors = useCallback(() => {
    setErrors({})
  }, [])

  const isAnyLoading = Object.values(loadingStates).some(Boolean)
  const hasAnyError = Object.values(errors).some(Boolean)

  return {
    loadingStates,
    errors,
    setLoading,
    setError,
    clearError,
    clearAllErrors,
    isAnyLoading,
    hasAnyError,
    isLoading: (key: string) => loadingStates[key] || false,
    getError: (key: string) => errors[key] || null
  }
}

// Hook for debounced loading states (useful for search)
export function useDebouncedLoadingState<T = any>(
  debounceMs: number = 300,
  options: UseLoadingStateOptions = {}
) {
  const loadingState = useLoadingState<T>(options)
  const [debouncedLoading, setDebouncedLoading] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (loadingState.isLoading) {
      timeoutRef.current = setTimeout(() => {
        setDebouncedLoading(true)
      }, debounceMs)
    } else {
      setDebouncedLoading(false)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [loadingState.isLoading, debounceMs])

  return {
    ...loadingState,
    debouncedLoading
  }
}