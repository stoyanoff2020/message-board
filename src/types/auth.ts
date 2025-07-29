import { User as SupabaseUser } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase'

// User type based on database schema
export interface User {
  id: string
  email: string
  name: string
  isAdmin: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Authentication form types (already defined in validations.ts but re-exported here for convenience)
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  email: string
  password: string
  name: string
}

// Authentication state interface
export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

// Authentication context interface
export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  clearError: () => void
}

// Supabase user type
export type SupabaseAuthUser = SupabaseUser

// Database user row type
export type DatabaseUser = Database['public']['Tables']['users']['Row']

// Authentication error types
export interface AuthError {
  code: string
  message: string
  field?: string
}

// Session type
export interface AuthSession {
  user: User
  accessToken: string
  refreshToken: string
  expiresAt: number
}