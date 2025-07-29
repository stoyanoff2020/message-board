import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { usePathname } from 'next/navigation'
import { Header } from '../header'
import { useAuth } from '@/contexts/auth-context'

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}))

// Mock auth context
vi.mock('@/contexts/auth-context', () => ({
  useAuth: vi.fn(),
}))

// Mock logout button
vi.mock('@/components/auth/logout-button', () => ({
  LogoutButton: ({ children }: { children?: React.ReactNode }) => (
    <button data-testid="logout-button">{children || 'Sign out'}</button>
  ),
}))

const mockUsePathname = vi.mocked(usePathname)
const mockUseAuth = vi.mocked(useAuth)

describe('Header', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders brand logo and name', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: vi.fn(),
    })

    render(<Header />)
    
    expect(screen.getByText('Message Board')).toBeInTheDocument()
    expect(screen.getByText('Board')).toBeInTheDocument() // Mobile version
  })

  it('shows sign in and sign up buttons when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: vi.fn(),
    })

    render(<Header />)
    
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sign up' })).toBeInTheDocument()
  })

  it('shows user info and logout button when user is authenticated', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      isAdmin: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: vi.fn(),
    })

    render(<Header />)
    
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByTestId('logout-button')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Messages' })).toBeInTheDocument()
  })

  it('shows admin link when user is admin', () => {
    const mockAdminUser = {
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
      isAdmin: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockUseAuth.mockReturnValue({
      user: mockAdminUser,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: vi.fn(),
    })

    render(<Header />)
    
    expect(screen.getByText('Admin User')).toBeInTheDocument()
    expect(screen.getAllByText('Admin')).toHaveLength(2) // Admin badge and admin link
    expect(screen.getByRole('link', { name: /Admin/ })).toBeInTheDocument()
  })

  it('shows loading state when auth is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: vi.fn(),
    })

    render(<Header />)
    
    // Should show loading placeholder instead of auth buttons
    expect(screen.queryByRole('link', { name: 'Sign in' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Sign up' })).not.toBeInTheDocument()
  })

  it('highlights active navigation link', () => {
    mockUsePathname.mockReturnValue('/admin')
    
    const mockAdminUser = {
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
      isAdmin: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockUseAuth.mockReturnValue({
      user: mockAdminUser,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: vi.fn(),
    })

    render(<Header />)
    
    const adminLink = screen.getByRole('link', { name: /Admin/ })
    expect(adminLink).toHaveClass('text-foreground')
  })

  it('does not show admin link for non-admin users', () => {
    const mockUser = {
      id: '1',
      email: 'user@example.com',
      name: 'Regular User',
      isAdmin: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: vi.fn(),
    })

    render(<Header />)
    
    expect(screen.queryByRole('link', { name: /Admin/ })).not.toBeInTheDocument()
  })
})