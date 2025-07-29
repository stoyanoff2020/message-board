import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { useRouter, usePathname } from 'next/navigation'
import { Header } from '../header'
import { useAuth } from '@/contexts/auth-context'

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(),
}))

// Mock auth context
vi.mock('@/contexts/auth-context', () => ({
  useAuth: vi.fn(),
}))

// Mock logout button
vi.mock('@/components/auth/logout-button', () => ({
  LogoutButton: ({ onClick }: { onClick?: () => void }) => (
    <button data-testid="logout-button" onClick={onClick}>
      Sign out
    </button>
  ),
}))

const mockUseAuth = vi.mocked(useAuth)
const mockUseRouter = vi.mocked(useRouter)
const mockUsePathname = vi.mocked(usePathname)

describe('Navigation Integration', () => {
  const mockPush = vi.fn()

  beforeEach(() => {
    mockUsePathname.mockReturnValue('/')
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('allows navigation between public pages when not authenticated', () => {
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
    
    // Check that sign in and sign up links are present
    const signInLink = screen.getByRole('link', { name: 'Sign in' })
    const signUpLink = screen.getByRole('link', { name: 'Sign up' })
    
    expect(signInLink).toHaveAttribute('href', '/login')
    expect(signUpLink).toHaveAttribute('href', '/register')
  })

  it('shows authenticated navigation when user is logged in', () => {
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
    
    // Check that authenticated navigation is present
    expect(screen.getByRole('link', { name: 'Messages' })).toHaveAttribute('href', '/')
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByTestId('logout-button')).toBeInTheDocument()
    
    // Should not show sign in/up links
    expect(screen.queryByRole('link', { name: 'Sign in' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Sign up' })).not.toBeInTheDocument()
  })

  it('shows admin navigation for admin users', () => {
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
    
    // Check that admin navigation is present
    expect(screen.getByRole('link', { name: 'Messages' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: /Admin/ })).toHaveAttribute('href', '/admin')
    expect(screen.getByText('Admin User')).toBeInTheDocument()
    
    // Should show admin badge
    expect(screen.getAllByText('Admin')).toHaveLength(2) // Link text and badge
  })

  it('hides admin navigation for non-admin users', () => {
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
    
    // Should not show admin navigation
    expect(screen.queryByRole('link', { name: /Admin/ })).not.toBeInTheDocument()
    expect(screen.queryByText('Admin', { selector: 'span' })).not.toBeInTheDocument()
  })

  it('handles responsive navigation correctly', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      isAdmin: true,
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
    
    // Check that both desktop and mobile versions of brand are present
    expect(screen.getByText('Message Board')).toBeInTheDocument() // Desktop
    expect(screen.getByText('Board')).toBeInTheDocument() // Mobile
    
    // Check that responsive classes are applied
    const desktopBrand = screen.getByText('Message Board').closest('div')
    const mobileBrand = screen.getByText('Board').closest('div')
    
    expect(desktopBrand).toHaveClass('hidden', 'md:flex')
    expect(mobileBrand).toHaveClass('flex', 'md:hidden')
  })

  it('shows loading state during authentication', () => {
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
    
    // Should show loading placeholder
    const loadingElement = document.querySelector('.animate-pulse')
    expect(loadingElement).toBeInTheDocument()
    
    // Should not show auth buttons during loading
    expect(screen.queryByRole('link', { name: 'Sign in' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Sign up' })).not.toBeInTheDocument()
  })
})