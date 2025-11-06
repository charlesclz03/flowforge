'use client'

import { useState } from 'react'
import { Beat } from '@/types/database'
import { BeatCard } from './BeatCard'
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

  const filteredBeats = beats.filter(
    (beat) =>
      beat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      beat.genre?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-background-elevated border border-text-tertiary/20 text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent transition-all"
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
          <div className="text-center py-8">
            <p className="text-text-secondary">No beats found</p>
          </div>
        )}
      </div>
    </div>
  )
}
