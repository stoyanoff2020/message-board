'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X, AlertCircle } from 'lucide-react'
import { useErrorHandler } from '@/hooks/use-error-handler'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  debounceMs?: number
  initialValue?: string
  onError?: (error: string) => void
  disabled?: boolean
}

export function SearchBar({ 
  onSearch, 
  placeholder = "Search messages...", 
  debounceMs = 300,
  initialValue = "",
  onError,
  disabled = false
}: SearchBarProps) {
  const [searchValue, setSearchValue] = useState(initialValue)
  const [debouncedValue, setDebouncedValue] = useState(initialValue)
  const [hasError, setHasError] = useState(false)
  
  const { handleError } = useErrorHandler({ context: 'SearchBar', showToast: false })

  // Debounce the search value
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(searchValue)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [searchValue, debounceMs])

  // Call onSearch when debounced value changes
  useEffect(() => {
    try {
      setHasError(false)
      onSearch(debouncedValue)
    } catch (error) {
      const parsedError = handleError(error)
      setHasError(true)
      onError?.(parsedError.message)
    }
  }, [debouncedValue, onSearch, handleError, onError])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      setSearchValue(e.target.value)
      setHasError(false)
    }
  }

  const handleClear = () => {
    if (!disabled) {
      setSearchValue('')
      setHasError(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!disabled) {
      try {
        setHasError(false)
        // Immediately trigger search on form submit
        setDebouncedValue(searchValue)
        onSearch(searchValue)
      } catch (error) {
        const parsedError = handleError(error)
        setHasError(true)
        onError?.(parsedError.message)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
          hasError ? 'text-red-400' : 'text-gray-400'
        }`} />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={handleInputChange}
          disabled={disabled}
          className={`pl-10 pr-10 ${
            hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
          }`}
          aria-invalid={hasError}
          aria-describedby={hasError ? 'search-error' : undefined}
        />
        {searchValue && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {hasError && (
          <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
        )}
      </div>
    </form>
  )
}