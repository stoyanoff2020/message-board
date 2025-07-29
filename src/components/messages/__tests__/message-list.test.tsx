import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MessageList } from '../message-list'
import { Message } from '@/types/message'
import { vi } from 'vitest'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock MessageCard component
vi.mock('../message-card', () => ({
  MessageCard: ({ message, onViewDetails }: { message: Message; onViewDetails?: (message: Message) => void }) => (
    <div data-testid={`message-${message.id}`}>
      <h3>{message.title}</h3>
      <p>{message.description}</p>
      <span>{message.publisherName}</span>
      <button onClick={() => onViewDetails?.(message)}>View Details</button>
    </div>
  )
}))

// Mock SearchBar component
vi.mock('../search-bar', () => ({
  SearchBar: ({ onSearch, placeholder }: { onSearch: (term: string) => void; placeholder?: string }) => (
    <input
      data-testid="search-bar"
      placeholder={placeholder || 'Search messages...'}
      onChange={(e) => onSearch(e.target.value)}
    />
  )
}))

const mockMessages: Message[] = [
  {
    id: '1',
    title: 'First Message',
    description: 'This is the first test message',
    publisherName: 'John Doe',
    contactPhone: '+1234567890',
    userId: 'user1',
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z')
  },
  {
    id: '2',
    title: 'Second Message',
    description: 'This is the second test message',
    publisherName: 'Jane Smith',
    contactPhone: '+0987654321',
    userId: 'user2',
    createdAt: new Date('2024-01-01T11:00:00Z'),
    updatedAt: new Date('2024-01-01T11:00:00Z')
  },
  {
    id: '3',
    title: 'Third Message',
    description: 'This is the third test message',
    publisherName: 'Bob Johnson',
    contactPhone: '+1122334455',
    userId: 'user3',
    createdAt: new Date('2024-01-01T12:00:00Z'),
    updatedAt: new Date('2024-01-01T12:00:00Z')
  }
]

describe('MessageList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<MessageList />)

    expect(screen.getByText('Loading messages...')).toBeInTheDocument()
  })

  it('displays messages when loaded successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: mockMessages })
    })

    render(<MessageList />)

    await waitFor(() => {
      expect(screen.getByText('First Message')).toBeInTheDocument()
      expect(screen.getByText('Second Message')).toBeInTheDocument()
      expect(screen.getByText('Third Message')).toBeInTheDocument()
    })
  })

  it('displays error message when fetch fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(<MessageList />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load messages. Please try again.')).toBeInTheDocument()
    })
  })

  it('displays error message when API returns error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    })

    render(<MessageList />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load messages. Please try again.')).toBeInTheDocument()
    })
  })

  it('shows empty state when no messages', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: [] })
    })

    render(<MessageList />)

    await waitFor(() => {
      expect(screen.getByText('No messages found')).toBeInTheDocument()
      expect(screen.getByText('Be the first to share a message!')).toBeInTheDocument()
    })
  })

  it('renders search bar', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: mockMessages })
    })

    render(<MessageList />)

    await waitFor(() => {
      expect(screen.getByTestId('search-bar')).toBeInTheDocument()
    })
  })

  it('filters messages based on search term', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: mockMessages })
    })

    // Mock search API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: [mockMessages[0]] })
    })

    render(<MessageList />)

    await waitFor(() => {
      expect(screen.getByText('First Message')).toBeInTheDocument()
    })

    const searchInput = screen.getByTestId('search-bar')
    fireEvent.change(searchInput, { target: { value: 'First' } })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/messages?search=First')
    })
  })

  it('shows message count', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: mockMessages })
    })

    render(<MessageList />)

    await waitFor(() => {
      expect(screen.getByText('3 messages')).toBeInTheDocument()
    })
  })

  it('shows singular message count for one message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: [mockMessages[0]] })
    })

    render(<MessageList />)

    await waitFor(() => {
      expect(screen.getByText('1 message')).toBeInTheDocument()
    })
  })

  it('handles message view details', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: mockMessages })
    })

    const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {})

    render(<MessageList />)

    await waitFor(() => {
      expect(screen.getByText('First Message')).toBeInTheDocument()
    })

    const viewButton = screen.getAllByText('View Details')[0]
    fireEvent.click(viewButton)

    expect(mockAlert).toHaveBeenCalledWith('Viewing message: First Message')

    mockAlert.mockRestore()
  })

  it('refreshes messages when refresh button is clicked', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ messages: mockMessages })
    })

    render(<MessageList />)

    await waitFor(() => {
      expect(screen.getByText('First Message')).toBeInTheDocument()
    })

    const refreshButton = screen.getByText('Refresh')
    fireEvent.click(refreshButton)

    expect(mockFetch).toHaveBeenCalledTimes(2) // Initial load + refresh
  })

  it('retries fetch when retry button is clicked in error state', async () => {
    // First call fails
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(<MessageList />)

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
      expect(screen.getByText('First Message')).toBeInTheDocument()
    })
  })

  it('shows "No results found" when search returns empty results', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: mockMessages })
    })

    // Mock empty search results
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: [] })
    })

    render(<MessageList />)

    await waitFor(() => {
      expect(screen.getByText('First Message')).toBeInTheDocument()
    })

    const searchInput = screen.getByTestId('search-bar')
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

    await waitFor(() => {
      expect(screen.getByText('No messages found')).toBeInTheDocument()
      expect(screen.getByText('Try adjusting your search terms.')).toBeInTheDocument()
    })
  })

  it('clears search results when search term is cleared', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: mockMessages })
    })

    // Mock search results
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: [mockMessages[0]] })
    })

    // Mock clearing search (all messages)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: mockMessages })
    })

    render(<MessageList />)

    await waitFor(() => {
      expect(screen.getByText('First Message')).toBeInTheDocument()
    })

    const searchInput = screen.getByTestId('search-bar')
    
    // Search for something
    fireEvent.change(searchInput, { target: { value: 'First' } })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/messages?search=First')
    })

    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/messages')
    })
  })

  it('handles search API error gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: mockMessages })
    })

    // Mock search API error
    mockFetch.mockRejectedValueOnce(new Error('Search failed'))

    render(<MessageList />)

    await waitFor(() => {
      expect(screen.getByText('First Message')).toBeInTheDocument()
    })

    const searchInput = screen.getByTestId('search-bar')
    fireEvent.change(searchInput, { target: { value: 'test' } })

    await waitFor(() => {
      expect(screen.getByText('Failed to load messages. Please try again.')).toBeInTheDocument()
    })
  })

  it('shows loading state during search', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: mockMessages })
    })

    // Mock slow search response
    mockFetch.mockImplementation(() => new Promise(() => {}))

    render(<MessageList />)

    await waitFor(() => {
      expect(screen.getByText('First Message')).toBeInTheDocument()
    })

    const searchInput = screen.getByTestId('search-bar')
    fireEvent.change(searchInput, { target: { value: 'test' } })

    await waitFor(() => {
      expect(screen.getByText('Loading messages...')).toBeInTheDocument()
    })
  })

  it('displays messages in correct order (newest first)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: mockMessages })
    })

    render(<MessageList />)

    await waitFor(() => {
      const messageElements = screen.getAllByTestId(/message-/)
      expect(messageElements[0]).toHaveAttribute('data-testid', 'message-3') // Third (newest)
      expect(messageElements[1]).toHaveAttribute('data-testid', 'message-2') // Second
      expect(messageElements[2]).toHaveAttribute('data-testid', 'message-1') // First (oldest)
    })
  })
})