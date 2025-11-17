'use client'

import { useState, useMemo, useCallback } from 'react'
import { Beat } from '@/types/database'
import { BeatCard } from '@/components/molecules/practice/BeatCard'
import { EmptyState } from '@/components/molecules/feedback/EmptyState'
import { cn } from '@/lib/utils'
import { Search } from 'lucide-react'

interface BeatSelectorProps {
  beats: Beat[]
  selectedBeat: Beat | null
  onSelect: (beat: Beat) => void
  className?: string
}

export function BeatSelector({ beats, selectedBeat, onSelect, className }: BeatSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Memoize filtered beats computation to avoid re-filtering on every render
  const filteredBeats = useMemo(
    () =>
      beats.filter(
        (beat) =>
          beat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          beat.genre?.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [beats, searchQuery]
  )

  // Memoize search handler to prevent unnecessary re-renders of child components
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
        />
        <input
          type="text"
          placeholder="Search beats..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-background-elevated border border-text-tertiary/20 text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-purple focus:border-transparent transition-all"
        />
      </div>

      {/* Beat List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {filteredBeats.length > 0 ? (
          filteredBeats.map((beat) => (
            <BeatCard
              key={beat.id}
              beat={beat}
              isSelected={selectedBeat?.id === beat.id}
              onSelect={onSelect}
            />
          ))
        ) : (
          <EmptyState title="No beats found" description="Try adjusting your search" />
        )}
      </div>
    </div>
  )
}
