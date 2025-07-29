'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Loader2, Shield, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface AdminGuardProps {
  children: React.ReactNode
  redirectTo?: string
  fallback?: React.ReactNode
  showAccessDenied?: boolean
}

/**
 * AdminGuard component for protecting admin-only routes
 * This component ensures only authenticated admin users can access protected content
 */
export function AdminGuard({
  children,
  redirectTo,
  fallback,
  showAccessDenied = true
}: AdminGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return // Wait for auth state to load

    // If user is not authenticated, redirect to login
    if (!user) {
      const returnUrl = pathname !== '/' ? `?returnUrl=${encodeURIComponent(pathname)}` : ''
      const loginUrl = `/login${returnUrl}`
      router.push(loginUrl)
      return
    }

    // If user is not admin, redirect to specified route or home
    if (!user.isAdmin) {
      router.push(redirectTo || '/')
      return
    }

    // If user account is not active
    if (!user.isActive) {
      router.push('/account-disabled')
      return
    }
  }, [user, loading, redirectTo, router, pathname])

  // Show loading state while checking authentication
  if (loading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Verifying admin access...</p>
          </div>
        </div>
      )
    )
  }

  // If user is not authenticated, don't render children
  if (!user) {
    return null
  }

  // If user is not admin, show access denied or don't render children
  if (!user.isAdmin) {
    if (showAccessDenied) {
      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="max-w-md w-full">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Access Denied</h3>
                    <p>You don't have permission to access this admin area. Only administrators can view this content.</p>
                  </div>
                  <Button 
                    onClick={() => router.push('/')}
                    variant="outline"
                    className="w-full"
                  >
                    Return to Home
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )
    }
    return null
  }

  // If user account is not active, don't render children
  if (!user.isActive) {
    return null
  }

  // Render children if all checks pass
  return <>{children}</>
}

/**
 * Hook to check if current user has admin access
 */
export function useAdminAccess() {
  const { user, loading } = useAuth()
  
  return {
    isAdmin: user?.isAdmin === true,
    isAuthenticated: !!user,
    isActive: user?.isActive === true,
    loading,
    hasAdminAccess: user?.isAdmin === true && user?.isActive === true
  }
}

/**
 * Component wrapper for admin-only content within a page
 * Shows a message instead of redirecting when access is denied
 */
export function AdminOnly({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  const { hasAdminAccess, loading } = useAdminAccess()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!hasAdminAccess) {
    return fallback || (
      <Alert className="border-amber-200 bg-amber-50">
        <Shield className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          This content is only available to administrators.
        </AlertDescription>
      </Alert>
    )
  }

  return <>{children}</>
}