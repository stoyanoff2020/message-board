'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useErrorHandler } from '@/hooks/use-error-handler'

// Re-export useAuth for convenience
export { useAuth }

/**
 * Hook for handling authentication redirects
 */
export function useAuthRedirect() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const redirectToLogin = useCallback((returnUrl?: string) => {
    const url = returnUrl ? `/login?returnUrl=${encodeURIComponent(returnUrl)}` : '/login'
    router.push(url)
  }, [router])

  const redirectToHome = useCallback(() => {
    router.push('/')
  }, [router])

  const redirectToDashboard = useCallback(() => {
    router.push('/dashboard')
  }, [router])

  const redirectToAdmin = useCallback(() => {
    router.push('/admin')
  }, [router])

  return {
    user,
    loading,
    redirectToLogin,
    redirectToHome,
    redirectToDashboard,
    redirectToAdmin
  }
}

/**
 * Hook for protected routes that require authentication
 */
export function useRequireAuth(redirectTo: string = '/login') {
  const { user, loading } = useAuth()
  const router = useRouter()

  const checkAuth = useCallback(() => {
    if (!loading && !user) {
      const currentPath = window.location.pathname
      const returnUrl = currentPath !== '/' ? `?returnUrl=${encodeURIComponent(currentPath)}` : ''
      router.push(`${redirectTo}${returnUrl}`)
      return false
    }
    return true
  }, [user, loading, router, redirectTo])

  return {
    user,
    loading,
    isAuthenticated: !!user,
    checkAuth
  }
}

/**
 * Hook for admin-only routes
 */
export function useRequireAdmin(redirectTo: string = '/') {
  const { user, loading } = useAuth()
  const router = useRouter()

  const checkAdmin = useCallback(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
        return false
      }
      if (!user.isAdmin) {
        router.push(redirectTo)
        return false
      }
    }
    return true
  }, [user, loading, router, redirectTo])

  return {
    user,
    loading,
    isAdmin: user?.isAdmin === true,
    isAuthenticated: !!user,
    checkAdmin
  }
}

/**
 * Hook for handling login form submission
 */
export function useLoginForm() {
  const { login, loading, error, clearError } = useAuth()
  const router = useRouter()
  const { handleSuccess } = useErrorHandler({ context: 'LoginForm' })

  const handleLogin = useCallback(async (email: string, password: string, returnUrl?: string) => {
    try {
      await login(email, password)
      handleSuccess('Successfully logged in!')
      // Redirect after successful login
      if (returnUrl) {
        router.push(decodeURIComponent(returnUrl))
      } else {
        router.push('/')
      }
    } catch (error) {
      // Error is already handled by the auth context
      // Just log for debugging
      console.debug('Login failed:', error)
    }
  }, [login, router, handleSuccess])

  return {
    handleLogin,
    loading,
    error,
    clearError
  }
}

/**
 * Hook for handling registration form submission
 */
export function useRegisterForm() {
  const { register, loading, error, clearError } = useAuth()
  const router = useRouter()
  const { handleSuccess } = useErrorHandler({ context: 'RegisterForm' })

  const handleRegister = useCallback(async (email: string, password: string, name: string) => {
    try {
      await register(email, password, name)
      handleSuccess('Account created successfully! Welcome!')
      // Redirect after successful registration
      router.push('/')
    } catch (error) {
      // Error is already handled by the auth context
      console.debug('Registration failed:', error)
    }
  }, [register, router, handleSuccess])

  return {
    handleRegister,
    loading,
    error,
    clearError
  }
}

/**
 * Hook for handling logout
 */
export function useLogout() {
  const { logout, loading } = useAuth()
  const router = useRouter()
  const { handleSuccess } = useErrorHandler({ context: 'Logout' })

  const handleLogout = useCallback(async () => {
    try {
      await logout()
      handleSuccess('Successfully logged out')
      router.push('/login')
    } catch (error) {
      console.debug('Logout failed:', error)
      // Even if logout fails, redirect to login
      router.push('/login')
    }
  }, [logout, router, handleSuccess])

  return {
    handleLogout,
    loading
  }
}