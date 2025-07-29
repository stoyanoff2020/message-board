'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { messageSchema, MessageFormData } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/hooks/use-auth-hooks'
import { useLoadingState } from '@/hooks/use-loading-state'
import { InlineLoadingSpinner } from '@/components/ui/loading-spinner'
import { SuccessMessage, ErrorMessage } from '@/components/ui/feedback'

interface MessageFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function MessageForm({ onSuccess, onCancel }: MessageFormProps) {
  const [showSuccess, setShowSuccess] = useState(false)
  const { user } = useAuth()
  const { isLoading, error, execute } = useLoadingState({
    context: 'MessageForm'
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema)
  })

  const onSubmit = async (data: MessageFormData) => {
    if (!user) {
      return
    }

    const { data: result } = await execute(
      async () => {
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to create message')
        }

        return response.json()
      },
      {
        successMessage: 'Message created successfully!',
        onSuccess: () => {
          reset()
          setShowSuccess(true)
          setTimeout(() => setShowSuccess(false), 5000) // Hide after 5 seconds
          onSuccess?.()
        }
      }
    )
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertDescription>
              You must be logged in to create a message.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Message</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {showSuccess && (
            <SuccessMessage
              message="Your message has been created successfully!"
              onDismiss={() => setShowSuccess(false)}
            />
          )}

          {error && (
            <ErrorMessage
              message={error}
              action={{
                label: 'Try Again',
                onClick: () => handleSubmit(onSubmit)()
              }}
            />
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter message title"
              disabled={isLoading}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              {...register('description')}
              placeholder="Enter message description"
              disabled={isLoading}
              className={`min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.description ? 'border-red-500' : ''
              }`}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone">Contact Phone *</Label>
            <Input
              id="contactPhone"
              {...register('contactPhone')}
              placeholder="Enter contact phone number"
              disabled={isLoading}
              className={errors.contactPhone ? 'border-red-500' : ''}
            />
            {errors.contactPhone && (
              <p className="text-sm text-red-600">{errors.contactPhone.message}</p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <InlineLoadingSpinner className="mr-2" />
                  Creating...
                </>
              ) : (
                'Create Message'
              )}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}