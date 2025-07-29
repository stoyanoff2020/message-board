import { getHighlightedTextParts } from '@/lib/utils'

interface HighlightedTextProps {
  text: string
  searchQuery: string
  className?: string
}

export function HighlightedText({ text, searchQuery, className = "" }: HighlightedTextProps) {
  const parts = getHighlightedTextParts(text, searchQuery)
  
  return (
    <span className={className}>
      {parts.map((part, index) => (
        part.highlighted ? (
          <mark key={index} className="bg-yellow-200 px-1 rounded">
            {part.text}
          </mark>
        ) : (
          <span key={index}>{part.text}</span>
        )
      ))}
    </span>
  )
}