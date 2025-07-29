// Error monitoring and reporting utilities

import { parseApiError, logError, ApiError } from './errors'

export interface ErrorReport {
  id: string
  timestamp: Date
  error: ApiError
  context?: string
  userId?: string
  userAgent?: string
  url?: string
  stack?: string
  additionalData?: Record<string, any>
}

export interface ErrorMonitoringConfig {
  enableConsoleLogging: boolean
  enableRemoteReporting: boolean
  enableLocalStorage: boolean
  maxStoredErrors: number
  reportingEndpoint?: string
  apiKey?: string
}

class ErrorMonitor {
  private config: ErrorMonitoringConfig
  private errorQueue: ErrorReport[] = []
  private isOnline = true

  constructor(config: Partial<ErrorMonitoringConfig> = {}) {
    this.config = {
      enableConsoleLogging: true,
      enableRemoteReporting: false,
      enableLocalStorage: true,
      maxStoredErrors: 100,
      ...config
    }

    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true
        this.flushErrorQueue()
      })
      
      window.addEventListener('offline', () => {
        this.isOnline = false
      })

      // Load stored errors from localStorage
      this.loadStoredErrors()
    }
  }

  /**
   * Report an error with context
   */
  reportError(
    error: any,
    context?: string,
    additionalData?: Record<string, any>
  ): string {
    const parsedError = parseApiError(error)
    const errorId = this.generateErrorId()
    
    const errorReport: ErrorReport = {
      id: errorId,
      timestamp: new Date(),
      error: parsedError,
      context,
      userId: this.getCurrentUserId(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      stack: error?.stack,
      additionalData
    }

    // Console logging
    if (this.config.enableConsoleLogging) {
      logError(error, context)
    }

    // Store locally if enabled
    if (this.config.enableLocalStorage) {
      this.storeErrorLocally(errorReport)
    }

    // Queue for remote reporting
    if (this.config.enableRemoteReporting) {
      this.queueErrorForReporting(errorReport)
    }

    return errorId
  }

  /**
   * Report a performance issue
   */
  reportPerformanceIssue(
    operation: string,
    duration: number,
    threshold: number,
    additionalData?: Record<string, any>
  ) {
    if (duration > threshold) {
      this.reportError(
        new Error(`Performance issue: ${operation} took ${duration}ms (threshold: ${threshold}ms)`),
        'Performance',
        {
          operation,
          duration,
          threshold,
          ...additionalData
        }
      )
    }
  }

  /**
   * Get stored error reports
   */
  getStoredErrors(): ErrorReport[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem('error_reports')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  /**
   * Clear stored errors
   */
  clearStoredErrors() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('error_reports')
    }
    this.errorQueue = []
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    total: number
    byCode: Record<string, number>
    byContext: Record<string, number>
    recent: ErrorReport[]
  } {
    const errors = this.getStoredErrors()
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    
    const byCode: Record<string, number> = {}
    const byContext: Record<string, number> = {}
    const recent: ErrorReport[] = []

    errors.forEach(report => {
      // Count by error code
      byCode[report.error.code] = (byCode[report.error.code] || 0) + 1
      
      // Count by context
      if (report.context) {
        byContext[report.context] = (byContext[report.context] || 0) + 1
      }
      
      // Recent errors (last hour)
      if (new Date(report.timestamp) > oneHourAgo) {
        recent.push(report)
      }
    })

    return {
      total: errors.length,
      byCode,
      byContext,
      recent: recent.slice(0, 10) // Last 10 recent errors
    }
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  private getCurrentUserId(): string | undefined {
    // In a real app, this would get the current user ID from auth context
    if (typeof window !== 'undefined') {
      try {
        const user = localStorage.getItem('user')
        return user ? JSON.parse(user).id : undefined
      } catch {
        return undefined
      }
    }
    return undefined
  }

  private storeErrorLocally(errorReport: ErrorReport) {
    if (typeof window === 'undefined') return

    try {
      const stored = this.getStoredErrors()
      stored.push(errorReport)
      
      // Keep only the most recent errors
      const trimmed = stored.slice(-this.config.maxStoredErrors)
      
      localStorage.setItem('error_reports', JSON.stringify(trimmed))
    } catch (error) {
      console.warn('Failed to store error locally:', error)
    }
  }

  private loadStoredErrors() {
    const stored = this.getStoredErrors()
    this.errorQueue = stored.filter(report => 
      this.config.enableRemoteReporting && 
      !report.additionalData?.reported
    )
  }

  private queueErrorForReporting(errorReport: ErrorReport) {
    this.errorQueue.push(errorReport)
    
    if (this.isOnline) {
      this.flushErrorQueue()
    }
  }

  private async flushErrorQueue() {
    if (!this.config.enableRemoteReporting || !this.config.reportingEndpoint) {
      return
    }

    const errorsToReport = [...this.errorQueue]
    this.errorQueue = []

    for (const errorReport of errorsToReport) {
      try {
        await this.sendErrorReport(errorReport)
        
        // Mark as reported in local storage
        this.markErrorAsReported(errorReport.id)
      } catch (error) {
        // Re-queue if reporting fails
        this.errorQueue.push(errorReport)
        console.warn('Failed to report error:', error)
      }
    }
  }

  private async sendErrorReport(errorReport: ErrorReport) {
    if (!this.config.reportingEndpoint) return

    const response = await fetch(this.config.reportingEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
      },
      body: JSON.stringify(errorReport)
    })

    if (!response.ok) {
      throw new Error(`Failed to report error: ${response.status}`)
    }
  }

  private markErrorAsReported(errorId: string) {
    if (typeof window === 'undefined') return

    try {
      const stored = this.getStoredErrors()
      const updated = stored.map(report => 
        report.id === errorId 
          ? { ...report, additionalData: { ...report.additionalData, reported: true } }
          : report
      )
      
      localStorage.setItem('error_reports', JSON.stringify(updated))
    } catch (error) {
      console.warn('Failed to mark error as reported:', error)
    }
  }
}

// Global error monitor instance
export const errorMonitor = new ErrorMonitor({
  enableConsoleLogging: process.env.NODE_ENV === 'development',
  enableRemoteReporting: process.env.NODE_ENV === 'production',
  enableLocalStorage: true,
  maxStoredErrors: 100,
  reportingEndpoint: process.env.NEXT_PUBLIC_ERROR_REPORTING_ENDPOINT,
  apiKey: process.env.NEXT_PUBLIC_ERROR_REPORTING_API_KEY
})

// Performance monitoring wrapper
export function withPerformanceMonitoring<T extends (...args: any[]) => any>(
  fn: T,
  operationName: string,
  threshold: number = 1000
): T {
  return ((...args: any[]) => {
    const startTime = performance.now()
    
    try {
      const result = fn(...args)
      
      // Handle async functions
      if (result instanceof Promise) {
        return result.finally(() => {
          const duration = performance.now() - startTime
          errorMonitor.reportPerformanceIssue(operationName, duration, threshold)
        })
      }
      
      // Handle sync functions
      const duration = performance.now() - startTime
      errorMonitor.reportPerformanceIssue(operationName, duration, threshold)
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      errorMonitor.reportError(error, `Performance:${operationName}`, { duration })
      throw error
    }
  }) as T
}

// React hook for error monitoring
export function useErrorMonitoring() {
  const reportError = (error: any, context?: string, additionalData?: Record<string, any>) => {
    return errorMonitor.reportError(error, context, additionalData)
  }

  const getErrorStats = () => {
    return errorMonitor.getErrorStats()
  }

  const clearErrors = () => {
    errorMonitor.clearStoredErrors()
  }

  return {
    reportError,
    getErrorStats,
    clearErrors
  }
}

// Global error handlers for unhandled errors
if (typeof window !== 'undefined') {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorMonitor.reportError(
      event.reason,
      'UnhandledPromiseRejection',
      { 
        promise: event.promise,
        url: window.location.href
      }
    )
  })

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    errorMonitor.reportError(
      event.error || new Error(event.message),
      'UncaughtError',
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        url: window.location.href
      }
    )
  })
}