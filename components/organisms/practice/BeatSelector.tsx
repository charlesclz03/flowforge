'use client'

import { useState, useMemo, useCallback } from 'react'
import { Beat } from '@/types/database'
import { BeatCard } from '@/components/molecules/practice/BeatCard'
import { EmptyState } from '@/components/molecules/feedback/EmptyState'
import { cn } from '@/lib/utils'
import { Search, Dices } from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { toast } from 'react-hot-toast'

interface BeatSelectorProps {
  beats: Beat[]
  selectedBeat: Beat | null
  isPro?: boolean
  onSelect: (beat: Beat) => void
  className?: string
}

export function BeatSelector({
  beats,
  selectedBeat,
  isPro = false,
  onSelect,
  className,
}: BeatSelectorProps) {
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

  const handleRandomize = useCallback(() => {
    if (beats.length === 0) return
    const availableBeats = isPro ? beats : beats.filter((b) => !b.isPremium)
    const randomBeat = availableBeats[Math.floor(Math.random() * availableBeats.length)]
    if (randomBeat) {
      onSelect(randomBeat)
      toast.success(`Randomized: ${randomBeat.title}`, { icon: '🎲' })
    }
  }, [beats, isPro, onSelect])

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search & Randomize */}
      <div className="flex gap-2">
        <div className="relative flex-1">
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
        <Button
          variant="outline"
          className="aspect-square p-0 w-[50px] border-white/10 bg-white/5 text-text-secondary hover:text-white"
          onClick={handleRandomize}
          title="Randomize Beat"
        >
          <Dices size={20} />
        </Button>
      </div>

      {/* Beat List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {filteredBeats.length > 0 ? (
          filteredBeats.map((beat) => (
            <BeatCard
              key={beat.id}
              beat={beat}
              isSelected={selectedBeat?.id === beat.id}
              isLocked={beat.isPremium && !isPro}
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
