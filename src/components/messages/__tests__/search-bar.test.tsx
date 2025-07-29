import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from '../search-bar'

describe('SearchBar', () => {
  let mockOnSearch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockOnSearch = vi.fn()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders search input with placeholder', () => {
    render(<SearchBar onSearch={mockOnSearch} />)

    const input = screen.getByPlaceholderText('Search messages...')
    expect(input).toBeInTheDocument()
  })

  it('renders custom placeholder when provided', () => {
    render(<SearchBar onSearch={mockOnSearch} placeholder="Custom placeholder" />)

    const input = screen.getByPlaceholderText('Custom placeholder')
    expect(input).toBeInTheDocument()
  })

  it('renders with initial value', () => {
    render(<SearchBar onSearch={mockOnSearch} initialValue="initial search" />)

    const input = screen.getByDisplayValue('initial search')
    expect(input).toBeInTheDocument()
  })

  it('shows search icon', () => {
    render(<SearchBar onSearch={mockOnSearch} />)

    // Search for the SVG element by its class or data-testid
    const searchIcon = document.querySelector('.lucide-search')
    expect(searchIcon).toBeInTheDocument()
  })

  it('debounces search input', async () => {
    render(<SearchBar onSearch={mockOnSearch} debounceMs={300} />)

    const input = screen.getByPlaceholderText('Search messages...')
    
    // Clear the initial call
    mockOnSearch.mockClear()
    
    // Type quickly
    act(() => {
      fireEvent.change(input, { target: { value: 'test' } })
    })
    
    // Should not call onSearch immediately after typing
    expect(mockOnSearch).not.toHaveBeenCalled()
    
    // Fast forward time
    act(() => {
      vi.advanceTimersByTime(300)
    })
    
    // Should call onSearch after debounce
    expect(mockOnSearch).toHaveBeenCalledWith('test')
  })

  it('calls onSearch immediately on form submit', async () => {
    render(<SearchBar onSearch={mockOnSearch} debounceMs={300} />)

    const input = screen.getByPlaceholderText('Search messages...')
    const form = document.querySelector('form')
    
    fireEvent.change(input, { target: { value: 'test' } })
    fireEvent.submit(form!)
    
    // Should call onSearch immediately without waiting for debounce
    expect(mockOnSearch).toHaveBeenCalledWith('test')
  })

  it('shows clear button when input has value', async () => {
    render(<SearchBar onSearch={mockOnSearch} />)

    const input = screen.getByPlaceholderText('Search messages...')
    
    // Initially no clear button
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    
    // Type something
    fireEvent.change(input, { target: { value: 'test' } })
    
    // Clear button should appear
    const clearButton = screen.getByRole('button')
    expect(clearButton).toBeInTheDocument()
  })

  it('clears input when clear button is clicked', async () => {
    render(<SearchBar onSearch={mockOnSearch} />)

    const input = screen.getByPlaceholderText('Search messages...')
    
    // Type something
    fireEvent.change(input, { target: { value: 'test' } })
    
    // Click clear button
    const clearButton = screen.getByRole('button')
    fireEvent.click(clearButton)
    
    // Input should be cleared
    expect(input).toHaveValue('')
    
    // Should trigger search with empty string after debounce
    vi.advanceTimersByTime(300)
    expect(mockOnSearch).toHaveBeenCalledWith('')
  })

  it('handles multiple rapid changes correctly', async () => {
    render(<SearchBar onSearch={mockOnSearch} debounceMs={300} />)

    const input = screen.getByPlaceholderText('Search messages...')
    
    // Clear the initial call
    mockOnSearch.mockClear()
    
    // Type multiple characters rapidly
    act(() => {
      fireEvent.change(input, { target: { value: 'a' } })
      vi.advanceTimersByTime(100)
      fireEvent.change(input, { target: { value: 'ab' } })
      vi.advanceTimersByTime(100)
      fireEvent.change(input, { target: { value: 'abc' } })
    })
    
    // Should not have called onSearch yet
    expect(mockOnSearch).not.toHaveBeenCalled()
    
    // Fast forward past debounce time
    act(() => {
      vi.advanceTimersByTime(300)
    })
    
    // Should call once with final value
    expect(mockOnSearch).toHaveBeenCalledTimes(1)
    expect(mockOnSearch).toHaveBeenCalledWith('abc')
  })

  it('calls onSearch with initial value on mount', () => {
    render(<SearchBar onSearch={mockOnSearch} initialValue="initial" />)

    // Should call onSearch with initial value immediately
    expect(mockOnSearch).toHaveBeenCalledWith('initial')
  })

  it('prevents form submission default behavior', () => {
    render(<SearchBar onSearch={mockOnSearch} />)

    const form = document.querySelector('form')
    const input = screen.getByPlaceholderText('Search messages...')
    
    fireEvent.change(input, { target: { value: 'test' } })
    
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
    const preventDefaultSpy = vi.spyOn(submitEvent, 'preventDefault')
    
    fireEvent(form!, submitEvent)
    
    expect(preventDefaultSpy).toHaveBeenCalled()
  })

  it('uses custom debounce time', async () => {
    render(<SearchBar onSearch={mockOnSearch} debounceMs={500} />)

    const input = screen.getByPlaceholderText('Search messages...')
    
    // Clear the initial call
    mockOnSearch.mockClear()
    
    act(() => {
      fireEvent.change(input, { target: { value: 'test' } })
    })
    
    // Should not call after 300ms
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(mockOnSearch).not.toHaveBeenCalled()
    
    // Should call after 500ms
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(mockOnSearch).toHaveBeenCalledWith('test')
  })
})