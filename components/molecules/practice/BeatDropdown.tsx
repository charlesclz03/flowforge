'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Beat } from '@/types/database'
import {
  Crown,
  Check,
  ChevronDown,
  Music,
  Play,
  Upload,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getFavoriteBeatIds, toggleBeatFavorite } from '@/app/actions/beats'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/atoms/Tabs'
import { deleteLocalBeat } from '@/lib/beats/localBeats'

interface BeatDropdownProps {
  beats: Beat[]
  selectedBeat: Beat | null
  handleSelect: (beat: Beat) => void
  handleLockedSelect?: () => void
  disabled?: boolean
  isPro?: boolean
  isLoading?: boolean
  hideLocalTab?: boolean
  embedded?: boolean
  defaultCollapsed?: boolean
}

export function BeatDropdown(props: BeatDropdownProps) {
  const {
    beats,
    selectedBeat,
    handleSelect,
    handleLockedSelect,
    disabled = false,
    isPro = false,
    isLoading = false,
    hideLocalTab = false,
    embedded = false,
    defaultCollapsed = false,
  } = props

  const [isExpanded, setIsExpanded] = useState(
    !embedded || (embedded && !defaultCollapsed && !selectedBeat)
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'public' | 'local'>('public')
  const [myBeats, setMyBeats] = useState<Beat[]>([])
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchMyBeats = useCallback(async () => {
    if (!isPro) return
    try {
      const res = await fetch('/api/user/beats')
      const contentType = res.headers.get('content-type')

      if (res.ok && contentType?.includes('application/json')) {
        const data = await res.json()
        setMyBeats(data.beats || [])
      } else {
        console.warn(
          'Failed to fetch my beats: Invalid response format or unauthorized',
          {
            status: res.status,
            contentType,
          }
        )
        if (res.status === 401) {
          setMyBeats([])
        }
      }
    } catch (e) {
      console.error('Failed to fetch my beats', e)
    }
  }, [isPro])

  useEffect(() => {
    fetchMyBeats()
    getFavoriteBeatIds().then((ids) => setFavoriteIds(new Set(ids)))
  }, [fetchMyBeats])

  useEffect(() => {
    if (embedded) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [embedded])

  const handleToggleFavorite = async (beatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newFavs = new Set(favoriteIds)
    if (newFavs.has(beatId)) newFavs.delete(beatId)
    else newFavs.add(beatId)
    setFavoriteIds(newFavs)
    await toggleBeatFavorite(beatId)
  }

  const handleDeleteBeat = async (beatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Delete this track?')) {
      await deleteLocalBeat(beatId)
      fetchMyBeats()
    }
  }

  const filteredBeats = (beats || []).filter(
    (b: Beat) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.artistName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const allUserBeats = [...myBeats]

  return (
    <div
      ref={dropdownRef}
      className={cn('relative w-full z-40', embedded && 'mb-4')}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3 bg-surface-elevated/50 backdrop-blur-md border border-white/10 rounded-2xl transition-all duration-300',
          isExpanded &&
            !embedded &&
            'ring-2 ring-accent-purple/50 border-accent-purple/50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent-purple/20 rounded-xl text-accent-purple">
            {selectedBeat ? <Music size={18} /> : <Play size={18} />}
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-white line-clamp-1">
              {isLoading
                ? 'Loading Beats...'
                : selectedBeat?.title || 'Choose a Beat'}
            </p>
            {selectedBeat && (
              <p className="text-xs text-text-tertiary">
                {selectedBeat.bpm} BPM • {selectedBeat.genre || 'Freestyle'}
              </p>
            )}
          </div>
        </div>
        <ChevronDown
          className={cn(
            'text-text-tertiary transition-transform duration-300',
            isExpanded && 'rotate-180'
          )}
          size={20}
        />
      </button>

      {isExpanded && (
        <div
          className={cn(
            'bg-surface-elevated/95 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300',
            !embedded
              ? 'absolute left-0 right-0 mt-2 rounded-2xl max-h-[400px]'
              : 'mt-4 rounded-2xl'
          )}
        >
          <div className="p-3 border-b border-white/10">
            <input
              type="text"
              placeholder="Search beats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-sm text-white placeholder:text-text-tertiary focus:outline-none focus:border-accent-purple/50 transition-all"
            />
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as 'public' | 'local')}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 p-1 bg-black/40 border-b border-white/10 rounded-none h-11">
              <TabsTrigger
                value="public"
                className="text-xs data-[state=active]:bg-accent-purple/20 data-[state=active]:text-accent-purple"
              >
                Public
              </TabsTrigger>
              <TabsTrigger
                value="local"
                className="text-xs data-[state=active]:bg-accent-purple/20 data-[state=active]:text-accent-purple"
              >
                My Tracks
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="public"
              className="m-0 p-0 max-h-[300px] overflow-y-auto custom-scrollbar"
            >
              <div className="p-1">
                {filteredBeats.map((beat: Beat) => (
                  <button
                    key={beat.id}
                    type="button"
                    onClick={() => {
                      if (!isPro && beat.isPremium) {
                        handleLockedSelect?.()
                      } else {
                        handleSelect(beat)
                        setIsExpanded(false)
                      }
                    }}
                    className={cn(
                      'w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group text-left',
                      selectedBeat?.id === beat.id
                        ? 'bg-accent-purple/10'
                        : 'hover:bg-white/5'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-black/40 flex-shrink-0">
                        {beat.isPremium && (
                          <div className="absolute top-0.5 right-0.5 z-10 p-0.5 bg-accent-yellow rounded-full">
                            <Crown size={8} className="text-black" />
                          </div>
                        )}
                        <Music
                          className="absolute inset-0 m-auto text-text-tertiary opacity-40"
                          size={16}
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-accent-purple/40">
                          <Play size={16} className="text-white fill-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p
                            className={cn(
                              'text-sm font-medium',
                              selectedBeat?.id === beat.id
                                ? 'text-accent-purple'
                                : 'text-white'
                            )}
                          >
                            {beat.title}
                          </p>
                          <div
                            onClick={(e) => handleToggleFavorite(beat.id, e)}
                            className={cn(
                              'p-1.5 rounded-lg transition-colors cursor-pointer',
                              favoriteIds.has(beat.id)
                                ? 'text-accent-red bg-accent-red/10'
                                : 'text-text-tertiary hover:bg-white/10'
                            )}
                          >
                            <Check
                              size={14}
                              className={cn(
                                !favoriteIds.has(beat.id) && 'opacity-0'
                              )}
                            />
                          </div>
                        </div>
                        <p className="text-xs text-text-tertiary">
                          {beat.bpm} BPM • {beat.genre}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </TabsContent>

            {!hideLocalTab && (
              <TabsContent
                value="local"
                className="m-0 p-0 max-h-[300px] overflow-y-auto custom-scrollbar"
              >
                <div className="p-1">
                  {allUserBeats.length === 0 ? (
                    <div className="py-10 text-center px-4">
                      <Music
                        className="mx-auto text-text-tertiary mb-3 opacity-20"
                        size={32}
                      />
                      <p className="text-sm font-medium text-text-secondary">
                        No custom beats yet
                      </p>
                      <p className="text-xs text-text-tertiary mt-1">
                        Upload your own instrumentals to practice
                      </p>
                    </div>
                  ) : (
                    allUserBeats.map((beat) => (
                      <div key={beat.id} className="relative group">
                        <button
                          onClick={() => {
                            handleSelect(beat)
                            setIsExpanded(false)
                          }}
                          className={cn(
                            'w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 text-left',
                            selectedBeat?.id === beat.id
                              ? 'bg-accent-purple/10'
                              : 'hover:bg-white/5'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-accent-blue/10 flex items-center justify-center flex-shrink-0">
                              <Upload size={16} className="text-accent-blue" />
                            </div>
                            <div>
                              <p
                                className={cn(
                                  'text-sm font-medium',
                                  selectedBeat?.id === beat.id
                                    ? 'text-accent-purple'
                                    : 'text-white'
                                )}
                              >
                                {beat.title}
                              </p>
                              <p className="text-xs text-text-tertiary">
                                {beat.bpm} BPM • Custom
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              onClick={(e) => handleDeleteBeat(beat.id, e)}
                              className="p-2 text-text-tertiary hover:text-accent-red opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </div>
                            {selectedBeat?.id === beat.id && (
                              <Check size={16} className="text-accent-purple" />
                            )}
                          </div>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      )}
    </div>
  )
}
