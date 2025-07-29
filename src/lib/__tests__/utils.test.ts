import { describe, it, expect } from 'vitest'
import { validatePhoneNumber, formatPhoneNumber, highlightSearchTerms, getHighlightedTextParts } from '../utils'

describe('validatePhoneNumber', () => {
  it('should validate US phone numbers', () => {
    expect(validatePhoneNumber('(555) 123-4567')).toBe(true)
    expect(validatePhoneNumber('555-123-4567')).toBe(true)
    expect(validatePhoneNumber('555.123.4567')).toBe(true)
    expect(validatePhoneNumber('555 123 4567')).toBe(true)
    expect(validatePhoneNumber('5551234567')).toBe(true)
  })

  it('should validate international phone numbers', () => {
    expect(validatePhoneNumber('+1 555 123 4567')).toBe(true)
    expect(validatePhoneNumber('+44 20 7946 0958')).toBe(true)
    expect(validatePhoneNumber('+33 1 42 86 83 26')).toBe(true)
  })

  it('should reject invalid phone numbers', () => {
    expect(validatePhoneNumber('123')).toBe(false)
    expect(validatePhoneNumber('abc-def-ghij')).toBe(false)
    expect(validatePhoneNumber('')).toBe(false)
    expect(validatePhoneNumber('555-123-456')).toBe(false) // too short
    expect(validatePhoneNumber('555-123-45678901234')).toBe(false) // too long
  })

  it('should handle edge cases', () => {
    expect(validatePhoneNumber('0000000000')).toBe(false) // starts with 0
    expect(validatePhoneNumber('1234567890')).toBe(false) // starts with 1 (invalid for 10-digit US)
    expect(validatePhoneNumber('2234567890')).toBe(true) // valid 10-digit US number
    expect(validatePhoneNumber('+1234567890123456')).toBe(false) // too long
  })
})

describe('formatPhoneNumber', () => {
  it('should format 10-digit US numbers', () => {
    expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567')
    expect(formatPhoneNumber('555-123-4567')).toBe('(555) 123-4567')
    expect(formatPhoneNumber('(555) 123-4567')).toBe('(555) 123-4567')
  })

  it('should format 11-digit US numbers with country code', () => {
    expect(formatPhoneNumber('15551234567')).toBe('+1 (555) 123-4567')
    expect(formatPhoneNumber('+1 555 123 4567')).toBe('+1 (555) 123-4567')
  })

  it('should return cleaned number for other formats', () => {
    expect(formatPhoneNumber('+44 20 7946 0958')).toBe('442079460958')
    expect(formatPhoneNumber('123456789')).toBe('123456789')
  })
})

describe('highlightSearchTerms', () => {
  it('should return original text when no search query', () => {
    expect(highlightSearchTerms('Hello world', '')).toBe('Hello world')
    expect(highlightSearchTerms('Hello world', '   ')).toBe('Hello world')
  })

  it('should highlight single word match', () => {
    const result = highlightSearchTerms('Hello world', 'Hello')
    expect(result).toBe('<mark class="bg-yellow-200 px-1 rounded">Hello</mark> world')
  })

  it('should highlight multiple matches', () => {
    const result = highlightSearchTerms('Hello world, hello universe', 'hello')
    expect(result).toBe('<mark class="bg-yellow-200 px-1 rounded">Hello</mark> world, <mark class="bg-yellow-200 px-1 rounded">hello</mark> universe')
  })

  it('should be case insensitive', () => {
    const result = highlightSearchTerms('Hello World', 'HELLO')
    expect(result).toBe('<mark class="bg-yellow-200 px-1 rounded">Hello</mark> World')
  })

  it('should escape special regex characters', () => {
    const result = highlightSearchTerms('Price: $10.99 (sale)', '$10.99')
    expect(result).toBe('Price: <mark class="bg-yellow-200 px-1 rounded">$10.99</mark> (sale)')
  })

  it('should handle partial word matches', () => {
    const result = highlightSearchTerms('JavaScript is awesome', 'Script')
    expect(result).toBe('Java<mark class="bg-yellow-200 px-1 rounded">Script</mark> is awesome')
  })
})

describe('getHighlightedTextParts', () => {
  it('should return single part when no search query', () => {
    const result = getHighlightedTextParts('Hello world', '')
    expect(result).toEqual([{ text: 'Hello world', highlighted: false }])
  })

  it('should return single part when search query is whitespace', () => {
    const result = getHighlightedTextParts('Hello world', '   ')
    expect(result).toEqual([{ text: 'Hello world', highlighted: false }])
  })

  it('should split text with single match', () => {
    const result = getHighlightedTextParts('Hello world', 'Hello')
    expect(result).toEqual([
      { text: 'Hello', highlighted: true },
      { text: ' world', highlighted: false }
    ])
  })

  it('should split text with multiple matches', () => {
    const result = getHighlightedTextParts('Hello world, hello universe', 'hello')
    expect(result).toEqual([
      { text: 'Hello', highlighted: true },
      { text: ' world, ', highlighted: false },
      { text: 'hello', highlighted: true },
      { text: ' universe', highlighted: false }
    ])
  })

  it('should be case insensitive', () => {
    const result = getHighlightedTextParts('Hello World', 'HELLO')
    expect(result).toEqual([
      { text: 'Hello', highlighted: true },
      { text: ' World', highlighted: false }
    ])
  })

  it('should handle match at the beginning', () => {
    const result = getHighlightedTextParts('Hello world', 'Hello')
    expect(result).toEqual([
      { text: 'Hello', highlighted: true },
      { text: ' world', highlighted: false }
    ])
  })

  it('should handle match at the end', () => {
    const result = getHighlightedTextParts('Hello world', 'world')
    expect(result).toEqual([
      { text: 'Hello ', highlighted: false },
      { text: 'world', highlighted: true }
    ])
  })

  it('should handle match in the middle', () => {
    const result = getHighlightedTextParts('Hello beautiful world', 'beautiful')
    expect(result).toEqual([
      { text: 'Hello ', highlighted: false },
      { text: 'beautiful', highlighted: true },
      { text: ' world', highlighted: false }
    ])
  })

  it('should handle consecutive matches', () => {
    const result = getHighlightedTextParts('aaa', 'a')
    expect(result.length).toBeGreaterThan(0)
    expect(result.some(part => part.highlighted)).toBe(true)
  })

  it('should handle no matches', () => {
    const result = getHighlightedTextParts('Hello world', 'xyz')
    expect(result).toEqual([{ text: 'Hello world', highlighted: false }])
  })

  it('should escape special regex characters', () => {
    const result = getHighlightedTextParts('Price: $10.99 (sale)', '$10.99')
    expect(result).toEqual([
      { text: 'Price: ', highlighted: false },
      { text: '$10.99', highlighted: true },
      { text: ' (sale)', highlighted: false }
    ])
  })

  it('should handle empty text', () => {
    const result = getHighlightedTextParts('', 'test')
    expect(result).toEqual([{ text: '', highlighted: false }])
  })

  it('should trim search query', () => {
    const result = getHighlightedTextParts('Hello world', '  Hello  ')
    expect(result).toEqual([
      { text: 'Hello', highlighted: true },
      { text: ' world', highlighted: false }
    ])
  })
})