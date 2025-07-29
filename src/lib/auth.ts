import { createSupabaseClient, createSupabaseServerClient, supabaseAdmin } from './supabase'
import { User, DatabaseUser, AuthError } from '@/types/auth'
import { AuthError as SupabaseAuthError } from '@supabase/supabase-js'

/**
 * Convert database user row to User interface
 */
export function mapDatabaseUserToUser(dbUser: DatabaseUser): User {
  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    isAdmin: dbUser.is_admin,
    isActive: dbUser.is_active,
    createdAt: new Date(dbUser.created_at),
    updatedAt: new Date(dbUser.updated_at)
  }
}

/**
 * Handle Supabase authentication errors
 */
export function handleAuthError(error: SupabaseAuthError | Error): AuthError {
  if ('message' in error) {
    // Map common Supabase auth error messages to user-friendly messages
    switch (error.message) {
      case 'Invalid login credentials':
        return {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password. Please try again.'
        }
      case 'User already registered':
        return {
          code: 'USER_EXISTS',
          message: 'An account with this email already exists.',
          field: 'email'
        }
      case 'Email not confirmed':
        return {
          code: 'EMAIL_NOT_CONFIRMED',
          message: 'Please check your email and click the confirmation link.'
        }
      case 'Password should be at least 6 characters':
        return {
          code: 'WEAK_PASSWORD',
          message: 'Password must be at least 8 characters long.',
          field: 'password'
        }
      default:
        return {
          code: 'AUTH_ERROR',
          message: error.message || 'An authentication error occurred.'
        }
    }
  }
  
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred. Please try again.'
  }
}

/**
 * Get current user from Supabase session (client-side)
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = createSupabaseClient()
    
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user) {
      return null
    }
    
    // Get user profile from database
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()
    
    if (profileError || !userProfile) {
      return null
    }
    
    return mapDatabaseUserToUser(userProfile)
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Get current user from Supabase session (server-side)
 */
export async function getCurrentUserServer(): Promise<User | null> {
  try {
    const supabase = createSupabaseServerClient()
    
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user) {
      return null
    }
    
    // Get user profile from database
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()
    
    if (profileError || !userProfile) {
      return null
    }
    
    return mapDatabaseUserToUser(userProfile)
  } catch (error) {
    console.error('Error getting current user (server):', error)
    return null
  }
}

/**
 * Sign up a new user
 */
export async function signUp(email: string, password: string, name: string): Promise<User> {
  try {
    const supabase = createSupabaseClient()
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    })
    
    if (authError) {
      throw handleAuthError(authError)
    }
    
    if (!authData.user) {
      throw new Error('Failed to create user account')
    }
    
    // Create user profile in database
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email!,
        name,
        is_admin: false,
        is_active: true
      })
      .select()
      .single()
    
    if (profileError) {
      // If profile creation fails, we should clean up the auth user
      await supabase.auth.signOut()
      throw new Error('Failed to create user profile')
    }
    
    return mapDatabaseUserToUser(userProfile)
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      throw error // Re-throw AuthError
    }
    throw handleAuthError(error as Error)
  }
}

/**
 * Sign in an existing user
 */
export async function signIn(email: string, password: string): Promise<User> {
  try {
    const supabase = createSupabaseClient()
    
    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (authError) {
      throw handleAuthError(authError)
    }
    
    if (!authData.user) {
      throw new Error('Failed to sign in')
    }
    
    // Get user profile from database
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()
    
    if (profileError || !userProfile) {
      throw new Error('Failed to load user profile')
    }
    
    // Check if user account is active
    if (!userProfile.is_active) {
      await supabase.auth.signOut()
      throw {
        code: 'ACCOUNT_DISABLED',
        message: 'Your account has been disabled. Please contact support.'
      }
    }
    
    return mapDatabaseUserToUser(userProfile)
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      throw error // Re-throw AuthError
    }
    throw handleAuthError(error as Error)
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      throw handleAuthError(error)
    }
  } catch (error) {
    throw handleAuthError(error as Error)
  }
}

/**
 * Check if user is authenticated (client-side)
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const user = await getCurrentUser()
    return user !== null
  } catch (error) {
    return false
  }
}

/**
 * Check if user is authenticated (server-side)
 */
export async function isAuthenticatedServer(): Promise<boolean> {
  try {
    const user = await getCurrentUserServer()
    return user !== null
  } catch (error) {
    return false
  }
}

/**
 * Check if user is admin (client-side)
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const user = await getCurrentUser()
    return user?.isAdmin === true
  } catch (error) {
    return false
  }
}

/**
 * Check if user is admin (server-side)
 */
export async function isAdminServer(): Promise<boolean> {
  try {
    const user = await getCurrentUserServer()
    return user?.isAdmin === true
  } catch (error) {
    return false
  }
}

/**
 * Refresh user session
 */
export async function refreshSession(): Promise<User | null> {
  try {
    const supabase = createSupabaseClient()
    
    // Refresh the session
    const { data: { session }, error } = await supabase.auth.refreshSession()
    
    if (error || !session?.user) {
      return null
    }
    
    // Get updated user profile
    return await getCurrentUser()
  } catch (error) {
    console.error('Error refreshing session:', error)
    return null
  }
}