import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary, AsyncErrorBoundary, withErrorBoundary } from '../error-boundary'

// Mock console.error to avoid noise in tests
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

beforeEach(() => {
  mockConsoleError.mockClear()
})

// Test component that throws an error
function ThrowError({ shouldThrow = false }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

// Test component for async errors
function AsyncThrowError({ shouldThrow = false }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    // Simulate unhandled promise rejection
    Promise.reject(new Error('Async test error'))
  }
  return <div>No async error</div>
}

describe('ErrorBoundary', () => {
  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )

    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('should render error UI when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('An unexpected error occurred. We apologize for the inconvenience.')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
    expect(screen.getByText('Go Home')).toBeInTheDocument()
  })

  it('should render custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error message')).toBeInTheDocument()
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
  })

  it('should call onError callback when error occurs', () => {
    const onError = vi.fn()

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    )
  })

  it('should retry when Try Again button is clicked', () => {
    let shouldThrow = true
    
    function DynamicThrowError() {
      if (shouldThrow) {
        throw new Error('Test error')
      }
      return <div>No error</div>
    }

    const { rerender } = render(
      <ErrorBoundary>
        <DynamicThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    // Change the error condition
    shouldThrow = false

    fireEvent.click(screen.getByText('Try Again'))

    // Rerender with the same component but different behavior
    rerender(
      <ErrorBoundary>
        <DynamicThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('should show error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Error Details (Development Only):')).toBeInTheDocument()
    expect(screen.getByText('Test error')).toBeInTheDocument()

    process.env.NODE_ENV = originalEnv
  })

  it('should log errors', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(mockConsoleError).toHaveBeenCalledWith(
      '[ErrorBoundary]',
      expect.objectContaining({
        code: 'INTERNAL_ERROR',
        message: 'Test error',
      })
    )
  })
})

describe('AsyncErrorBoundary', () => {
  it('should render children when no error occurs', () => {
    render(
      <AsyncErrorBoundary>
        <AsyncThrowError shouldThrow={false} />
      </AsyncErrorBoundary>
    )

    expect(screen.getByText('No async error')).toBeInTheDocument()
  })

  it('should render error UI when sync error occurs', () => {
    render(
      <AsyncErrorBoundary>
        <ThrowError shouldThrow={true} />
      </AsyncErrorBoundary>
    )

    expect(screen.getByText('Error Loading Content')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong while loading this content.')).toBeInTheDocument()
    expect(screen.getByText('Retry')).toBeInTheDocument()
  })

  it('should render custom fallback when provided', () => {
    const customFallback = <div>Custom async error</div>

    render(
      <AsyncErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </AsyncErrorBoundary>
    )

    expect(screen.getByText('Custom async error')).toBeInTheDocument()
  })

  it('should retry when Retry button is clicked', () => {
    let shouldThrow = true
    
    function DynamicThrowError() {
      if (shouldThrow) {
        throw new Error('Test error')
      }
      return <div>No error</div>
    }

    const { rerender } = render(
      <AsyncErrorBoundary>
        <DynamicThrowError />
      </AsyncErrorBoundary>
    )

    expect(screen.getByText('Error Loading Content')).toBeInTheDocument()

    // Change the error condition
    shouldThrow = false

    fireEvent.click(screen.getByText('Retry'))

    // Rerender with the same component but different behavior
    rerender(
      <AsyncErrorBoundary>
        <DynamicThrowError />
      </AsyncErrorBoundary>
    )

    expect(screen.getByText('No error')).toBeInTheDocument()
  })
})

describe('withErrorBoundary', () => {
  it('should wrap component with error boundary', () => {
    const TestComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
      if (shouldThrow) {
        throw new Error('HOC test error')
      }
      return <div>HOC component</div>
    }

    const WrappedComponent = withErrorBoundary(TestComponent)

    render(<WrappedComponent shouldThrow={false} />)
    expect(screen.getByText('HOC component')).toBeInTheDocument()

    const { rerender } = render(<WrappedComponent shouldThrow={true} />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('should use custom fallback in HOC', () => {
    const TestComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
      if (shouldThrow) {
        throw new Error('HOC test error')
      }
      return <div>HOC component</div>
    }

    const customFallback = <div>HOC custom error</div>
    const WrappedComponent = withErrorBoundary(TestComponent, customFallback)

    render(<WrappedComponent shouldThrow={true} />)
    expect(screen.getByText('HOC custom error')).toBeInTheDocument()
  })

  it('should call custom onError in HOC', () => {
    const TestComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
      if (shouldThrow) {
        throw new Error('HOC test error')
      }
      return <div>HOC component</div>
    }

    const onError = vi.fn()
    const WrappedComponent = withErrorBoundary(TestComponent, undefined, onError)

    render(<WrappedComponent shouldThrow={true} />)
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    )
  })
})