import { render, screen, waitFor } from '@testing-library/react'
import { useRouter, usePathname } from 'next/navigation'
import { AdminGuard, AdminOnly, useAdminAccess } from '../admin-guard'
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

// Mock user data
const mockAdminUser: User = {
  id: '1',
  email: 'admin@example.com',
  name: 'Admin User',
  isAdmin: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
}

const mockRegularUser: User = {
  id: '2',
  email: 'user@example.com',
  name: 'Regular User',
  isAdmin: false,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
}

const mockInactiveAdminUser: User = {
  ...mockAdminUser,
  isActive: false
}

describe('AdminGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseRouter.mockReturnValue({ push: mockPush } as any)
    mockUsePathname.mockReturnValue('/admin/dashboard')
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
      <AdminGuard>
        <div>Admin Content</div>
      </AdminGuard>
    )

    expect(screen.getByText('Verifying admin access...')).toBeInTheDocument()
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
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
      <AdminGuard>
        <div>Admin Content</div>
      </AdminGuard>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login?returnUrl=%2Fadmin%2Fdashboard')
    })
  })

  it('redirects to home when user is not admin', async () => {
    mockUseAuth.mockReturnValue({
      user: mockRegularUser,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: vi.fn()
    })

    render(
      <AdminGuard>
        <div>Admin Content</div>
      </AdminGuard>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('redirects to custom route when user is not admin and redirectTo is specified', async () => {
    mockUseAuth.mockReturnValue({
      user: mockRegularUser,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: vi.fn()
    })

    render(
      <AdminGuard redirectTo="/dashboard">
        <div>Admin Content</div>
      </AdminGuard>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('redirects to account-disabled when admin user is inactive', async () => {
    mockUseAuth.mockReturnValue({
      user: mockInactiveAdminUser,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: vi.fn()
    })

    render(
      <AdminGuard>
        <div>Admin Content</div>
      </AdminGuard>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/account-disabled')
    })
  })

  it('renders children when user is admin and active', () => {
    mockUseAuth.mockReturnValue({
      user: mockAdminUser,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: vi.fn()
    })

    render(
      <AdminGuard>
        <div>Admin Content</div>
      </AdminGuard>
    )

    expect(screen.getByText('Admin Content')).toBeInTheDocument()
  })

  it('shows access denied message when showAccessDenied is true and user is not admin', () => {
    mockUseAuth.mockReturnValue({
      user: mockRegularUser,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: vi.fn()
    })

    render(
      <AdminGuard showAccessDenied={true}>
        <div>Admin Content</div>
      </AdminGuard>
    )

    expect(screen.getByText('Access Denied')).toBeInTheDocument()
    expect(screen.getByText(/You don't have permission to access this admin area/)).toBeInTheDocument()
    expect(screen.getByText('Return to Home')).toBeInTheDocument()
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
      <AdminGuard fallback={<div>Custom Loading</div>}>
        <div>Admin Content</div>
      </AdminGuard>
    )

    expect(screen.getByText('Custom Loading')).toBeInTheDocument()
    expect(screen.queryByText('Verifying admin access...')).not.toBeInTheDocument()
  })
})

describe('AdminOnly', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
      <AdminOnly>
        <div>Admin Only Content</div>
      </AdminOnly>
    )

    expect(screen.queryByText('Admin Only Content')).not.toBeInTheDocument()
  })

  it('shows default access denied message when user is not admin', () => {
    mockUseAuth.mockReturnValue({
      user: mockRegularUser,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: vi.fn()
    })

    render(
      <AdminOnly>
        <div>Admin Only Content</div>
      </AdminOnly>
    )

    expect(screen.getByText('This content is only available to administrators.')).toBeInTheDocument()
    expect(screen.queryByText('Admin Only Content')).not.toBeInTheDocument()
  })

  it('shows custom fallback when user is not admin', () => {
    mockUseAuth.mockReturnValue({
      user: mockRegularUser,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: vi.fn()
    })

    render(
      <AdminOnly fallback={<div>Custom Access Denied</div>}>
        <div>Admin Only Content</div>
      </AdminOnly>
    )

    expect(screen.getByText('Custom Access Denied')).toBeInTheDocument()
    expect(screen.queryByText('Admin Only Content')).not.toBeInTheDocument()
  })

  it('renders children when user is admin and active', () => {
    mockUseAuth.mockReturnValue({
      user: mockAdminUser,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: vi.fn()
    })

    render(
      <AdminOnly>
        <div>Admin Only Content</div>
      </AdminOnly>
    )

    expect(screen.getByText('Admin Only Content')).toBeInTheDocument()
  })

  it('does not render children when admin user is inactive', () => {
    mockUseAuth.mockReturnValue({
      user: mockInactiveAdminUser,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: vi.fn()
    })

    render(
      <AdminOnly>
        <div>Admin Only Content</div>
      </AdminOnly>
    )

    expect(screen.queryByText('Admin Only Content')).not.toBeInTheDocument()
    expect(screen.getByText('This content is only available to administrators.')).toBeInTheDocument()
  })
})

describe('useAdminAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns correct admin access status for admin user', () => {
    mockUseAuth.mockReturnValue({
      user: mockAdminUser,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: vi.fn()
    })

    const TestComponent = () => {
      const adminAccess = useAdminAccess()
      return (
        <div>
          <div data-testid="isAdmin">{adminAccess.isAdmin.toString()}</div>
          <div data-testid="isAuthenticated">{adminAccess.isAuthenticated.toString()}</div>
          <div data-testid="isActive">{adminAccess.isActive.toString()}</div>
          <div data-testid="hasAdminAccess">{adminAccess.hasAdminAccess.toString()}</div>
          <div data-testid="loading">{adminAccess.loading.toString()}</div>
        </div>
      )
    }

    render(<TestComponent />)

    expect(screen.getByTestId('isAdmin')).toHaveTextContent('true')
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true')
    expect(screen.getByTestId('isActive')).toHaveTextContent('true')
    expect(screen.getByTestId('hasAdminAccess')).toHaveTextContent('true')
    expect(screen.getByTestId('loading')).toHaveTextContent('false')
  })

  it('returns correct admin access status for regular user', () => {
    mockUseAuth.mockReturnValue({
      user: mockRegularUser,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: vi.fn()
    })

    const TestComponent = () => {
      const adminAccess = useAdminAccess()
      return (
        <div>
          <div data-testid="isAdmin">{adminAccess.isAdmin.toString()}</div>
          <div data-testid="isAuthenticated">{adminAccess.isAuthenticated.toString()}</div>
          <div data-testid="isActive">{adminAccess.isActive.toString()}</div>
          <div data-testid="hasAdminAccess">{adminAccess.hasAdminAccess.toString()}</div>
          <div data-testid="loading">{adminAccess.loading.toString()}</div>
        </div>
      )
    }

    render(<TestComponent />)

    expect(screen.getByTestId('isAdmin')).toHaveTextContent('false')
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true')
    expect(screen.getByTestId('isActive')).toHaveTextContent('true')
    expect(screen.getByTestId('hasAdminAccess')).toHaveTextContent('false')
    expect(screen.getByTestId('loading')).toHaveTextContent('false')
  })

  it('returns correct admin access status for inactive admin user', () => {
    mockUseAuth.mockReturnValue({
      user: mockInactiveAdminUser,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: vi.fn()
    })

    const TestComponent = () => {
      const adminAccess = useAdminAccess()
      return (
        <div>
          <div data-testid="isAdmin">{adminAccess.isAdmin.toString()}</div>
          <div data-testid="isAuthenticated">{adminAccess.isAuthenticated.toString()}</div>
          <div data-testid="isActive">{adminAccess.isActive.toString()}</div>
          <div data-testid="hasAdminAccess">{adminAccess.hasAdminAccess.toString()}</div>
          <div data-testid="loading">{adminAccess.loading.toString()}</div>
        </div>
      )
    }

    render(<TestComponent />)

    expect(screen.getByTestId('isAdmin')).toHaveTextContent('true')
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true')
    expect(screen.getByTestId('isActive')).toHaveTextContent('false')
    expect(screen.getByTestId('hasAdminAccess')).toHaveTextContent('false')
    expect(screen.getByTestId('loading')).toHaveTextContent('false')
  })

  it('returns correct admin access status when not authenticated', () => {
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

    const TestComponent = () => {
      const adminAccess = useAdminAccess()
      return (
        <div>
          <div data-testid="isAdmin">{adminAccess.isAdmin.toString()}</div>
          <div data-testid="isAuthenticated">{adminAccess.isAuthenticated.toString()}</div>
          <div data-testid="isActive">{adminAccess.isActive.toString()}</div>
          <div data-testid="hasAdminAccess">{adminAccess.hasAdminAccess.toString()}</div>
          <div data-testid="loading">{adminAccess.loading.toString()}</div>
        </div>
      )
    }

    render(<TestComponent />)

    expect(screen.getByTestId('isAdmin')).toHaveTextContent('false')
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false')
    expect(screen.getByTestId('isActive')).toHaveTextContent('false')
    expect(screen.getByTestId('hasAdminAccess')).toHaveTextContent('false')
    expect(screen.getByTestId('loading')).toHaveTextContent('false')
  })
})