'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  UserCheck, 
  UserX, 
  Shield, 
  Mail, 
  Calendar,
  AlertTriangle,
  Users,
  Loader2,
  RefreshCw,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import { User } from '@/types/auth'
import { formatDistanceToNow } from 'date-fns'

interface AdminUserListProps {
  className?: string
}

interface UserWithStats extends User {
  messageCount?: number
  lastActivity?: Date
}

/**
 * AdminUserList component for managing users in admin panel
 */
export function AdminUserList({ className }: AdminUserListProps) {
  const [users, setUsers] = useState<UserWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/users')
      
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Failed to load users. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Toggle user status (active/inactive)
  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      setUpdatingId(userId)
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: !currentStatus
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update user status')
      }
      
      const data = await response.json()
      
      // Update user in local state
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, isActive: data.user.isActive }
          : user
      ))
    } catch (error) {
      console.error('Error updating user status:', error)
      setError('Failed to update user status. Please try again.')
    } finally {
      setUpdatingId(null)
    }
  }

  // Load users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading users...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchUsers}
              className="ml-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
        <p className="text-gray-500 mb-4">There are no users to manage at this time.</p>
        <Button onClick={fetchUsers} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    )
  }

  const activeUsers = users.filter(user => user.isActive).length
  const adminUsers = users.filter(user => user.isAdmin).length

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            User Management
          </h2>
          <p className="text-sm text-gray-600">
            {users.length} user{users.length !== 1 ? 's' : ''} total • {activeUsers} active • {adminUsers} admin{adminUsers !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={fetchUsers} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {users.map((user) => (
          <Card key={user.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      {user.isAdmin && (
                        <Badge variant="default" className="bg-blue-100 text-blue-800">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                      <Badge 
                        variant={user.isActive ? "default" : "destructive"}
                        className={user.isActive 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                        }
                      >
                        {user.isActive ? (
                          <>
                            <UserCheck className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <UserX className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {user.email}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                    </span>
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="ml-4">
                  ID: {user.id.slice(0, 8)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Created: {new Date(user.createdAt).toLocaleString()}</div>
                  <div>Updated: {new Date(user.updatedAt).toLocaleString()}</div>
                  {user.messageCount !== undefined && (
                    <div>Messages: {user.messageCount}</div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {!user.isAdmin && ( // Don't allow disabling admin users
                    <Button
                      variant={user.isActive ? "destructive" : "default"}
                      size="sm"
                      onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                      disabled={updatingId === user.id}
                      className="flex items-center space-x-2"
                    >
                      {updatingId === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : user.isActive ? (
                        <>
                          <ToggleLeft className="h-4 w-4" />
                          <span>Disable</span>
                        </>
                      ) : (
                        <>
                          <ToggleRight className="h-4 w-4" />
                          <span>Enable</span>
                        </>
                      )}
                    </Button>
                  )}
                  
                  {user.isAdmin && (
                    <div className="text-xs text-gray-500 italic">
                      Admin users cannot be disabled
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}