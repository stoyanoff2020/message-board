import { render, screen, waitFor } from '@testing-library/react'
import { useRouter, usePathname } from 'next/navigation'
import { AuthGuard } from '../auth-guard'
import { useAuth } from '@/contexts/auth-context'
import { User } from '@/types/auth'
import { vi } from 'vitest'

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn()
}))

// Mock auth context
vi.mock('@/contexts/auth-context', () => ({
  useAuth: vi.fn()
}))

const mockPush = vi.fn()
const mockUseRouter = useRouter as any
const mockUsePathname = usePathname as any
const mockUseAuth = useAuth as any

const mockUser: User = {
  id: '1',
  email: 'user@example.com',
  name: 'Test User',
  isAdmin: false,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
}

const mockInactiveUser: User = {
  ...mockUser,
  isActive: false
}

describe('AuthGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseRouter.mockReturnValue({ push: mockPush })
    mockUsePathname.mockReturnValue('/protected')
  })

  it('shows loading state while authentication is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: vi.fn()
    })

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('redirects to login when user is not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: vi.fn()
    })

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login?returnUrl=%2Fprotected')
    })
  })

  it('redirects to custom route when user is not authenticated and redirectTo is specified', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: vi.fn()
    })

    render(
      <AuthGuard redirectTo="/custom-login">
        <div>Protected Content</div>
      </AuthGuard>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/custom-login')
    })
  })

  it('redirects to account-disabled when user is inactive', async () => {
    mockUseAuth.mockReturnValue({
      user: mockInactiveUser,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: vi.fn()
    })

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/account-disabled')
    })
  })

  it('renders children when user is authenticated and active', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: vi.fn()
    })

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('renders custom fallback during loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: vi.fn()
    })

    render(
      <AuthGuard fallback={<div>Custom Loading</div>}>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(screen.getByText('Custom Loading')).toBeInTheDocument()
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })

  it('does not redirect when requireAuth is false and user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: vi.fn()
    })

    render(
      <AuthGuard requireAuth={false}>
        <div>Public Content</div>
      </AuthGuard>
    )

    expect(screen.getByText('Public Content')).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('handles authentication error gracefully', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: 'Authentication failed',
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: vi.fn()
    })

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    // Should still redirect to login even with error
    expect(mockPush).toHaveBeenCalledWith('/login?returnUrl=%2Fprotected')
  })
})