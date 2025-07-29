'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Trash2, 
  Eye, 
  AlertTriangle, 
  MessageSquare, 
  User, 
  Phone, 
  Calendar,
  RefreshCw
} from 'lucide-react'
import { Message } from '@/types/message'
import { formatDistanceToNow } from 'date-fns'
import { useErrorHandler, useAsyncOperation } from '@/hooks/use-error-handler'
import { withRetry } from '@/lib/errors'
import { LoadingSpinner, InlineLoadingSpinner } from '@/components/ui/loading-spinner'
import { MessageListSkeleton } from '@/components/ui/skeleton'
import { SuccessMessage, ErrorMessage } from '@/components/ui/feedback'

interface AdminMessageListProps {
  className?: string
}

/**
 * AdminMessageList component for managing messages in admin panel
 */
export function AdminMessageList({ className }: AdminMessageListProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  
  const { handleError, handleSuccess } = useErrorHandler({ context: 'AdminMessageList' })
  const { execute } = useAsyncOperation()

  // Fetch messages with retry logic
  const fetchMessages = async () => {
    setLoading(true)
    
    const { data, error } = await execute(
      () => withRetry(async () => {
        const response = await fetch('/api/admin/messages')
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to fetch messages')
        }
        
        return response.json()
      }),
      {
        errorMessage: 'Failed to load messages. Please try again.',
      }
    )
    
    if (data) {
      setMessages(data.messages || [])
    }
    
    setLoading(false)
  }

  // Delete message with proper error handling
  const handleDeleteMessage = async (messageId: string) => {
    setDeletingId(messageId)
    
    const { data, error } = await execute(
      async () => {
        const response = await fetch(`/api/admin/messages/${messageId}`, {
          method: 'DELETE'
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to delete message')
        }
        
        return response.json()
      },
      {
        successMessage: 'Message deleted successfully',
        errorMessage: 'Failed to delete message. Please try again.',
        onSuccess: () => {
          // Remove message from local state
          setMessages(prev => prev.filter(msg => msg.id !== messageId))
          setDeleteConfirm(null)
        }
      }
    )
    
    setDeletingId(null)
  }

  // Load messages on component mount
  useEffect(() => {
    fetchMessages()
  }, [])

  if (loading) {
    return (
      <div className={className}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Message Management
            </h2>
            <p className="text-sm text-gray-600">Loading messages...</p>
          </div>
        </div>
        <MessageListSkeleton count={5} />
      </div>
    )
  }



  if (messages.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
        <p className="text-gray-500 mb-4">There are no messages to moderate at this time.</p>
        <Button onClick={fetchMessages} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Message Management
          </h2>
          <p className="text-sm text-gray-600">
            {messages.length} message{messages.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button onClick={fetchMessages} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {messages.map((message) => (
          <Card key={message.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">{message.title}</CardTitle>
                  <CardDescription className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {message.publisherName}
                    </span>
                    <span className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {message.contactPhone}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </span>
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="ml-4">
                  ID: {message.id.slice(0, 8)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="mb-4">
                <p className="text-gray-700 leading-relaxed">{message.description}</p>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-xs text-gray-500">
                  Created: {new Date(message.createdAt).toLocaleString()}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // In a real app, this might open a detailed view
                      alert(`Viewing message: ${message.title}`)
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  
                  {deleteConfirm === message.id ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-red-600 font-medium">
                        Delete this message?
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteMessage(message.id)}
                        disabled={deletingId === message.id}
                      >
                        {deletingId === message.id ? (
                          <InlineLoadingSpinner className="mr-1" />
                        ) : (
                          'Confirm'
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteConfirm(null)}
                        disabled={deletingId === message.id}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteConfirm(message.id)}
                      disabled={deletingId === message.id}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
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