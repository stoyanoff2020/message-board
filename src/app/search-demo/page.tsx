'use client'

import { useState } from 'react'
import { SearchBar } from '@/components/messages/search-bar'
import { MessageList } from '@/components/messages/message-list'

export default function SearchDemoPage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Search Demo</h1>
      
      <div className="mb-6">
        <SearchBar 
          onSearch={setSearchQuery}
          placeholder="Search messages..."
        />
      </div>

      <div className="space-y-4">
        <MessageList searchQuery={searchQuery} />
      </div>
    </div>
  )
}