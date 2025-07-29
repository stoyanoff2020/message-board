'use client'

import { Header } from './header'
import { Footer } from './footer'
import { AuthProvider } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: React.ReactNode
  className?: string
  showHeader?: boolean
  showFooter?: boolean
}

export function Layout({ 
  children, 
  className,
  showHeader = true,
  showFooter = true 
}: LayoutProps) {
  return (
    <AuthProvider>
      <div className="relative flex min-h-screen flex-col">
        {showHeader && <Header />}
        
        <main className={cn(
          "flex-1",
          className
        )}>
          {children}
        </main>
        
        {showFooter && <Footer />}
      </div>
    </AuthProvider>
  )
}

// Convenience component for pages that need full layout
export function PageLayout({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <Layout className={cn("container mx-auto px-4 py-8", className)}>
      {children}
    </Layout>
  )
}

// Convenience component for auth pages (no header/footer)
export function AuthLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md space-y-8 px-4">
          {children}
        </div>
      </div>
    </AuthProvider>
  )
}