import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider } from '@/contexts/auth-context'
import { ToastProvider } from '@/contexts/toast-context'
import { LoginForm } from '@/components/auth/login-form'
import { RegisterForm } from '@/components/auth/register-form'
import { vi } from 'vitest'

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn()
  })),
  useSearchParams: vi.fn(() => ({
    get: vi.fn().mockReturnValue(null)
  })),
  usePathname: vi.fn(() => '/login')
}))

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>
    <AuthProvider>
      {children}
    </AuthProvider>
  </ToastProvider>
)

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('User Registration Flow', () => {
    it('should register a new user successfully', async () => {
      const user = userEvent.setup()
      const { supabase } = await import('@/lib/supabase')
      
      // Mock successful registration
      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
        data: {
          user: {
            id: '123',
            email: 'test@example.com',
            user_metadata: { name: 'Test User' }
          },
          session: null
        },
        error: null
      })

      render(
        <TestWrapper>
          <RegisterForm />
        </TestWrapper>
      )

      // Fill out registration form
      await user.type(screen.getByLabelText(/full name/i), 'Test User')
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      // Verify Supabase was called with correct data
      await waitFor(() => {
        expect(supabase.auth.signUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          options: {
            data: {
              name: 'Test User'
            }
          }
        })
      })
    })

    it('should handle registration errors', async () => {
      const user = userEvent.setup()
      const { supabase } = await import('@/lib/supabase')
      
      // Mock registration error
      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'Email already registered' }
      })

      render(
        <TestWrapper>
          <RegisterForm />
        </TestWrapper>
      )

      // Fill out registration form
      await user.type(screen.getByLabelText(/full name/i), 'Test User')
      await user.type(screen.getByLabelText(/email/i), 'existing@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      // Verify error is displayed
      await waitFor(() => {
        expect(screen.getByText('Email already registered')).toBeInTheDocument()
      })
    })
  })

  describe('User Login Flow', () => {
    it('should login user successfully', async () => {
      const user = userEvent.setup()
      const { supabase } = await import('@/lib/supabase')
      
      // Mock successful login
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: {
          user: {
            id: '123',
            email: 'test@example.com',
            user_metadata: { name: 'Test User' }
          },
          session: {
            access_token: 'token',
            refresh_token: 'refresh',
            expires_in: 3600,
            token_type: 'bearer',
            user: {
              id: '123',
              email: 'test@example.com'
            }
          }
        },
        error: null
      })

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      )

      // Fill out login form
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')

      // Submit form
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      // Verify Supabase was called with correct credentials
      await waitFor(() => {
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123'
        })
      })
    })

    it('should handle login errors', async () => {
      const user = userEvent.setup()
      const { supabase } = await import('@/lib/supabase')
      
      // Mock login error
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' }
      })

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      )

      // Fill out login form
      await user.type(screen.getByLabelText(/email/i), 'wrong@example.com')
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword')

      // Submit form
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      // Verify error is displayed
      await waitFor(() => {
        expect(screen.getByText('Invalid login credentials')).toBeInTheDocument()
      })
    })
  })

  describe('Form Validation Integration', () => {
    it('should validate registration form fields', async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <RegisterForm />
        </TestWrapper>
      )

      // Try to submit empty form
      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      // Verify validation errors
      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument()
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
        expect(screen.getByText(/password is required/i)).toBeInTheDocument()
      })
    })

    it('should validate login form fields', async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      )

      // Try to submit empty form
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      // Verify validation errors
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
        expect(screen.getByText(/password is required/i)).toBeInTheDocument()
      })
    })

    it('should validate email format', async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      )

      // Enter invalid email
      await user.type(screen.getByLabelText(/email/i), 'invalid-email')
      await user.type(screen.getByLabelText(/password/i), 'password123')

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      // Verify email validation error
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
      })
    })
  })
})