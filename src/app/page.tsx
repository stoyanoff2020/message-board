'use client'

import { useState } from 'react'
import { PageLayout } from '@/components/layout'
import { AuthGuard } from '@/components/auth/auth-guard'
import { MessageList } from '@/components/messages/message-list'
import { MessageForm } from '@/components/messages/message-form'
import { SearchBar } from '@/components/messages/search-bar'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  return (
    <PageLayout>
      <AuthGuard>
        <div className="space-y-6">
          <div className="flex flex-col space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Message Board</h1>
            <p className="text-muted-foreground">
              Share information and connect with others through messages.
            </p>
          </div>

          {/* Search Bar */}
          <SearchBar onSearch={setSearchQuery} />

          {/* Message Form */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Post a Message</h2>
            <MessageForm />
          </div>

          {/* Message List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              {searchQuery ? `Search Results for "${searchQuery}"` : 'Recent Messages'}
            </h2>
            <MessageList searchQuery={searchQuery} />
          </div>
        </div>
      </AuthGuard>
    </PageLayout>
  )
}
