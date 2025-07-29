import { z } from 'zod'
import { validatePhoneNumber } from './utils'

// User registration validation schema
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name must be less than 50 characters')
})

// User login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
})

// Message creation validation schema
export const messageSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters long')
    .max(255, 'Title must be less than 255 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters long')
    .max(2000, 'Description must be less than 2000 characters'),
  contactPhone: z
    .string()
    .min(1, 'Contact phone is required')
    .refine(validatePhoneNumber, {
      message: 'Please enter a valid phone number'
    })
})

// Search validation schema
export const searchSchema = z.object({
  query: z
    .string()
    .max(100, 'Search query must be less than 100 characters')
    .optional()
})

// User update validation schema
export const userUpdateSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name must be less than 50 characters')
    .optional(),
  isActive: z.boolean().optional(),
  isAdmin: z.boolean().optional()
})

// Type exports for form data
export type RegisterFormData = z.infer<typeof registerSchema>
export type LoginFormData = z.infer<typeof loginSchema>
export type MessageFormData = z.infer<typeof messageSchema>
export type SearchFormData = z.infer<typeof searchSchema>
export type UserUpdateFormData = z.infer<typeof userUpdateSchema>