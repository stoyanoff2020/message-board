import { useCallback } from 'react'
import { useToast } from '@/contexts/toast-context'
import { parseApiError, logError, ApiError } from '@/lib/errors'
import { errorMonitor } from '@/lib/error-monitoring'

export interface UseErrorHandlerOptions {
  showToast?: boolean
  logError?: boolean
  context?: string
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { showToast = true, logError: shouldLog = true, context } = options
  const toast = useToast()

  const handleError = useCallback((error: any, customMessage?: string) => {
    const parsedError = parseApiError(error)
    
    // Report to error monitoring system
    errorMonitor.reportError(error, context, {
      customMessage,
      showToast,
      shouldLog
    })
    
    // Log error if enabled (error monitoring also logs, but this provides immediate feedback)
    if (shouldLog) {
      logError(error, context)
    }

    // Show toast notification if enabled
    if (showToast) {
      const message = customMessage || parsedError.message
      toast.error(message, 'Error')
    }

    return parsedError
  }, [toast, showToast, shouldLog, context])

  const handleSuccess = useCallback((message: string, title?: string) => {
    if (showToast) {
      toast.success(message, title)
    }
  }, [toast, showToast])

  const handleWarning = useCallback((message: string, title?: string) => {
    if (showToast) {
      toast.warning(message, title)
    }
  }, [toast, showToast])

  const handleInfo = useCallback((message: string, title?: string) => {
    if (showToast) {
      toast.info(message, title)
    }
  }, [toast, showToast])

  return {
    handleError,
    handleSuccess,
    handleWarning,
    handleInfo,
  }
}

// Hook for handling async operations with error handling
export function useAsyncOperation<T = any>() {
  const { handleError, handleSuccess } = useErrorHandler()

  const execute = useCallback(async (
    operation: () => Promise<T>,
    options: {
      successMessage?: string
      errorMessage?: string
      onSuccess?: (data: T) => void
      onError?: (error: ApiError) => void
    } = {}
  ): Promise<{ data?: T; error?: ApiError }> => {
    try {
      const data = await operation()
      
      if (options.successMessage) {
        handleSuccess(options.successMessage)
      }
      
      options.onSuccess?.(data)
      
      return { data }
    } catch (error) {
      const parsedError = handleError(error, options.errorMessage)
      options.onError?.(parsedError)
      return { error: parsedError }
    }
  }, [handleError, handleSuccess])

  return { execute }
}

// Hook for form error handling
export function useFormErrorHandler() {
  const { handleError } = useErrorHandler({ showToast: false })

  const handleFormError = useCallback((error: any): Record<string, string> => {
    const parsedError = parseApiError(error)
    const fieldErrors: Record<string, string> = {}

    // Handle validation errors with field mapping
    if (parsedError.field) {
      fieldErrors[parsedError.field] = parsedError.message
    } else {
      // Generic form error
      fieldErrors._form = parsedError.message
    }

    return fieldErrors
  }, [handleError])

  return { handleFormError }
}