'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { SearchIcon, Loader2 } from 'lucide-react'

export function SearchInput() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)
  const [isPending, startTransition] = useTransition()

  // We'll use form submission for "Enter" key and simple debounced replace for typing if desired
  // But let's stick to simple form submission for reliability first.

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    startTransition(() => {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    })
  }

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-md">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search beats, artists, or flows..."
          className="w-full pl-10 pr-4 py-3 bg-background-elevated border border-white/5 rounded-full text-white placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-purple/50 transition-all"
        />
        {isPending && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 text-accent-purple animate-spin" />
          </div>
        )}
      </div>
    </form>
  )
}
