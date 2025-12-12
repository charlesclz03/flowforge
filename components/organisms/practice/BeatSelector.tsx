'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Beat } from '@/types/database'
import { cn } from '@/lib/utils'
import { Search, ChevronDown, Music, Check } from 'lucide-react'
import { getFavoriteBeatIds } from '@/app/actions/beats'

interface BeatSelectorProps {
  beats: Beat[]
  selectedBeat: Beat | null
  isPro?: boolean
  onSelect: (beat: Beat) => void
  onLockedBeatClick?: () => void
  className?: string
}

export function BeatSelector({
  beats,
  selectedBeat,
  isPro = false,
  onSelect,
  onLockedBeatClick,
  className,
}: BeatSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch favorites on mount
  useEffect(() => {
    getFavoriteBeatIds().then((ids) => {
      setFavoriteIds(new Set(ids))
    })
  }, [])

  const filteredAndSortedBeats = useMemo(() => {
    const filtered = beats.filter(
      (beat) =>
        beat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        beat.genre?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return filtered.sort((a, b) => {
      const aFav = favoriteIds.has(a.id)
      const bFav = favoriteIds.has(b.id)
      if (aFav && !bFav) return -1
      if (!aFav && bFav) return 1
      return 0
    })
  }, [beats, searchQuery, favoriteIds])

  return (
    <div className={cn('relative w-full max-w-xl mx-auto', className)} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-background-elevated border border-white/10 rounded-xl px-4 py-3 text-left hover:border-accent-purple/50 transition-colors shadow-lg"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 flex items-center justify-center border border-white/5">
            <Music size={20} className="text-accent-purple" />
          </div>
          <div className="flex flex-col truncate">
            <span className="text-sm text-text-secondary uppercase tracking-wider text-[10px]">
              Current Beat
            </span>
            <span className="font-medium text-white truncate text-lg">
              {selectedBeat ? selectedBeat.title : 'Select a Beat'}
            </span>
          </div>
        </div>
        <ChevronDown
          size={20}
          className={cn(
            'text-text-secondary transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background-elevated border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Search Header */}
          <div className="p-3 border-b border-white/10 sticky top-0 bg-background-elevated z-10">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
              />
              <input
                type="text"
                placeholder="Search beats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-black/20 border border-white/5 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-accent-purple transition-all"
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
            {filteredAndSortedBeats.length > 0 ? (
              filteredAndSortedBeats.map((beat) => {
                const isSelected = selectedBeat?.id === beat.id
                return (
                  <button
                    key={beat.id}
                    onClick={() => {
                      if (beat.isPremium && !isPro) {
                        onLockedBeatClick?.()
                        setIsOpen(false)
                        return
                      }
                      onSelect(beat)
                      setIsOpen(false)
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left group',
                      isSelected
                        ? 'bg-accent-purple/20 border border-accent-purple/30'
                        : 'hover:bg-white/5 border border-transparent',
                      beat.isPremium && !isPro && 'opacity-70'
                    )}
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-md flex items-center justify-center shrink-0 transition-colors',
                        isSelected
                          ? 'bg-accent-purple text-white'
                          : 'bg-white/5 text-text-secondary group-hover:bg-white/10 group-hover:text-white'
                      )}
                    >
                      {isSelected ? <Check size={18} /> : <Music size={18} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            'font-medium truncate',
                            isSelected ? 'text-white' : 'text-text-primary group-hover:text-white'
                          )}
                        >
                          {beat.title}
                        </span>
                        {beat.isPremium && !isPro && (
                          <span className="text-[10px] bg-accent-yellow/20 text-accent-yellow px-1.5 py-0.5 rounded ml-2">
                            PRO
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-text-secondary truncate">
                        {beat.bpm} BPM • {beat.genre}
                      </div>
                    </div>
                  </button>
                )
              })
            ) : (
              <div className="p-8 text-center text-text-secondary text-sm">No beats found</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
