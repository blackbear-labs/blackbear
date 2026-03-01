'use client'

import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useState, useEffect } from 'react'

interface CustomerSearchProps {
  onSearch: (query: string) => void
  placeholder?: string
}

export function CustomerSearch({ onSearch, placeholder = 'Cari berdasarkan nama atau WA...' }: CustomerSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(searchQuery)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery, onSearch])

  return (
    <div className="relative w-full md:w-80">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-9 border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-500"
      />
    </div>
  )
}
