'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { signIn, signUp, signOut, getCurrentUser, handleAuthError } from '@/lib/auth'
import { User, AuthContextType, AuthState } from '@/types/auth'
import { useErrorHandler } from '@/hooks/use-error-handler'
import { parseApiError, logError } from '@/lib/errors'

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Authentication provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  })

  const supabase = createSupabaseClient()
  const { handleError } = useErrorHandler({ showToast: false, context: 'AuthProvider' })

  // Clear error function
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Set loading state
  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }))
  }, [])

  // Set error state
  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, loading: false }))
  }, [])

  // Set user state
  const setUser = useCallback((user: User | null) => {
    setState(prev => ({ ...prev, user, loading: false, error: null }))
  }, [])

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      setLoading(true)
      const user = await getCurrentUser()
      setUser(user)
    } catch (error) {
      console.error('Error refreshing user:', error)
      setUser(null)
    }
  }, [setLoading, setUser])

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true)
      clearError()
      const user = await signIn(email, password)
      setUser(user)
    } catch (error: any) {
      const parsedError = handleError(error)
      setError(parsedError.message)
      throw parsedError
    }
  }, [setLoading, clearError, setUser, setError, handleError])

  // Register function
  const register = useCallback(async (email: string, password: string, name: string) => {
    try {
      setLoading(true)
      clearError()
      const user = await signUp(email, password, name)
      setUser(user)
    } catch (error: any) {
      const parsedError = handleError(error)
      setError(parsedError.message)
      throw parsedError
    }
  }, [setLoading, clearError, setUser, setError, handleError])

  // Logout function
  const logout = useCallback(async () => {
    try {
      setLoading(true)
      await signOut()
      setUser(null)
    } catch (error: any) {
      const parsedError = handleError(error)
      setError(parsedError.message)
      // Even if logout fails, clear the user state
      setUser(null)
    }
  }, [setLoading, setUser, setError, handleError])

  // Initialize auth state and listen for auth changes
  useEffect(() => {
    let mounted = true

    // Get initial session
    const initializeAuth = async () => {
      try {
        const user = await getCurrentUser()
        if (mounted) {
          setUser(user)
        }
      } catch (error) {
        logError(error, 'AuthProvider.initializeAuth')
        if (mounted) {
          setUser(null)
        }
      }
    }

    initializeAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        switch (event) {
          case 'SIGNED_IN':
            if (session?.user) {
              try {
                const user = await getCurrentUser()
                setUser(user)
              } catch (error) {
                logError(error, 'AuthProvider.onAuthStateChange.SIGNED_IN')
                setUser(null)
              }
            }
            break
          case 'SIGNED_OUT':
            setUser(null)
            break
          case 'TOKEN_REFRESHED':
            if (session?.user) {
              try {
                const user = await getCurrentUser()
                setUser(user)
              } catch (error) {
                logError(error, 'AuthProvider.onAuthStateChange.TOKEN_REFRESHED')
                setUser(null)
              }
            }
            break
          default:
            break
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase.auth, setUser])

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshUser,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use the auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook to get current user (convenience hook)
export function useUser() {
  const { user, loading } = useAuth()
  return { user, loading }
}

// Hook to check if user is admin
export function useIsAdmin() {
  const { user, loading } = useAuth()
  return { isAdmin: user?.isAdmin === true, loading }
}