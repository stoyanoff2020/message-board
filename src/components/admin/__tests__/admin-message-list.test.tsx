import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AdminMessageList } from '../admin-message-list'
import { Message } from '@/types/message'
import { vi } from 'vitest'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn(() => '2 hours ago')
}))

const mockMessages: Message[] = [
  {
    id: '1',
    title: 'Test Message 1',
    description: 'This is a test message description',
    publisherName: 'John Doe',
    contactPhone: '+1234567890',
    userId: 'user1',
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z')
  },
  {
    id: '2',
    title: 'Test Message 2',
    description: 'Another test message description',
    publisherName: 'Jane Smith',
    contactPhone: '+0987654321',
    userId: 'user2',
    createdAt: new Date('2024-01-01T11:00:00Z'),
    updatedAt: new Date('2024-01-01T11:00:00Z')
  }
]

describe('AdminMessageList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<AdminMessageList />)

    expect(screen.getByText('Loading messages...')).toBeInTheDocument()
  })

  it('displays messages when loaded successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: mockMessages })
    })

    render(<AdminMessageList />)

    await waitFor(() => {
      expect(screen.getByText('Test Message 1')).toBeInTheDocument()
      expect(screen.getByText('Test Message 2')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })
  })

  it('displays error message when fetch fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(<AdminMessageList />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load messages. Please try again.')).toBeInTheDocument()
    })
  })

  it('displays error message when API returns error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    })

    render(<AdminMessageList />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load messages. Please try again.')).toBeInTheDocument()
    })
  })

  it('shows empty state when no messages', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: [] })
    })

    render(<AdminMessageList />)

    await waitFor(() => {
      expect(screen.getByText('No messages found')).toBeInTheDocument()
      expect(screen.getByText('There are no messages to moderate at this time.')).toBeInTheDocument()
    })
  })

  it('displays message count correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: mockMessages })
    })

    render(<AdminMessageList />)

    await waitFor(() => {
      expect(screen.getByText('2 messages total')).toBeInTheDocument()
    })
  })

  it('displays message count correctly for single message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: [mockMessages[0]] })
    })

    render(<AdminMessageList />)

    await waitFor(() => {
      expect(screen.getByText('1 message total')).toBeInTheDocument()
    })
  })

  it('shows delete confirmation when delete button is clicked', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: mockMessages })
    })

    render(<AdminMessageList />)

    await waitFor(() => {
      expect(screen.getByText('Test Message 1')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByText('Delete')
    fireEvent.click(deleteButtons[0])

    expect(screen.getByText('Delete this message?')).toBeInTheDocument()
    expect(screen.getByText('Confirm')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('cancels delete confirmation when cancel is clicked', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: mockMessages })
    })

    render(<AdminMessageList />)

    await waitFor(() => {
      expect(screen.getByText('Test Message 1')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByText('Delete')
    fireEvent.click(deleteButtons[0])

    expect(screen.getByText('Delete this message?')).toBeInTheDocument()

    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    expect(screen.queryByText('Delete this message?')).not.toBeInTheDocument()
  })

  it('deletes message when confirmed', async () => {
    // Mock initial fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: mockMessages })
    })

    render(<AdminMessageList />)

    await waitFor(() => {
      expect(screen.getByText('Test Message 1')).toBeInTheDocument()
    })

    // Mock delete request
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    })

    const deleteButtons = screen.getAllByText('Delete')
    fireEvent.click(deleteButtons[0])

    const confirmButton = screen.getByText('Confirm')
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/messages/1', {
        method: 'DELETE'
      })
    })

    // Message should be removed from the list
    await waitFor(() => {
      expect(screen.queryByText('Test Message 1')).not.toBeInTheDocument()
      expect(screen.getByText('Test Message 2')).toBeInTheDocument()
    })
  })

  it('shows error when delete fails', async () => {
    // Mock initial fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: mockMessages })
    })

    render(<AdminMessageList />)

    await waitFor(() => {
      expect(screen.getByText('Test Message 1')).toBeInTheDocument()
    })

    // Mock failed delete request
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    })

    const deleteButtons = screen.getAllByText('Delete')
    fireEvent.click(deleteButtons[0])

    const confirmButton = screen.getByText('Confirm')
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(screen.getByText('Failed to delete message. Please try again.')).toBeInTheDocument()
    })
  })

  it('refreshes messages when refresh button is clicked', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ messages: mockMessages })
    })

    render(<AdminMessageList />)

    await waitFor(() => {
      expect(screen.getByText('Test Message 1')).toBeInTheDocument()
    })

    const refreshButton = screen.getByText('Refresh')
    fireEvent.click(refreshButton)

    expect(mockFetch).toHaveBeenCalledTimes(2) // Initial load + refresh
  })

  it('shows view button for each message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: mockMessages })
    })

    // Mock alert
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    render(<AdminMessageList />)

    await waitFor(() => {
      expect(screen.getByText('Test Message 1')).toBeInTheDocument()
    })

    const viewButtons = screen.getAllByText('View')
    expect(viewButtons).toHaveLength(2)

    fireEvent.click(viewButtons[0])
    expect(alertSpy).toHaveBeenCalledWith('Viewing message: Test Message 1')

    alertSpy.mockRestore()
  })

  it('displays message details correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: mockMessages })
    })

    render(<AdminMessageList />)

    await waitFor(() => {
      expect(screen.getByText('Test Message 1')).toBeInTheDocument()
      expect(screen.getByText('This is a test message description')).toBeInTheDocument()
      expect(screen.getByText('+1234567890')).toBeInTheDocument()
      expect(screen.getAllByText('2 hours ago')).toHaveLength(2) // Two messages both show "2 hours ago"
    })
  })

  it('retries fetch when retry button is clicked in error state', async () => {
    // First call fails
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(<AdminMessageList />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load messages. Please try again.')).toBeInTheDocument()
    })

    // Second call succeeds
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: mockMessages })
    })

    const retryButton = screen.getByText('Retry')
    fireEvent.click(retryButton)

    await waitFor(() => {
      expect(screen.getByText('Test Message 1')).toBeInTheDocument()
    })
  })
})