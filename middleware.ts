import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

// Define protected routes
const protectedRoutes = [
  '/dashboard',
  '/messages',
  '/profile',
  '/settings'
]

// Define admin-only routes
const adminRoutes = [
  '/admin'
]

// Define guest-only routes (should redirect authenticated users)
const guestRoutes = [
  '/login',
  '/register'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
  const isGuestRoute = guestRoutes.some(route => pathname.startsWith(route))

  // Get the session token from cookies
  const sessionToken = request.cookies.get('sb-access-token')?.value || 
                      request.cookies.get('supabase-auth-token')?.value

  const isAuthenticated = !!sessionToken

  // Handle protected routes - redirect to login if not authenticated
  if ((isProtectedRoute || isAdminRoute) && !isAuthenticated) {
    const redirectUrl = new URL('/login', request.url)
    if (pathname !== '/') {
      redirectUrl.searchParams.set('returnUrl', pathname)
    }
    return NextResponse.redirect(redirectUrl)
  }

  // Handle guest-only routes - redirect authenticated users to dashboard
  if (isGuestRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // For admin routes, perform additional admin role checking
  if (isAdminRoute && isAuthenticated) {
    try {
      const supabase = createSupabaseServerClient()
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session?.user) {
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('returnUrl', pathname)
        return NextResponse.redirect(redirectUrl)
      }
      
      // Get user profile to check admin status
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('is_admin, is_active')
        .eq('id', session.user.id)
        .single()
      
      if (profileError || !userProfile) {
        // If we can't get user profile, redirect to login
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('returnUrl', pathname)
        return NextResponse.redirect(redirectUrl)
      }
      
      // Check if user is admin and active
      if (!userProfile.is_admin) {
        // User is not admin, redirect to home with access denied
        const redirectUrl = new URL('/', request.url)
        redirectUrl.searchParams.set('error', 'access_denied')
        return NextResponse.redirect(redirectUrl)
      }
      
      if (!userProfile.is_active) {
        // User account is disabled
        return NextResponse.redirect(new URL('/account-disabled', request.url))
      }
      
    } catch (error) {
      console.error('Middleware admin check error:', error)
      // On error, redirect to login for security
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('returnUrl', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }
  
  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}