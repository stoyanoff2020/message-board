import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { AdminDashboard, AdminDashboardLayout } from '../admin-dashboard'
import { useAuth } from '@/contexts/auth-context'
import { User } from '@/types/auth'
import { vi } from 'vitest'

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn()
}))

// Mock auth context
vi.mock('@/contexts/auth-context', () => ({
  useAuth: vi.fn()
}))

// Mock AdminGuard
vi.mock('@/components/auth/admin-guard', () => ({
  AdminGuard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

const mockPush = vi.fn()
const mockUseRouter = useRouter as any
const mockUseAuth = useAuth as any

const mockAdminUser: User = {
  id: '1',
  email: 'admin@example.com',
  name: 'Admin User',
  isAdmin: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
}

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseRouter.mockReturnValue({ push: mockPush })
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
  })

  it('renders admin dashboard header correctly', () => {
    render(<AdminDashboard />)

    expect(screen.getByText('Admin Panel')).toBeInTheDocument()
    expect(screen.getByText('Message Board Administration')).toBeInTheDocument()
    expect(screen.getByText('Welcome, Admin User')).toBeInTheDocument()
  })

  it('renders navigation tabs', () => {
    render(<AdminDashboard />)

    expect(screen.getByText('Messages')).toBeInTheDocument()
    expect(screen.getByText('Users')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('shows messages tab content by default', () => {
    render(<AdminDashboard />)

    expect(screen.getByText('Message Management')).toBeInTheDocument()
    expect(screen.getByText('View and moderate all messages posted on the message board')).toBeInTheDocument()
  })

  it('has clickable users tab', () => {
    render(<AdminDashboard />)

    const usersTab = screen.getByRole('tab', { name: /users/i })
    expect(usersTab).toBeInTheDocument()
    
    // Test that the tab can be clicked without error
    fireEvent.click(usersTab)
    expect(usersTab).toBeInTheDocument()
  })

  it('has clickable settings tab', () => {
    render(<AdminDashboard />)

    const settingsTab = screen.getByRole('tab', { name: /settings/i })
    expect(settingsTab).toBeInTheDocument()
    
    // Test that the tab can be clicked without error
    fireEvent.click(settingsTab)
    expect(settingsTab).toBeInTheDocument()
  })

  it('navigates to home when back to site button is clicked', () => {
    render(<AdminDashboard />)

    const backButton = screen.getByText('Back to Site')
    fireEvent.click(backButton)

    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('calls logout when logout button is clicked', async () => {
    const mockLogout = vi.fn()
    mockUseAuth.mockReturnValue({
      user: mockAdminUser,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: mockLogout,
      refreshUser: vi.fn(),
      clearError: vi.fn()
    })

    render(<AdminDashboard />)

    const logoutButton = screen.getByText('Logout')
    fireEvent.click(logoutButton)

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  it('renders children in messages tab when provided', () => {
    render(
      <AdminDashboard>
        <div>Custom Message Content</div>
      </AdminDashboard>
    )

    expect(screen.getByText('Custom Message Content')).toBeInTheDocument()
  })

  it('starts with custom default tab', () => {
    render(<AdminDashboard defaultTab="users" />)

    expect(screen.getByText('User Management')).toBeInTheDocument()
  })

  it('handles logout error gracefully', async () => {
    const mockLogout = vi.fn().mockRejectedValue(new Error('Logout failed'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    mockUseAuth.mockReturnValue({
      user: mockAdminUser,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: mockLogout,
      refreshUser: vi.fn(),
      clearError: vi.fn()
    })

    render(<AdminDashboard />)

    const logoutButton = screen.getByText('Logout')
    fireEvent.click(logoutButton)

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalledWith('Logout error:', expect.any(Error))
    })

    consoleSpy.mockRestore()
  })
})

describe('AdminDashboardLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseRouter.mockReturnValue({ push: mockPush })
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
  })

  it('renders children within dashboard layout', () => {
    render(
      <AdminDashboardLayout>
        <div>Layout Content</div>
      </AdminDashboardLayout>
    )

    expect(screen.getByText('Layout Content')).toBeInTheDocument()
    expect(screen.getByText('Admin Panel')).toBeInTheDocument()
  })

  it('uses custom tab when specified', () => {
    render(
      <AdminDashboardLayout tab="users">
        <div>User Content</div>
      </AdminDashboardLayout>
    )

    expect(screen.getByText('User Management')).toBeInTheDocument()
    expect(screen.getByText('User Content')).toBeInTheDocument()
  })
})