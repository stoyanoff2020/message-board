'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquare, Shield, User } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { LogoutButton } from '@/components/auth/logout-button'
import { cn } from '@/lib/utils'

export function Header() {
  const { user, loading } = useAuth()
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Logo and Brand */}
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <MessageSquare className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              Message Board
            </span>
          </Link>
        </div>

        {/* Mobile Logo */}
        <div className="mr-4 flex md:hidden">
          <Link href="/" className="flex items-center space-x-2">
            <MessageSquare className="h-6 w-6" />
            <span className="font-bold">Board</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex items-center space-x-6 text-sm font-medium flex-1">
          {user && (
            <>
              <Link
                href="/"
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  isActive('/') ? "text-foreground" : "text-foreground/60"
                )}
              >
                Messages
              </Link>
              {user.isAdmin && (
                <Link
                  href="/admin"
                  className={cn(
                    "transition-colors hover:text-foreground/80 flex items-center space-x-1",
                    pathname.startsWith('/admin') ? "text-foreground" : "text-foreground/60"
                  )}
                >
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Auth Section */}
        <div className="flex items-center space-x-2">
          {loading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <div className="flex items-center space-x-2">
              {/* User Info */}
              <div className="hidden sm:flex items-center space-x-2 text-sm">
                <User className="h-4 w-4" />
                <span className="text-foreground/80">{user.name}</span>
                {user.isAdmin && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    Admin
                  </span>
                )}
              </div>
              
              {/* Mobile User Indicator */}
              <div className="flex sm:hidden items-center">
                <User className="h-4 w-4 text-foreground/60" />
              </div>

              {/* Logout Button */}
              <LogoutButton variant="ghost" size="sm" />
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}