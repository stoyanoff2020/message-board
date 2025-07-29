'use client'

import { Message } from '@/types/message'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, truncateText } from '@/lib/utils'
import { HighlightedText } from './highlighted-text'

interface MessageCardProps {
  message: Message
  showFullDescription?: boolean
  onViewDetails?: (message: Message) => void
  searchQuery?: string
}

export function MessageCard({ 
  message, 
  showFullDescription = false, 
  onViewDetails,
  searchQuery = ""
}: MessageCardProps) {
  const handleCardClick = () => {
    if (onViewDetails && !showFullDescription) {
      onViewDetails(message)
    }
  }

  return (
    <Card 
      className={`transition-shadow hover:shadow-md ${
        onViewDetails && !showFullDescription ? 'cursor-pointer' : ''
      }`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900">
          <HighlightedText text={message.title} searchQuery={searchQuery} />
        </CardTitle>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>By {message.publisherName}</span>
          <span>{formatDate(message.createdAt)}</span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div>
            <p className="text-gray-700 leading-relaxed">
              <HighlightedText 
                text={showFullDescription 
                  ? message.description 
                  : truncateText(message.description, 150)
                } 
                searchQuery={searchQuery} 
              />
            </p>
            {!showFullDescription && message.description.length > 150 && (
              <button 
                className="text-blue-600 hover:text-blue-800 text-sm mt-1 font-medium"
                onClick={(e) => {
                  e.stopPropagation()
                  onViewDetails?.(message)
                }}
              >
                Read more...
              </button>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-600">Contact:</span>
              <a 
                href={`tel:${message.contactPhone}`}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                {message.contactPhone}
              </a>
            </div>
            
            {!showFullDescription && onViewDetails && (
              <button 
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                onClick={(e) => {
                  e.stopPropagation()
                  onViewDetails(message)
                }}
              >
                View Details
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}