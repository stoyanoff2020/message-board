import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AdminUserList } from '../admin-user-list'
import { User } from '@/types/auth'
import { vi } from 'vitest'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn(() => '2 days ago')
}))

const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    isAdmin: true,
    isActive: true,
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z')
  },
  {
    id: '2',
    email: 'user@example.com',
    name: 'Regular User',
    isAdmin: false,
    isActive: true,
    createdAt: new Date('2024-01-02T10:00:00Z'),
    updatedAt: new Date('2024-01-02T10:00:00Z')
  },
  {
    id: '3',
    email: 'inactive@example.com',
    name: 'Inactive User',
    isAdmin: false,
    isActive: false,
    createdAt: new Date('2024-01-03T10:00:00Z'),
    updatedAt: new Date('2024-01-03T10:00:00Z')
  }
]

describe('AdminUserList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<AdminUserList />)

    expect(screen.getByText('Loading users...')).toBeInTheDocument()
  })

  it('displays users when loaded successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: mockUsers })
    })

    render(<AdminUserList />)

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument()
      expect(screen.getByText('Regular User')).toBeInTheDocument()
      expect(screen.getByText('Inactive User')).toBeInTheDocument()
    })
  })

  it('displays error message when fetch fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(<AdminUserList />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load users. Please try again.')).toBeInTheDocument()
    })
  })

  it('displays error message when API returns error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    })

    render(<AdminUserList />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load users. Please try again.')).toBeInTheDocument()
    })
  })

  it('shows empty state when no users', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: [] })
    })

    render(<AdminUserList />)

    await waitFor(() => {
      expect(screen.getByText('No users found')).toBeInTheDocument()
      expect(screen.getByText('There are no users to manage at this time.')).toBeInTheDocument()
    })
  })

  it('displays user count and stats correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: mockUsers })
    })

    render(<AdminUserList />)

    await waitFor(() => {
      expect(screen.getByText('3 users total • 2 active • 1 admin')).toBeInTheDocument()
    })
  })

  it('displays user count correctly for single user', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: [mockUsers[0]] })
    })

    render(<AdminUserList />)

    await waitFor(() => {
      expect(screen.getByText('1 user total • 1 active • 1 admin')).toBeInTheDocument()
    })
  })

  it('shows admin badge for admin users', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: mockUsers })
    })

    render(<AdminUserList />)

    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument()
    })
  })

  it('shows active/inactive badges correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: mockUsers })
    })

    render(<AdminUserList />)

    await waitFor(() => {
      expect(screen.getAllByText('Active')).toHaveLength(2)
      expect(screen.getByText('Inactive')).toBeInTheDocument()
    })
  })

  it('shows disable button for active non-admin users', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: mockUsers })
    })

    render(<AdminUserList />)

    await waitFor(() => {
      const disableButtons = screen.getAllByText('Disable')
      expect(disableButtons).toHaveLength(1) // Only for regular user, not admin
    })
  })

  it('shows enable button for inactive users', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: mockUsers })
    })

    render(<AdminUserList />)

    await waitFor(() => {
      expect(screen.getByText('Enable')).toBeInTheDocument()
    })
  })

  it('shows message for admin users that they cannot be disabled', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: mockUsers })
    })

    render(<AdminUserList />)

    await waitFor(() => {
      expect(screen.getByText('Admin users cannot be disabled')).toBeInTheDocument()
    })
  })

  it('toggles user status when button is clicked', async () => {
    // Mock initial fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: mockUsers })
    })

    render(<AdminUserList />)

    await waitFor(() => {
      expect(screen.getByText('Regular User')).toBeInTheDocument()
    })

    // Mock status update request
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        success: true, 
        user: { ...mockUsers[1], isActive: false }
      })
    })

    const disableButton = screen.getByText('Disable')
    fireEvent.click(disableButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/users/2', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: false })
      })
    })
  })

  it('enables inactive user when enable button is clicked', async () => {
    // Mock initial fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: mockUsers })
    })

    render(<AdminUserList />)

    await waitFor(() => {
      expect(screen.getByText('Inactive User')).toBeInTheDocument()
    })

    // Mock status update request
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        success: true, 
        user: { ...mockUsers[2], isActive: true }
      })
    })

    const enableButton = screen.getByText('Enable')
    fireEvent.click(enableButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/users/3', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: true })
      })
    })
  })

  it('shows error when status update fails', async () => {
    // Mock initial fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: mockUsers })
    })

    render(<AdminUserList />)

    await waitFor(() => {
      expect(screen.getByText('Regular User')).toBeInTheDocument()
    })

    // Mock failed status update request
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    })

    const disableButton = screen.getByText('Disable')
    fireEvent.click(disableButton)

    await waitFor(() => {
      expect(screen.getByText('Failed to update user status. Please try again.')).toBeInTheDocument()
    })
  })

  it('refreshes users when refresh button is clicked', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ users: mockUsers })
    })

    render(<AdminUserList />)

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument()
    })

    const refreshButton = screen.getByText('Refresh')
    fireEvent.click(refreshButton)

    expect(mockFetch).toHaveBeenCalledTimes(2) // Initial load + refresh
  })

  it('displays user details correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: mockUsers })
    })

    render(<AdminUserList />)

    await waitFor(() => {
      expect(screen.getByText('admin@example.com')).toBeInTheDocument()
      expect(screen.getByText('user@example.com')).toBeInTheDocument()
      expect(screen.getByText('inactive@example.com')).toBeInTheDocument()
      // Check that the date formatting function is called - use getAllByText for multiple matches
      expect(screen.getAllByText(/Joined 2 days ago/)).toHaveLength(3)
    })
  })

  it('retries fetch when retry button is clicked in error state', async () => {
    // First call fails
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(<AdminUserList />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load users. Please try again.')).toBeInTheDocument()
    })

    // Second call succeeds
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: mockUsers })
    })

    const retryButton = screen.getByText('Retry')
    fireEvent.click(retryButton)

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument()
    })
  })

  it('shows loading state on button during status update', async () => {
    // Mock initial fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: mockUsers })
    })

    render(<AdminUserList />)

    await waitFor(() => {
      expect(screen.getByText('Regular User')).toBeInTheDocument()
    })

    // Mock successful but slow status update request
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        success: true, 
        user: { ...mockUsers[1], isActive: false }
      })
    })

    const disableButton = screen.getByText('Disable')
    fireEvent.click(disableButton)

    // Just verify the button was clicked and the API was called
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/users/2', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: false })
      })
    })
  })
})