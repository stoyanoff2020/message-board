import { Database } from '@/lib/supabase'

// Message type based on database schema
export interface Message {
  id: string
  title: string
  description: string
  publisherName: string
  contactPhone: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

// Message form type for creating new messages
export interface MessageForm {
  title: string
  description: string
  contactPhone: string
}

// Message with user information for display
export interface MessageWithUser extends Message {
  user?: {
    id: string
    name: string
    email: string
  }
}

// Database message row type
export type DatabaseMessage = Database['public']['Tables']['messages']['Row']

// Message creation input type
export interface CreateMessageInput {
  title: string
  description: string
  contactPhone: string
  publisherName: string
  userId: string
}

// Message update input type
export interface UpdateMessageInput {
  title?: string
  description?: string
  contactPhone?: string
}

// Message search parameters
export interface MessageSearchParams {
  query?: string
  limit?: number
  offset?: number
  orderBy?: 'created_at' | 'title'
  orderDirection?: 'asc' | 'desc'
}

// Message API response types
export interface MessageListResponse {
  messages: Message[]
  total: number
  hasMore: boolean
}

export interface MessageResponse {
  message: Message
}

// Message error types
export interface MessageError {
  code: string
  message: string
  field?: string
}

// Message validation error type
export interface MessageValidationError {
  field: keyof MessageForm
  message: string
}