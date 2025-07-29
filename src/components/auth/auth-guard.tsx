'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  redirectTo?: string
  fallback?: React.ReactNode
}

/**
 * AuthGuard component for protecting routes based on authentication status
 */
export function AuthGuard({
  children,
  requireAuth = true,
  requireAdmin = false,
  redirectTo,
  fallback
}: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return // Wait for auth state to load

    // If authentication is required but user is not authenticated
    if (requireAuth && !user) {
      const returnUrl = pathname !== '/' ? `?returnUrl=${encodeURIComponent(pathname)}` : ''
      const loginUrl = redirectTo || `/login${returnUrl}`
      router.push(loginUrl)
      return
    }

    // If admin access is required but user is not admin
    if (requireAdmin && user && !user.isAdmin) {
      router.push(redirectTo || '/')
      return
    }

    // If user account is not active
    if (user && !user.isActive) {
      router.push('/account-disabled')
      return
    }
  }, [user, loading, requireAuth, requireAdmin, redirectTo, router, pathname])

  // Show loading state while checking authentication
  if (loading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )
    )
  }

  // If authentication is required but user is not authenticated, don't render children
  if (requireAuth && !user) {
    return null
  }

  // If admin access is required but user is not admin, don't render children
  if (requireAdmin && (!user || !user.isAdmin)) {
    return null
  }

  // If user account is not active, don't render children
  if (user && !user.isActive) {
    return null
  }

  // Render children if all checks pass
  return <>{children}</>
}

/**
 * Component for protecting routes that require authentication
 */
export function ProtectedRoute({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <AuthGuard requireAuth={true} fallback={fallback}>
      {children}
    </AuthGuard>
  )
}

/**
 * Component for protecting admin-only routes
 */
export function AdminRoute({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <AuthGuard requireAuth={true} requireAdmin={true} fallback={fallback}>
      {children}
    </AuthGuard>
  )
}

/**
 * Component for routes that should only be accessible to unauthenticated users (like login/register)
 */
export function GuestRoute({ children, redirectTo = '/dashboard' }: { children: React.ReactNode; redirectTo?: string }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return // Wait for auth state to load

    // If user is authenticated, redirect to dashboard or specified route
    if (user) {
      router.push(redirectTo)
      return
    }
  }, [user, loading, redirectTo, router])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is authenticated, don't render children
  if (user) {
    return null
  }

  // Render children if user is not authenticated
  return <>{children}</>
}