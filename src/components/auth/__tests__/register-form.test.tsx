import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import { RegisterForm } from '../register-form'
import { useAuth } from '@/contexts/auth-context'
import { vi } from 'vitest'

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn()
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
const mockUseAuth = useAuth as any

describe('RegisterForm', () => {
  const mockRegister = vi.fn()
  const mockClearError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseRouter.mockReturnValue({ push: mockPush })
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      login: vi.fn(),
      register: mockRegister,
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: mockClearError
    })
  })

  it('renders register form fields correctly', () => {
    render(<RegisterForm />)

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument()
    expect(screen.getByText(/sign in/i)).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for short name', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    const nameInput = screen.getByLabelText(/full name/i)
    await user.type(nameInput, 'Jo')

    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/name must be at least 3 characters/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid email format', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'invalid-email')

    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for short password', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    const passwordInput = screen.getByLabelText(/password/i)
    await user.type(passwordInput, '123')

    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    mockRegister.mockResolvedValueOnce(undefined)

    render(<RegisterForm />)

    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('john@example.com', 'password123', 'John Doe')
    })
  })

  it('redirects to home after successful registration', async () => {
    const user = userEvent.setup()
    mockRegister.mockResolvedValueOnce(undefined)

    render(<RegisterForm />)

    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('displays registration error from context', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: 'Email already exists',
      login: vi.fn(),
      register: mockRegister,
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: mockClearError
    })

    render(<RegisterForm />)

    expect(screen.getByText('Email already exists')).toBeInTheDocument()
  })

  it('clears error when form is submitted', async () => {
    const user = userEvent.setup()
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: 'Previous error',
      login: vi.fn(),
      register: mockRegister,
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: mockClearError
    })

    render(<RegisterForm />)

    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)

    expect(mockClearError).toHaveBeenCalled()
  })

  it('shows loading state during registration', async () => {
    const user = userEvent.setup()
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      error: null,
      login: vi.fn(),
      register: mockRegister,
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: mockClearError
    })

    render(<RegisterForm />)

    const submitButton = screen.getByRole('button', { name: /creating account/i })
    expect(submitButton).toBeDisabled()
  })

  it('navigates to login page when sign in link is clicked', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    const signInLink = screen.getByText(/sign in/i)
    await user.click(signInLink)

    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('handles registration error gracefully', async () => {
    const user = userEvent.setup()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockRegister.mockRejectedValueOnce(new Error('Registration failed'))

    render(<RegisterForm />)

    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Registration error:', expect.any(Error))
    })

    consoleSpy.mockRestore()
  })

  it('prevents form submission when already loading', async () => {
    const user = userEvent.setup()
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      error: null,
      login: vi.fn(),
      register: mockRegister,
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: mockClearError
    })

    render(<RegisterForm />)

    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    const submitButton = screen.getByRole('button', { name: /creating account/i })
    await user.click(submitButton)

    // Register should not be called when already loading
    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('trims whitespace from name input', async () => {
    const user = userEvent.setup()
    mockRegister.mockResolvedValueOnce(undefined)

    render(<RegisterForm />)

    await user.type(screen.getByLabelText(/full name/i), '  John Doe  ')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('john@example.com', 'password123', 'John Doe')
    })
  })
})