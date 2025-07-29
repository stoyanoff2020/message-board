'use client'

import { useState, useEffect } from 'react'
import { Message, MessageListResponse } from '@/types/message'
import { MessageCard } from './message-card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { useErrorHandler, useAsyncOperation } from '@/hooks/use-error-handler'
import { withRetry } from '@/lib/errors'
import { MessageListSkeleton } from '@/components/ui/skeleton'
import { InlineLoadingSpinner } from '@/components/ui/loading-spinner'

interface MessageListProps {
  searchQuery?: string
  onMessageSelect?: (message: Message) => void
  limit?: number
}

export function MessageList({ 
  searchQuery = '', 
  onMessageSelect,
  limit = 10 
}: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [lastError, setLastError] = useState<string | null>(null)

  const { handleError } = useErrorHandler({ context: 'MessageList', showToast: false })
  const { execute } = useAsyncOperation()

  const fetchMessages = async (reset = false) => {
    const currentOffset = reset ? 0 : offset
    
    if (reset) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }
    
    setLastError(null)

    const { data, error } = await execute(
      () => withRetry(async () => {
        const params = new URLSearchParams({
          limit: limit.toString(),
          offset: currentOffset.toString(),
          orderBy: 'created_at',
          orderDirection: 'desc'
        })

        if (searchQuery.trim()) {
          params.append('query', searchQuery.trim())
        }

        const response = await fetch(`/api/messages?${params}`)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || 'Failed to fetch messages')
        }

        return response.json()
      }),
      {
        onError: (error) => {
          setLastError(error.message)
        }
      }
    )
    
    if (data) {
      const messageData = data as MessageListResponse
      
      if (reset) {
        setMessages(messageData.messages)
        setOffset(messageData.messages.length)
      } else {
        setMessages(prev => [...prev, ...messageData.messages])
        setOffset(prev => prev + messageData.messages.length)
      }
      
      setHasMore(messageData.hasMore)
    }
    
    setLoading(false)
    setLoadingMore(false)
  }

  // Fetch messages on mount and when search query changes
  useEffect(() => {
    fetchMessages(true)
  }, [searchQuery])

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchMessages(false)
    }
  }

  if (loading) {
    return <MessageListSkeleton count={limit > 10 ? 5 : 3} />
  }

  if (lastError && messages.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {lastError}
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2"
            onClick={() => fetchMessages(true)}
          >
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (messages.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">
              {searchQuery.trim() ? 'No messages found' : 'No messages yet'}
            </h3>
            <p className="text-gray-500">
              {searchQuery.trim() 
                ? `No messages match your search for "${searchQuery.trim()}"`
                : 'Be the first to share a message with the community!'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <MessageCard
            key={message.id}
            message={message}
            onViewDetails={onMessageSelect}
            searchQuery={searchQuery}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <InlineLoadingSpinner className="mr-2" />
                Loading...
              </>
            ) : (
              'Load More Messages'
            )}
          </Button>
        </div>
      )}

      {messages.length > 0 && !hasMore && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">
            You've reached the end of the messages
          </p>
        </div>
      )}
    </div>
  )
}