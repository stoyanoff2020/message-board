'use client'

import { Loader2, LogOut } from 'lucide-react'
import { useLogout } from '@/hooks/use-auth-hooks'
import { Button } from '@/components/ui/button'

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  showIcon?: boolean
  children?: React.ReactNode
}

export function LogoutButton({ 
  variant = 'ghost', 
  size = 'default',
  className,
  showIcon = true,
  children
}: LogoutButtonProps) {
  const { handleLogout, loading } = useLogout()

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleLogout}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing out...
        </>
      ) : (
        <>
          {showIcon && <LogOut className="mr-2 h-4 w-4" />}
          {children || 'Sign out'}
        </>
      )}
    </Button>
  )
}