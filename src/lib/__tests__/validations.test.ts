import { describe, it, expect } from 'vitest'
import { messageSchema, MessageFormData } from '../validations'

describe('messageSchema', () => {
  const validMessageData: MessageFormData = {
    title: 'Test Message Title',
    description: 'This is a test message description that is long enough to pass validation.',
    contactPhone: '(555) 123-4567'
  }

  describe('title validation', () => {
    it('should accept valid titles', () => {
      const result = messageSchema.safeParse(validMessageData)
      expect(result.success).toBe(true)
    })

    it('should reject empty title', () => {
      const result = messageSchema.safeParse({
        ...validMessageData,
        title: ''
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Title is required')
      }
    })

    it('should reject title that is too short', () => {
      const result = messageSchema.safeParse({
        ...validMessageData,
        title: 'Hi'
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Title must be at least 3 characters long')
      }
    })

    it('should reject title that is too long', () => {
      const result = messageSchema.safeParse({
        ...validMessageData,
        title: 'a'.repeat(256)
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Title must be less than 255 characters')
      }
    })
  })

  describe('description validation', () => {
    it('should accept valid descriptions', () => {
      const result = messageSchema.safeParse(validMessageData)
      expect(result.success).toBe(true)
    })

    it('should reject empty description', () => {
      const result = messageSchema.safeParse({
        ...validMessageData,
        description: ''
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Description is required')
      }
    })

    it('should reject description that is too short', () => {
      const result = messageSchema.safeParse({
        ...validMessageData,
        description: 'Too short'
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Description must be at least 10 characters long')
      }
    })

    it('should reject description that is too long', () => {
      const result = messageSchema.safeParse({
        ...validMessageData,
        description: 'a'.repeat(2001)
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Description must be less than 2000 characters')
      }
    })
  })

  describe('contactPhone validation', () => {
    it('should accept valid phone numbers', () => {
      const validPhones = [
        '(555) 123-4567',
        '555-123-4567',
        '555.123.4567',
        '555 123 4567',
        '5551234567',
        '+1 555 123 4567'
      ]

      validPhones.forEach(phone => {
        const result = messageSchema.safeParse({
          ...validMessageData,
          contactPhone: phone
        })
        expect(result.success).toBe(true)
      })
    })

    it('should reject empty phone number', () => {
      const result = messageSchema.safeParse({
        ...validMessageData,
        contactPhone: ''
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Contact phone is required')
      }
    })

    it('should reject invalid phone numbers', () => {
      const invalidPhones = [
        '123',
        'abc-def-ghij',
        '555-123-456', // too short
        '0000000000', // starts with 0
        '555-123-45678901234' // too long
      ]

      invalidPhones.forEach(phone => {
        const result = messageSchema.safeParse({
          ...validMessageData,
          contactPhone: phone
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Please enter a valid phone number')
        }
      })
    })
  })

  describe('complete validation', () => {
    it('should validate complete valid message', () => {
      const result = messageSchema.safeParse(validMessageData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validMessageData)
      }
    })

    it('should return multiple errors for multiple invalid fields', () => {
      const result = messageSchema.safeParse({
        title: '',
        description: '',
        contactPhone: ''
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        // Each field can have multiple validation errors, so we check that all fields have errors
        const fieldPaths = result.error.issues.map(issue => issue.path[0])
        expect(fieldPaths).toContain('title')
        expect(fieldPaths).toContain('description')
        expect(fieldPaths).toContain('contactPhone')
        expect(result.error.issues.length).toBeGreaterThan(0)
      }
    })
  })
})