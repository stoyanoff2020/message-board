import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MessageCard } from '../message-card'
import { Message } from '@/types/message'

const mockMessage: Message = {
  id: '1',
  title: 'Test Message Title',
  description: 'This is a test message description that is long enough to test truncation functionality and other features of the message card component. This text needs to be longer than 150 characters to trigger the truncation feature properly.',
  publisherName: 'John Doe',
  contactPhone: '(555) 123-4567',
  userId: 'user-1',
  createdAt: new Date('2023-01-01T12:00:00Z'),
  updatedAt: new Date('2023-01-01T12:00:00Z')
}

describe('MessageCard', () => {
  it('renders message information correctly', () => {
    render(<MessageCard message={mockMessage} />)

    expect(screen.getByText('Test Message Title')).toBeInTheDocument()
    expect(screen.getByText('By John Doe')).toBeInTheDocument()
    expect(screen.getByText('(555) 123-4567')).toBeInTheDocument()
    expect(screen.getByText(/Jan 1, 2023/)).toBeInTheDocument()
  })

  it('truncates long descriptions by default', () => {
    render(<MessageCard message={mockMessage} />)

    const description = screen.getByText(/This is a test message description/)
    expect(description.textContent).not.toBe(mockMessage.description)
    expect(screen.getByText('Read more...')).toBeInTheDocument()
  })

  it('shows full description when showFullDescription is true', () => {
    render(<MessageCard message={mockMessage} showFullDescription={true} />)

    expect(screen.getByText(mockMessage.description)).toBeInTheDocument()
    expect(screen.queryByText('Read more...')).not.toBeInTheDocument()
  })

  it('calls onViewDetails when "Read more" is clicked', async () => {
    const user = userEvent.setup()
    const mockOnViewDetails = vi.fn()
    
    render(<MessageCard message={mockMessage} onViewDetails={mockOnViewDetails} />)

    const readMoreButton = screen.getByText('Read more...')
    await user.click(readMoreButton)

    expect(mockOnViewDetails).toHaveBeenCalledWith(mockMessage)
  })

  it('calls onViewDetails when "View Details" button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnViewDetails = vi.fn()
    
    render(<MessageCard message={mockMessage} onViewDetails={mockOnViewDetails} />)

    const viewDetailsButton = screen.getByText('View Details')
    await user.click(viewDetailsButton)

    expect(mockOnViewDetails).toHaveBeenCalledWith(mockMessage)
  })

  it('calls onViewDetails when card is clicked', async () => {
    const user = userEvent.setup()
    const mockOnViewDetails = vi.fn()
    
    render(<MessageCard message={mockMessage} onViewDetails={mockOnViewDetails} />)

    const card = screen.getByText('Test Message Title').closest('[role="button"], div')
    if (card) {
      await user.click(card)
      expect(mockOnViewDetails).toHaveBeenCalledWith(mockMessage)
    }
  })

  it('renders phone number as clickable link', () => {
    render(<MessageCard message={mockMessage} />)

    const phoneLink = screen.getByRole('link', { name: '(555) 123-4567' })
    expect(phoneLink).toHaveAttribute('href', 'tel:(555) 123-4567')
  })

  it('does not show "View Details" button when showFullDescription is true', () => {
    render(<MessageCard message={mockMessage} showFullDescription={true} />)

    expect(screen.queryByText('View Details')).not.toBeInTheDocument()
  })

  it('does not show "Read more" for short descriptions', () => {
    const shortMessage = {
      ...mockMessage,
      description: 'Short description'
    }

    render(<MessageCard message={shortMessage} />)

    expect(screen.queryByText('Read more...')).not.toBeInTheDocument()
    expect(screen.getByText('Short description')).toBeInTheDocument()
  })

  it('prevents event propagation when clicking phone link', async () => {
    const user = userEvent.setup()
    const mockOnViewDetails = vi.fn()
    
    render(<MessageCard message={mockMessage} onViewDetails={mockOnViewDetails} />)

    const phoneLink = screen.getByRole('link', { name: '(555) 123-4567' })
    await user.click(phoneLink)

    // onViewDetails should not be called when clicking the phone link
    expect(mockOnViewDetails).not.toHaveBeenCalled()
  })

  it('prevents event propagation when clicking "Read more" button', async () => {
    const user = userEvent.setup()
    const mockOnViewDetails = vi.fn()
    
    render(<MessageCard message={mockMessage} onViewDetails={mockOnViewDetails} />)

    const readMoreButton = screen.getByText('Read more...')
    await user.click(readMoreButton)

    // onViewDetails should be called once (from the button click), not twice (from card click)
    expect(mockOnViewDetails).toHaveBeenCalledTimes(1)
  })
})