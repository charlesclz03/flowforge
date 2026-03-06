'use client'

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
} from 'react'
import { useRouter } from 'next/navigation'
import { Beat } from '@/types/database'
import {
  Crown,
  Check,
  ChevronDown,
  Music,
  Play,
  Pause,
  Upload,
  Trash2,
  Heart,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getFavoriteBeatIds, toggleBeatFavorite } from '@/app/actions/beats'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/atoms/Tabs'
import { ConfirmDialog } from '@/components/molecules/feedback/ConfirmDialog'
import { deleteLocalBeat } from '@/lib/beats/localBeats'
import { toast } from 'react-hot-toast'

// Compact upload row that appears after existing tracks
function UploadNewTrackRow() {
  const router = useRouter()

  const handleUploadClick = () => {
    router.push('/tracks?tab=mine&upload=true')
  }

  return (
    <div onClick={handleUploadClick} className="p-1">
      <div className="w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-white/5 cursor-pointer border border-dashed border-white/10 hover:border-accent-purple/30">
        <div className="w-10 h-10 rounded-lg bg-accent-purple/10 flex items-center justify-center flex-shrink-0">
          <Upload size={16} className="text-accent-purple" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-accent-purple">
            Upload new track
          </p>
          <p className="text-xs text-text-secondary">
            Add another beat to your library
          </p>
        </div>
      </div>
    </div>
  )
}

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
  /**
   * When `embedded`, render the expanded menu as an overlay so the Practice page
   * can stay non-scroll while the menu scrolls internally.
   */
  overlay?: boolean
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
    overlay = false,
  } = props

  const [isExpanded, setIsExpanded] = useState(
    !embedded || (embedded && !defaultCollapsed && !selectedBeat)
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'public' | 'local'>('public')
  const [myBeats, setMyBeats] = useState<Beat[]>([])
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [beatPendingDelete, setBeatPendingDelete] = useState<Beat | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const useOverlay = embedded && overlay
  const [overlayMetrics, setOverlayMetrics] = useState<{
    top: number
    left: number
    width: number
    maxHeight: number
  } | null>(null)

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

  useLayoutEffect(() => {
    if (!useOverlay || !isExpanded) return

    const update = () => {
      const button = buttonRef.current
      if (!button) return

      const rect = button.getBoundingClientRect()
      const top = Math.round(rect.bottom + 8)
      const left = Math.round(rect.left)
      const width = Math.round(rect.width)

      // Prefer the app shell viewport (main-content) so overlays don't hide behind BottomNav.
      const main = document.getElementById('main-content')
      const mainBottom =
        main?.getBoundingClientRect().bottom ?? window.innerHeight
      const maxHeight = Math.max(240, mainBottom - top - 16)

      setOverlayMetrics({ top, left, width, maxHeight })
    }

    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [useOverlay, isExpanded])

  useEffect(() => {
    if (!useOverlay || !isExpanded) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsExpanded(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [useOverlay, isExpanded])

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

  const requestDeleteBeat = (beat: Beat, e: React.MouseEvent) => {
    e.stopPropagation()
    setBeatPendingDelete(beat)
  }

  const confirmDeleteBeat = async () => {
    if (!beatPendingDelete) return

    setIsDeleting(true)
    try {
      if (beatPendingDelete.id.startsWith('local-')) {
        await deleteLocalBeat(beatPendingDelete.id)
      } else {
        const res = await fetch(`/api/user/beats/${beatPendingDelete.id}`, {
          method: 'DELETE',
        })
        if (!res.ok) {
          throw new Error('Failed to delete beat')
        }
      }
      await fetchMyBeats()
      toast.success('Track deleted')
      setBeatPendingDelete(null)
    } catch (error) {
      console.error('Delete beat error:', error)
      toast.error('Failed to delete beat')
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePreview = (e: React.MouseEvent, beat: Beat) => {
    e.stopPropagation()

    if (!audioRef.current) {
      audioRef.current = new Audio()
    }

    const audio = audioRef.current

    if (playingId === beat.id) {
      audio.pause()
      setPlayingId(null)
    } else {
      audio.src = beat.storageUrl
      audio.play().catch(console.error)
      setPlayingId(beat.id)

      audio.onended = () => setPlayingId(null)
    }
  }

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Stop audio preview when dropdown collapses
  useEffect(() => {
    if (!isExpanded && audioRef.current) {
      audioRef.current.pause()
      setPlayingId(null)
    }
  }, [isExpanded])

  const filteredBeats = (beats || [])
    .filter(
      (b: Beat) =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.artistName?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aFav = favoriteIds.has(a.id)
      const bFav = favoriteIds.has(b.id)
      if (aFav && !bFav) return -1
      if (!aFav && bFav) return 1
      return 0
    })

  const allUserBeats = [...myBeats]

  return (
    <div
      ref={dropdownRef}
      className={cn('relative w-full z-40', embedded && !useOverlay && 'mb-4')}
    >
      <ConfirmDialog
        isOpen={Boolean(beatPendingDelete)}
        onClose={() => setBeatPendingDelete(null)}
        onConfirm={confirmDeleteBeat}
        title="Delete Track?"
        description={
          beatPendingDelete
            ? `Remove "${beatPendingDelete.title}" from your library?`
            : 'Remove this track from your library?'
        }
        confirmLabel="Delete Track"
        isLoading={isDeleting}
        tone="danger"
      />

      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3 bg-surface-elevated border border-white/10 rounded-2xl transition-all duration-300',
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
              <p className="text-xs text-text-secondary">
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

      {isExpanded && useOverlay && (
        <div
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {isExpanded && (!useOverlay || overlayMetrics) && (
        <div
          className={cn(
            'bg-surface-elevated border border-white/10 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300 flex flex-col min-h-0',
            useOverlay
              ? 'fixed z-[61] rounded-2xl'
              : !embedded
                ? 'absolute left-0 right-0 mt-2 rounded-2xl max-h-[400px]'
                : 'mt-4 rounded-2xl'
          )}
          style={
            useOverlay && overlayMetrics
              ? {
                  top: overlayMetrics.top,
                  left: overlayMetrics.left,
                  width: overlayMetrics.width,
                  maxHeight: overlayMetrics.maxHeight,
                }
              : undefined
          }
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
            className={cn('w-full', useOverlay && 'flex flex-col min-h-0')}
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
              className={cn(
                'm-0 p-0 overflow-y-auto custom-scrollbar',
                useOverlay ? 'flex-1 min-h-0' : 'max-h-[300px]'
              )}
            >
              <div className="p-1">
                {/* Random Beat Option */}
                <div
                  onClick={() => {
                    const availableBeats = beats.filter((b) =>
                      isPro ? true : !b.isPremium
                    )
                    if (availableBeats.length > 0) {
                      const randomBeat =
                        availableBeats[
                          Math.floor(Math.random() * availableBeats.length)
                        ]
                      handleSelect(randomBeat)
                      setIsExpanded(false)
                    }
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group text-left cursor-pointer hover:bg-white/5 mb-1"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
                      <span className="text-xl font-bold">?</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">
                        Random Beat
                      </p>
                      <p className="text-xs text-text-secondary">
                        Surprise me!
                      </p>
                    </div>
                  </div>
                </div>

                {filteredBeats.map((beat: Beat) => (
                  <div
                    key={beat.id}
                    onClick={() => {
                      if (!isPro && beat.isPremium) {
                        handleLockedSelect?.()
                      } else {
                        handleSelect(beat)
                        setIsExpanded(false)
                      }
                    }}
                    className={cn(
                      'w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group text-left cursor-pointer',
                      selectedBeat?.id === beat.id
                        ? 'bg-accent-purple/10'
                        : 'hover:bg-white/5'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        onClick={(e) => handlePreview(e, beat)}
                        className="relative w-10 h-10 rounded-lg overflow-hidden bg-black/40 flex-shrink-0 cursor-pointer"
                      >
                        {beat.isPremium && (
                          <div className="absolute top-1 right-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-accent-yellow ring-1 ring-white/20 shadow-[0_0_10px_rgba(255,214,10,0.35)]">
                            <Crown size={12} className="text-black" />
                          </div>
                        )}
                        <Music
                          className={cn(
                            'absolute inset-0 m-auto text-white/20 transition-opacity',
                            playingId === beat.id ? 'opacity-0' : 'opacity-40'
                          )}
                          size={16}
                        />
                        <div
                          className={cn(
                            'absolute inset-0 flex items-center justify-center transition-all bg-accent-purple/40',
                            playingId === beat.id
                              ? 'opacity-100'
                              : 'opacity-0 group-hover:opacity-100'
                          )}
                        >
                          {playingId === beat.id ? (
                            <Pause
                              size={16}
                              className="text-white fill-white"
                            />
                          ) : (
                            <Play size={16} className="text-white fill-white" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
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
                        </div>
                        <p className="text-xs text-text-secondary">
                          {beat.bpm} BPM • {beat.genre}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {beat.title === 'New' && (
                        <div className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent-purple/20 text-accent-purple border border-accent-purple/20 shadow-[0_0_10px_rgba(125,122,255,0.2)]">
                          NEW
                        </div>
                      )}
                      <div
                        onClick={(e) => handleToggleFavorite(beat.id, e)}
                        className={cn(
                          'transition-colors cursor-pointer p-2 -m-2',
                          favoriteIds.has(beat.id)
                            ? 'text-accent-red'
                            : 'text-text-tertiary hover:text-white'
                        )}
                      >
                        <Heart
                          size={16}
                          className={cn(
                            favoriteIds.has(beat.id) && 'fill-current'
                          )}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {!hideLocalTab && (
              <TabsContent
                value="local"
                className={cn(
                  'm-0 p-0 overflow-y-auto custom-scrollbar',
                  useOverlay ? 'flex-1 min-h-0' : 'max-h-[300px]'
                )}
              >
                <div className="p-1">
                  {allUserBeats.map((beat) => (
                    <div
                      key={beat.id}
                      className="relative group p-1"
                      onClick={() => {
                        handleSelect(beat)
                        setIsExpanded(false)
                      }}
                    >
                      <div
                        className={cn(
                          'w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 text-left cursor-pointer',
                          selectedBeat?.id === beat.id
                            ? 'bg-accent-purple/10'
                            : 'hover:bg-white/5'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            onClick={(e) => handlePreview(e, beat)}
                            className="w-10 h-10 rounded-lg bg-accent-purple/10 flex items-center justify-center flex-shrink-0 cursor-pointer group-hover:bg-accent-purple/20 transition-colors"
                          >
                            {playingId === beat.id ? (
                              <Pause size={16} className="text-accent-purple" />
                            ) : (
                              <Upload
                                size={16}
                                className="text-accent-purple"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
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
                            </div>
                            <p className="text-xs text-text-secondary">
                              {beat.bpm} BPM • Custom
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div
                            onClick={(e) => handleToggleFavorite(beat.id, e)}
                            className={cn(
                              'transition-colors cursor-pointer p-2 -m-2',
                              'text-text-tertiary hover:text-white'
                            )}
                          >
                            <Heart size={16} />
                          </div>
                          <div
                            onClick={(e) => requestDeleteBeat(beat, e)}
                            className="p-2 text-text-tertiary hover:text-accent-red opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </div>
                          {selectedBeat?.id === beat.id && (
                            <Check size={16} className="text-accent-purple" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Upload new track row - always visible */}
                  <UploadNewTrackRow />
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      )}
    </div>
  )
}
