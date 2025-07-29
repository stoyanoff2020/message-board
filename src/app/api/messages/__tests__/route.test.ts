import { describe, it, expect, vi, beforeEach } from 'vitest'

// Test the search query building function directly
import { buildSearchQuery } from '../route'

describe('Search Query Builder', () => {
  describe('buildSearchQuery', () => {
    it('should build full-text search query for normal text', () => {
      const result = buildSearchQuery('javascript react')
      
      expect(result).toContain('to_tsvector')
      expect(result).toContain('javascript & react')
      expect(result).toContain('title.ilike.%javascript react%')
      expect(result).toContain('description.ilike.%javascript react%')
    })

    it('should sanitize special characters', () => {
      const result = buildSearchQuery('test & query | with special chars!')
      
      expect(result).toContain('test & query & with & special & chars')
      // Original query is preserved in ILIKE clauses
      expect(result).toContain('title.ilike.%test & query | with special chars!%')
    })

    it('should handle query with only special characters', () => {
      const result = buildSearchQuery('!@#$%^&*()')
      
      // Should fall back to ILIKE only
      expect(result).not.toContain('to_tsvector')
      expect(result).toContain('title.ilike')
      expect(result).toContain('description.ilike')
    })

    it('should handle empty query', () => {
      const result = buildSearchQuery('')
      
      expect(result).not.toContain('to_tsvector')
      expect(result).toContain('title.ilike.%%')
      expect(result).toContain('description.ilike.%%')
    })

    it('should handle whitespace-only query', () => {
      const result = buildSearchQuery('   ')
      
      expect(result).not.toContain('to_tsvector')
      expect(result).toContain('title.ilike.%%') // Trimmed to empty
    })

    it('should join multiple words with AND operator', () => {
      const result = buildSearchQuery('hello world test')
      
      expect(result).toContain('hello & world & test')
    })

    it('should handle single word', () => {
      const result = buildSearchQuery('javascript')
      
      expect(result).toContain('to_tsvector')
      expect(result).toContain('javascript')
      expect(result).toContain('title.ilike.%javascript%')
    })

    it('should trim whitespace', () => {
      const result = buildSearchQuery('  javascript  ')
      
      expect(result).toContain('javascript')
      // Query is trimmed before being used in ILIKE
      expect(result).toContain('title.ilike.%javascript%')
    })

    it('should handle mixed alphanumeric and special characters', () => {
      const result = buildSearchQuery('test123 @#$ hello')
      
      expect(result).toContain('test123 & hello')
      // Original query is preserved in ILIKE clauses
      expect(result).toContain('title.ilike.%test123 @#$ hello%')
    })

    it('should preserve original query in ILIKE clauses', () => {
      const result = buildSearchQuery('test & special')
      
      expect(result).toContain('title.ilike.%test & special%')
      expect(result).toContain('description.ilike.%test & special%')
    })
  })
})