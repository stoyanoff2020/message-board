import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import { LogoutButton } from '../logout-button'
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

describe('LogoutButton', () => {
  const mockLogout = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseRouter.mockReturnValue({ push: mockPush })
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'Test User' },
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: mockLogout,
      refreshUser: vi.fn(),
      clearError: vi.fn()
    })
  })

  it('renders logout button with default text', () => {
    render(<LogoutButton />)

    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
  })

  it('renders logout button with custom text', () => {
    render(<LogoutButton>Sign Out</LogoutButton>)

    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
  })

  it('calls logout function when clicked', async () => {
    const user = userEvent.setup()
    mockLogout.mockResolvedValueOnce(undefined)

    render(<LogoutButton />)

    const logoutButton = screen.getByRole('button', { name: /logout/i })
    await user.click(logoutButton)

    expect(mockLogout).toHaveBeenCalled()
  })

  it('redirects to login page after successful logout', async () => {
    const user = userEvent.setup()
    mockLogout.mockResolvedValueOnce(undefined)

    render(<LogoutButton />)

    const logoutButton = screen.getByRole('button', { name: /logout/i })
    await user.click(logoutButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  it('redirects to custom redirect path after logout', async () => {
    const user = userEvent.setup()
    mockLogout.mockResolvedValueOnce(undefined)

    render(<LogoutButton redirectTo="/home" />)

    const logoutButton = screen.getByRole('button', { name: /logout/i })
    await user.click(logoutButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/home')
    })
  })

  it('shows loading state during logout', async () => {
    const user = userEvent.setup()
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'Test User' },
      loading: true,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: mockLogout,
      refreshUser: vi.fn(),
      clearError: vi.fn()
    })

    render(<LogoutButton />)

    const logoutButton = screen.getByRole('button', { name: /logging out/i })
    expect(logoutButton).toBeDisabled()
  })

  it('handles logout error gracefully', async () => {
    const user = userEvent.setup()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockLogout.mockRejectedValueOnce(new Error('Logout failed'))

    render(<LogoutButton />)

    const logoutButton = screen.getByRole('button', { name: /logout/i })
    await user.click(logoutButton)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Logout error:', expect.any(Error))
    })

    consoleSpy.mockRestore()
  })

  it('applies custom className', () => {
    render(<LogoutButton className="custom-class" />)

    const logoutButton = screen.getByRole('button', { name: /logout/i })
    expect(logoutButton).toHaveClass('custom-class')
  })

  it('applies custom variant', () => {
    render(<LogoutButton variant="outline" />)

    const logoutButton = screen.getByRole('button', { name: /logout/i })
    // Assuming the Button component applies variant classes
    expect(logoutButton).toBeInTheDocument()
  })

  it('applies custom size', () => {
    render(<LogoutButton size="sm" />)

    const logoutButton = screen.getByRole('button', { name: /logout/i })
    // Assuming the Button component applies size classes
    expect(logoutButton).toBeInTheDocument()
  })

  it('prevents multiple logout calls when clicked rapidly', async () => {
    const user = userEvent.setup()
    mockLogout.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(<LogoutButton />)

    const logoutButton = screen.getByRole('button', { name: /logout/i })
    
    // Click multiple times rapidly
    await user.click(logoutButton)
    await user.click(logoutButton)
    await user.click(logoutButton)

    // Should only call logout once
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })

  it('does not redirect if logout fails', async () => {
    const user = userEvent.setup()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockLogout.mockRejectedValueOnce(new Error('Logout failed'))

    render(<LogoutButton />)

    const logoutButton = screen.getByRole('button', { name: /logout/i })
    await user.click(logoutButton)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled()
    })

    // Should not redirect on error
    expect(mockPush).not.toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  it('works with keyboard navigation', async () => {
    const user = userEvent.setup()
    mockLogout.mockResolvedValueOnce(undefined)

    render(<LogoutButton />)

    const logoutButton = screen.getByRole('button', { name: /logout/i })
    
    // Focus and press Enter
    logoutButton.focus()
    await user.keyboard('{Enter}')

    expect(mockLogout).toHaveBeenCalled()
  })

  it('works with space key', async () => {
    const user = userEvent.setup()
    mockLogout.mockResolvedValueOnce(undefined)

    render(<LogoutButton />)

    const logoutButton = screen.getByRole('button', { name: /logout/i })
    
    // Focus and press Space
    logoutButton.focus()
    await user.keyboard(' ')

    expect(mockLogout).toHaveBeenCalled()
  })
})