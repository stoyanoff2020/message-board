import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import { LoginForm } from '../login-form'
import { useAuth } from '@/contexts/auth-context'
import { vi } from 'vitest'

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn()
}))

// Mock auth context
vi.mock('@/contexts/auth-context', () => ({
  useAuth: vi.fn()
}))

// Mock toast context
vi.mock('@/contexts/toast-context', () => ({
  useToast: vi.fn(() => ({
    showToast: vi.fn()
  }))
}))

const mockPush = vi.fn()
const mockUseRouter = useRouter as any
const mockUseSearchParams = vi.fn()
const mockUseAuth = useAuth as any

describe('LoginForm', () => {
  const mockLogin = vi.fn()
  const mockClearError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseRouter.mockReturnValue({ push: mockPush })
    mockUseSearchParams.mockReturnValue({
      get: vi.fn().mockReturnValue(null)
    })
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: mockClearError
    })
  })

  it('renders login form fields correctly', () => {
    render(<LoginForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument()
    expect(screen.getByText(/sign up/i)).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid email format', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'invalid-email')

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for short password', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const passwordInput = screen.getByLabelText(/password/i)
    await user.type(passwordInput, '123')

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid credentials', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValueOnce(undefined)

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('redirects to home after successful login', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValueOnce(undefined)

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('redirects to return URL after successful login', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValueOnce(undefined)

    // Mock URL search params
    Object.defineProperty(window, 'location', {
      value: {
        search: '?returnUrl=%2Fadmin'
      },
      writable: true
    })

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin')
    })
  })

  it('displays authentication error from context', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: 'Invalid credentials',
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: mockClearError
    })

    render(<LoginForm />)

    expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
  })

  it('clears error when form is submitted', async () => {
    const user = userEvent.setup()
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: 'Previous error',
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: mockClearError
    })

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)

    expect(mockClearError).toHaveBeenCalled()
  })

  it('shows loading state during authentication', async () => {
    const user = userEvent.setup()
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      error: null,
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: mockClearError
    })

    render(<LoginForm />)

    const submitButton = screen.getByRole('button', { name: /signing in/i })
    expect(submitButton).toBeDisabled()
  })

  it('navigates to register page when sign up link is clicked', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const signUpLink = screen.getByText(/sign up/i)
    await user.click(signUpLink)

    expect(mockPush).toHaveBeenCalledWith('/register')
  })

  it('handles login error gracefully', async () => {
    const user = userEvent.setup()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockLogin.mockRejectedValueOnce(new Error('Login failed'))

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Login error:', expect.any(Error))
    })

    consoleSpy.mockRestore()
  })

  it('prevents form submission when already loading', async () => {
    const user = userEvent.setup()
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      error: null,
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: mockClearError
    })

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    const submitButton = screen.getByRole('button', { name: /signing in/i })
    await user.click(submitButton)

    // Login should not be called when already loading
    expect(mockLogin).not.toHaveBeenCalled()
  })
})