import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MessageForm } from '../message-form'

// Mock the auth hook
const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  isAdmin: false,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
}

vi.mock('@/hooks/use-auth-hooks', () => ({
  useAuth: vi.fn(() => ({
    user: mockUser,
    loading: false,
    error: null
  }))
}))

// Mock fetch
global.fetch = vi.fn()

describe('MessageForm', () => {
  const mockOnSuccess = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as any).mockClear()
  })

  it('renders form fields correctly', () => {
    render(<MessageForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contact phone/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create message/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup()
    render(<MessageForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)

    const submitButton = screen.getByRole('button', { name: /create message/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument()
      expect(screen.getByText(/description is required/i)).toBeInTheDocument()
      expect(screen.getByText(/contact phone is required/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for short title', async () => {
    const user = userEvent.setup()
    render(<MessageForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)

    const titleInput = screen.getByLabelText(/title/i)
    await user.type(titleInput, 'Hi')

    const submitButton = screen.getByRole('button', { name: /create message/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/title must be at least 3 characters long/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for short description', async () => {
    const user = userEvent.setup()
    render(<MessageForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)

    const descriptionInput = screen.getByLabelText(/description/i)
    await user.type(descriptionInput, 'Short')

    const submitButton = screen.getByRole('button', { name: /create message/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/description must be at least 10 characters long/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid phone number', async () => {
    const user = userEvent.setup()
    render(<MessageForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)

    const phoneInput = screen.getByLabelText(/contact phone/i)
    await user.type(phoneInput, '123')

    const submitButton = screen.getByRole('button', { name: /create message/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid phone number/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: {
          id: '1',
          title: 'Test Message',
          description: 'This is a test message description',
          publisherName: 'Test User',
          contactPhone: '(555) 123-4567',
          userId: '1',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        success: true
      })
    })

    render(<MessageForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)

    // Fill out the form
    await user.type(screen.getByLabelText(/title/i), 'Test Message')
    await user.type(screen.getByLabelText(/description/i), 'This is a test message description')
    await user.type(screen.getByLabelText(/contact phone/i), '(555) 123-4567')

    const submitButton = screen.getByRole('button', { name: /create message/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Test Message',
          description: 'This is a test message description',
          contactPhone: '(555) 123-4567'
        })
      })
    })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('handles API error', async () => {
    const user = userEvent.setup()
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: 'Failed to create message'
      })
    })

    render(<MessageForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)

    // Fill out the form
    await user.type(screen.getByLabelText(/title/i), 'Test Message')
    await user.type(screen.getByLabelText(/description/i), 'This is a test message description')
    await user.type(screen.getByLabelText(/contact phone/i), '(555) 123-4567')

    const submitButton = screen.getByRole('button', { name: /create message/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/failed to create message/i)).toBeInTheDocument()
    })

    expect(mockOnSuccess).not.toHaveBeenCalled()
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<MessageForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('disables form when not authenticated', async () => {
    // Import and mock the hook for this specific test
    const { useAuth } = await import('@/hooks/use-auth-hooks')
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: vi.fn()
    })

    render(<MessageForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)

    expect(screen.getByText(/you must be logged in to create a message/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /create message/i })).not.toBeInTheDocument()
  })
})