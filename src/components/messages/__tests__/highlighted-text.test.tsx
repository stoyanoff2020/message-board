import { render, screen } from '@testing-library/react'
import { HighlightedText } from '../highlighted-text'

describe('HighlightedText', () => {
  it('renders text without highlighting when no search term', () => {
    render(<HighlightedText text="Hello world" searchQuery="" />)
    
    expect(screen.getByText('Hello world')).toBeInTheDocument()
    expect(screen.queryByRole('mark')).not.toBeInTheDocument()
  })

  it('renders text without highlighting when search term is empty', () => {
    render(<HighlightedText text="Hello world" searchQuery="" />)
    
    expect(screen.getByText('Hello world')).toBeInTheDocument()
    expect(screen.queryByRole('mark')).not.toBeInTheDocument()
  })

  it('highlights single occurrence of search term', () => {
    render(<HighlightedText text="Hello world" searchQuery="world" />)
    
    expect(screen.getByText('Hello ')).toBeInTheDocument()
    expect(screen.getByText('world')).toBeInTheDocument()
    
    const highlightedElement = screen.getByText('world')
    expect(highlightedElement.tagName.toLowerCase()).toBe('mark')
  })

  it('highlights multiple occurrences of search term', () => {
    render(<HighlightedText text="Hello world, wonderful world" searchQuery="world" />)
    
    expect(screen.getByText('Hello ')).toBeInTheDocument()
    expect(screen.getByText(', wonderful ')).toBeInTheDocument()
    
    const highlightedElements = screen.getAllByText('world')
    expect(highlightedElements).toHaveLength(2)
    highlightedElements.forEach(element => {
      expect(element.tagName.toLowerCase()).toBe('mark')
    })
  })

  it('highlights search term case-insensitively', () => {
    render(<HighlightedText text="Hello World" searchQuery="world" />)
    
    expect(screen.getByText('Hello ')).toBeInTheDocument()
    
    const highlightedElement = screen.getByText('World')
    expect(highlightedElement.tagName.toLowerCase()).toBe('mark')
  })

  it('highlights partial matches', () => {
    render(<HighlightedText text="JavaScript is awesome" searchQuery="Script" />)
    
    expect(screen.getByText('Java')).toBeInTheDocument()
    expect(screen.getByText(' is awesome')).toBeInTheDocument()
    
    const highlightedElement = screen.getByText('Script')
    expect(highlightedElement.tagName.toLowerCase()).toBe('mark')
  })

  it('handles special regex characters in search term', () => {
    render(<HighlightedText text="Price: $10.99" searchQuery="$10.99" />)
    
    expect(screen.getByText('Price: ')).toBeInTheDocument()
    
    const highlightedElement = screen.getByText('$10.99')
    expect(highlightedElement.tagName.toLowerCase()).toBe('mark')
  })

  it('handles empty text', () => {
    render(<HighlightedText text="" searchQuery="test" />)
    
    // Should render empty span
    const container = document.querySelector('span')
    expect(container).toBeInTheDocument()
  })

  it('handles search term longer than text', () => {
    render(<HighlightedText text="Hi" searchQuery="Hello world" />)
    
    expect(screen.getByText('Hi')).toBeInTheDocument()
    expect(screen.queryByRole('mark')).not.toBeInTheDocument()
  })

  it('highlights overlapping matches correctly', () => {
    render(<HighlightedText text="aaaa" searchQuery="aa" />)
    
    // Should highlight all occurrences of "aa"
    const highlightedElements = screen.getAllByText('aa')
    expect(highlightedElements.length).toBeGreaterThan(0)
    highlightedElements.forEach(element => {
      expect(element.tagName.toLowerCase()).toBe('mark')
    })
  })

  it('preserves whitespace in text', () => {
    render(<HighlightedText text="  Hello   world  " searchQuery="Hello" />)
    
    expect(screen.getByText('  ')).toBeInTheDocument()
    expect(screen.getByText('   world  ')).toBeInTheDocument()
    
    const highlightedElement = screen.getByText('Hello')
    expect(highlightedElement.tagName.toLowerCase()).toBe('mark')
  })

  it('handles unicode characters', () => {
    render(<HighlightedText text="Café résumé naïve" searchQuery="résumé" />)
    
    expect(screen.getByText('Café ')).toBeInTheDocument()
    expect(screen.getByText(' naïve')).toBeInTheDocument()
    
    const highlightedElement = screen.getByText('résumé')
    expect(highlightedElement.tagName.toLowerCase()).toBe('mark')
  })

  it('applies custom className when provided', () => {
    render(<HighlightedText text="Hello world" searchQuery="world" className="custom-class" />)
    
    const container = document.querySelector('.custom-class')
    expect(container).toBeInTheDocument()
  })

  it('handles very long text efficiently', () => {
    const longText = 'Lorem ipsum '.repeat(1000) + 'dolor sit amet'
    render(<HighlightedText text={longText} searchQuery="dolor" />)
    
    const highlightedElement = screen.getByText('dolor')
    expect(highlightedElement.tagName.toLowerCase()).toBe('mark')
  })

  it('handles search term with only whitespace', () => {
    render(<HighlightedText text="Hello world" searchQuery="   " />)
    
    expect(screen.getByText('Hello world')).toBeInTheDocument()
    expect(screen.queryByRole('mark')).not.toBeInTheDocument()
  })
})