import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider } from '@/contexts/auth-context'
import { ToastProvider } from '@/contexts/toast-context'
import { MessageForm } from '@/components/messages/message-form'
import { MessageList } from '@/components/messages/message-list'
import { vi } from 'vitest'

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn()
  })),
  useSearchParams: vi.fn(() => ({
    get: vi.fn().mockReturnValue(null)
  })),
  usePathname: vi.fn(() => '/')
}))

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({
        data: {
          session: {
            user: {
              id: '123',
              email: 'test@example.com',
              user_metadata: { name: 'Test User' }
            }
          }
        }
      })),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    }
  }
}))

// Mock fetch for API calls
const mockFetch = vi.fn()
global.fetch = mockFetch

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>
    <AuthProvider>
      {children}
    </AuthProvider>
  </ToastProvider>
)

const mockMessages = [
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

describe('Message Workflow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Message Creation Flow', () => {
    it('should create a message successfully', async () => {
      const user = userEvent.setup()
      const mockOnSuccess = vi.fn()
      const mockOnCancel = vi.fn()

      // Mock successful message creation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: {
            id: '3',
            title: 'New Test Message',
            description: 'This is a new test message',
            publisherName: 'Test User',
            contactPhone: '(555) 123-4567',
            userId: '123',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          success: true
        })
      })

      render(
        <TestWrapper>
          <MessageForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
        </TestWrapper>
      )

      // Fill out message form
      await user.type(screen.getByLabelText(/title/i), 'New Test Message')
      await user.type(screen.getByLabelText(/description/i), 'This is a new test message')
      await user.type(screen.getByLabelText(/contact phone/i), '(555) 123-4567')

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create message/i })
      await user.click(submitButton)

      // Verify API was called with correct data
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: 'New Test Message',
            description: 'This is a new test message',
            contactPhone: '(555) 123-4567'
          })
        })
      })

      // Verify success callback was called
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled()
      })
    })

    it('should handle message creation errors', async () => {
      const user = userEvent.setup()
      const mockOnSuccess = vi.fn()
      const mockOnCancel = vi.fn()

      // Mock API error
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          message: 'Failed to create message'
        })
      })

      render(
        <TestWrapper>
          <MessageForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
        </TestWrapper>
      )

      // Fill out message form
      await user.type(screen.getByLabelText(/title/i), 'Test Message')
      await user.type(screen.getByLabelText(/description/i), 'Test description')
      await user.type(screen.getByLabelText(/contact phone/i), '(555) 123-4567')

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create message/i })
      await user.click(submitButton)

      // Verify error is displayed
      await waitFor(() => {
        expect(screen.getByText(/failed to create message/i)).toBeInTheDocument()
      })

      // Verify success callback was not called
      expect(mockOnSuccess).not.toHaveBeenCalled()
    })

    it('should validate message form fields', async () => {
      const user = userEvent.setup()
      const mockOnSuccess = vi.fn()
      const mockOnCancel = vi.fn()

      render(
        <TestWrapper>
          <MessageForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
        </TestWrapper>
      )

      // Try to submit empty form
      const submitButton = screen.getByRole('button', { name: /create message/i })
      await user.click(submitButton)

      // Verify validation errors
      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument()
        expect(screen.getByText(/description is required/i)).toBeInTheDocument()
        expect(screen.getByText(/contact phone is required/i)).toBeInTheDocument()
      })
    })
  })

  describe('Message Display and Search Flow', () => {
    it('should load and display messages', async () => {
      // Mock successful messages fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messages: mockMessages })
      })

      render(
        <TestWrapper>
          <MessageList />
        </TestWrapper>
      )

      // Verify messages are displayed
      await waitFor(() => {
        expect(screen.getByText('Test Message 1')).toBeInTheDocument()
        expect(screen.getByText('Test Message 2')).toBeInTheDocument()
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      })

      // Verify message count is displayed
      expect(screen.getByText('2 messages')).toBeInTheDocument()
    })

    it('should handle search functionality', async () => {
      // Mock initial messages fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messages: mockMessages })
      })

      // Mock search results
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messages: [mockMessages[0]] })
      })

      render(
        <TestWrapper>
          <MessageList />
        </TestWrapper>
      )

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Test Message 1')).toBeInTheDocument()
      })

      // Perform search
      const searchInput = screen.getByPlaceholderText(/search messages/i)
      await userEvent.type(searchInput, 'Test Message 1')

      // Verify search API call
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/messages?search=Test Message 1')
      })
    })

    it('should handle empty search results', async () => {
      // Mock initial messages fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messages: mockMessages })
      })

      // Mock empty search results
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messages: [] })
      })

      render(
        <TestWrapper>
          <MessageList />
        </TestWrapper>
      )

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Test Message 1')).toBeInTheDocument()
      })

      // Perform search with no results
      const searchInput = screen.getByPlaceholderText(/search messages/i)
      await userEvent.type(searchInput, 'nonexistent')

      // Verify empty state is shown
      await waitFor(() => {
        expect(screen.getByText('No messages found')).toBeInTheDocument()
        expect(screen.getByText('Try adjusting your search terms.')).toBeInTheDocument()
      })
    })

    it('should handle message loading errors', async () => {
      // Mock API error
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      render(
        <TestWrapper>
          <MessageList />
        </TestWrapper>
      )

      // Verify error message is displayed
      await waitFor(() => {
        expect(screen.getByText('Failed to load messages. Please try again.')).toBeInTheDocument()
      })
    })
  })

  describe('Message Interaction Flow', () => {
    it('should handle message view details', async () => {
      // Mock successful messages fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messages: mockMessages })
      })

      const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {})

      render(
        <TestWrapper>
          <MessageList />
        </TestWrapper>
      )

      // Wait for messages to load
      await waitFor(() => {
        expect(screen.getByText('Test Message 1')).toBeInTheDocument()
      })

      // Click view details button
      const viewButtons = screen.getAllByText('View Details')
      await userEvent.click(viewButtons[0])

      // Verify alert was called
      expect(mockAlert).toHaveBeenCalledWith('Viewing message: Test Message 1')

      mockAlert.mockRestore()
    })

    it('should refresh messages when refresh button is clicked', async () => {
      // Mock initial and refresh fetch calls
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ messages: mockMessages })
      })

      render(
        <TestWrapper>
          <MessageList />
        </TestWrapper>
      )

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Test Message 1')).toBeInTheDocument()
      })

      // Click refresh button
      const refreshButton = screen.getByText('Refresh')
      await userEvent.click(refreshButton)

      // Verify API was called twice (initial + refresh)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })
})