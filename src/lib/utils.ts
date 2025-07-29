import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Phone number validation utility
export function validatePhoneNumber(phone: string): boolean {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Check if it's a valid length (10-15 digits)
  if (cleaned.length < 10 || cleaned.length > 15) {
    return false
  }
  
  // Check if it starts with 0 (invalid for most formats)
  if (cleaned.startsWith('0')) {
    return false
  }
  
  // For US numbers (10 digits), first digit should be 2-9
  if (cleaned.length === 10 && (cleaned[0] < '2' || cleaned[0] > '9')) {
    return false
  }
  
  // For US numbers with country code (11 digits starting with 1)
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    if (cleaned[1] < '2' || cleaned[1] > '9') {
      return false
    }
  }
  
  return true
}

// Format phone number for display
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 10) {
    // US format: (123) 456-7890
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    // US format with country code: +1 (123) 456-7890
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }
  
  // For other formats, just return the cleaned number
  return cleaned
}

// Date formatting utility
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Text truncation utility
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// Search highlighting utility
export function highlightSearchTerms(text: string, searchQuery: string): string {
  if (!searchQuery.trim()) return text
  
  const query = searchQuery.trim()
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  
  return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>')
}

// Extract highlighted text parts for React rendering
export function getHighlightedTextParts(text: string, searchQuery: string): Array<{ text: string; highlighted: boolean }> {
  if (!searchQuery.trim()) {
    return [{ text, highlighted: false }]
  }
  
  const query = searchQuery.trim()
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts: Array<{ text: string; highlighted: boolean }> = []
  
  let lastIndex = 0
  let match
  
  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push({
        text: text.slice(lastIndex, match.index),
        highlighted: false
      })
    }
    
    // Add the highlighted match
    parts.push({
      text: match[0],
      highlighted: true
    })
    
    lastIndex = match.index + match[0].length
  }
  
  // Add remaining text after the last match
  if (lastIndex < text.length) {
    parts.push({
      text: text.slice(lastIndex),
      highlighted: false
    })
  }
  
  // If no parts were added (no matches and empty text), return the original text
  if (parts.length === 0) {
    return [{ text, highlighted: false }]
  }
  
  return parts
}
