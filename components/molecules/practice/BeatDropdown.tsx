'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Beat } from '@/types/database'
import { Crown, Check, ChevronDown, Music, Play, Square, Heart, Upload, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/atoms/Skeleton'
import { toast } from 'react-hot-toast'
import { getFavoriteBeatIds, toggleBeatFavorite } from '@/app/actions/beats'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/atoms/Tabs'
import { addLocalBeat, getLocalBeats, deleteLocalBeat } from '@/lib/beats/localBeats'

interface BeatDropdownProps {
  beats: Beat[]
  selectedBeat: Beat | null

  onSelect: (beat: Beat) => void
  onLockedSelect?: () => void
  disabled?: boolean
  isPro?: boolean
  isLoading?: boolean
  hideLocalTab?: boolean
}

// Beat type now includes tags

export function BeatDropdown({
  beats,
  selectedBeat,
  onSelect,
  onLockedSelect,
  disabled = false,
  isPro = false,
  isLoading = false,
  hideLocalTab = false,
}: BeatDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [favoriteBeatIds, setFavoriteBeatIds] = useState<Set<string>>(new Set())
  const [previewingBeatId, setPreviewingBeatId] = useState<string | null>(null)

  // Local Beats State
  const [localBeats, setLocalBeats] = useState<Beat[]>([])
  const [myBeats, setMyBeats] = useState<Beat[]>([])

  const previewAudioRef = useRef<HTMLAudioElement | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchMyBeats = useCallback(async () => {
    if (!isPro) return
    try {
      const res = await fetch('/api/user/beats')
      if (res.ok) {
        const data = await res.json()
        setMyBeats(data.beats || [])
      }
    } catch (e) {
      console.error('Failed to fetch my beats', e)
    }
  }, [isPro])

  useEffect(() => {
    if (isOpen && isPro) fetchMyBeats()
  }, [isOpen, isPro, fetchMyBeats])

  // Load favorites
  useEffect(() => {
    getFavoriteBeatIds()
      .then((ids) => {
        setFavoriteBeatIds(new Set(ids))
      })
      .catch((err) => console.error('Failed to load favorites', err))
  }, [])

  // Load local beats when Pro
  useEffect(() => {
    if (isPro && isOpen) {
      getLocalBeats().then(setLocalBeats).catch(console.error)
    }
  }, [isPro, isOpen])

  const stopPreview = useCallback(() => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause()
      previewAudioRef.current.currentTime = 0
    }
    setPreviewingBeatId(null)
  }, [])

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        stopPreview()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [stopPreview])

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause()
        previewAudioRef.current = null
      }
    }
  }, [])

  const handleToggleFavorite = useCallback(async (beatId: string, e: React.MouseEvent) => {
    e.stopPropagation()

    setFavoriteBeatIds((prev) => {
      const next = new Set(prev)
      if (next.has(beatId)) next.delete(beatId)
      else next.add(beatId)
      return next
    })

    try {
      const result = await toggleBeatFavorite(beatId)
      if (result.favorited !== undefined) {
        setFavoriteBeatIds((prev) => {
          const next = new Set(prev)
          if (result.favorited) next.add(beatId)
          else next.delete(beatId)
          return next
        })
        toast.success(result.favorited ? 'Added to favorites' : 'Removed from favorites', {
          icon: result.favorited ? '❤️' : '💔',
          position: 'bottom-center',
        })
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to update favorite')
    }
  }, [])

  const handlePreview = useCallback(
    (beat: Beat, e: React.MouseEvent) => {
      e.stopPropagation()

      if (previewingBeatId === beat.id) {
        stopPreview()
        return
      }

      stopPreview()

      const audio = new Audio(beat.storageUrl)
      audio.volume = 0.5
      audio.onended = () => setPreviewingBeatId(null)
      audio.play().catch((err) => {
        console.error('Failed to preview beat:', err)
        if (err.name === 'NotAllowedError') {
          toast.error('Playback blocked by browser. Click again to play.')
        } else if (err.name === 'NotSupportedError' || beat.storageUrl.includes('pixabay')) {
          toast.error('External beat source unavailable. Try another beat.', {
            icon: '⚠️',
          })
        } else {
          toast.error('Could not preview beat')
        }
      })

      previewAudioRef.current = audio
      setPreviewingBeatId(beat.id)
    },
    [previewingBeatId, stopPreview]
  )

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate type
    if (!file.type.startsWith('audio/')) {
      toast.error('Please upload an audio file')
      return
    }

    try {
      const newBeat = await addLocalBeat(file)
      setLocalBeats((prev) => [newBeat, ...prev])
      toast.success('Beat uploaded locally!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to save local beat')
    }
  }

  const handleDeleteLocal = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Delete this local beat?')) return

    try {
      await deleteLocalBeat(id)
      setLocalBeats((prev) => prev.filter((b) => b.id !== id))
      toast.success('Beat deleted')
      if (selectedBeat?.id === id) {
        // maybe select default?
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete')
    }
  }

  const handleDeleteCloud = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Delete this beat permanently?')) return

    try {
      const res = await fetch(`/api/user/beats/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')

      setMyBeats((prev) => prev.filter((b) => b.id !== id))
      toast.success('Beat deleted from cloud')
      if (selectedBeat?.id === id) {
        // maybe select default?
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete')
    }
  }

  // Extract genres/tags
  const displayedBeats = beats

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-7 w-12 bg-white/10 rounded animate-pulse" />
        <Skeleton className="h-[50px] w-full rounded-xl bg-white/5 border border-white/5" />
      </div>
    )
  }

  return (
    <div className="space-y-3" ref={dropdownRef}>
      <label className="text-lg font-medium text-white">Beat</label>

      <div className="relative">
        <button
          id="tour-beat-select"
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'w-full flex items-center justify-between rounded-xl px-4 py-3 text-left transition-all duration-200',
            'border border-white/10 bg-white/5 hover:bg-white/10',
            isOpen && 'border-accent-purple/50 ring-2 ring-accent-purple/20',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {selectedBeat ? (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-purple/20">
                <Music size={14} className="text-accent-purple" />
              </div>
              <div>
                <div className="font-medium text-white text-sm">{selectedBeat.title}</div>
                <div className="text-xs text-text-secondary">
                  {selectedBeat.bpm} BPM • {selectedBeat.artistName || 'FlowForge'}
                </div>
              </div>
            </div>
          ) : (
            <span className="text-text-secondary">Select a beat...</span>
          )}
          <ChevronDown
            size={20}
            className={cn(
              'text-text-secondary transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 h-[400px] rounded-xl border border-white/10 bg-[#121216] shadow-2xl ring-1 ring-black/5 flex flex-col">
            <Tabs defaultValue="library" className="flex flex-col h-full overflow-hidden">
              <div className="px-3 pt-3 pb-2 border-b border-white/5">
                <TabsList className="w-full bg-white/5">
                  <TabsTrigger value="library" className="flex-1">
                    Library
                  </TabsTrigger>
                  {isPro && (
                    <TabsTrigger value="my-beats" className="flex-1 gap-2">
                      My Beats <Crown size={10} className="text-accent-orange" />
                    </TabsTrigger>
                  )}
                  {!hideLocalTab && (
                    <TabsTrigger
                      value="local"
                      className="flex-1 gap-2"
                      onClick={(e) => {
                        if (!isPro) {
                          e.preventDefault()
                          onLockedSelect?.()
                        }
                      }}
                    >
                      Local <span className="text-[10px] opacity-50">(Browser)</span>
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>

              {/* Library Tab */}
              <TabsContent value="library" className="flex-1 min-h-0 overflow-y-auto mt-0">
                {/* Genre Filter Strip */}
                {/* Filter strip removed as requested */}

                <div className="p-2 space-y-1">
                  {displayedBeats.length === 0 ? (
                    <div className="p-8 text-center text-sm text-text-secondary">
                      No beats available.
                    </div>
                  ) : (
                    displayedBeats.map((beat) => {
                      const isSelected = selectedBeat?.id === beat.id
                      const isLocked = beat.isPremium && !isPro
                      const isFavorited = favoriteBeatIds.has(beat.id)
                      const isPreviewing = previewingBeatId === beat.id

                      return (
                        <div
                          key={beat.id}
                          className={cn(
                            'flex items-center rounded-lg p-3 transition-colors',
                            isSelected ? 'bg-accent-purple/20' : 'hover:bg-white/5',
                            isLocked && 'opacity-70 hover:bg-accent-purple/5'
                          )}
                        >
                          <button
                            onClick={(e) => handlePreview(beat, e)}
                            className={cn(
                              'flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-lg border mr-3 transition-all',
                              isPreviewing
                                ? 'border-accent-green/50 bg-accent-green/20 text-accent-green'
                                : isSelected
                                  ? 'border-accent-purple/30 bg-accent-purple/20 text-accent-purple'
                                  : 'border-white/10 bg-white/5 text-text-secondary hover:text-white hover:bg-white/10'
                            )}
                          >
                            {isPreviewing ? (
                              <Square size={14} />
                            ) : (
                              <Play size={14} className="ml-0.5" />
                            )}
                          </button>

                          <button
                            onClick={() => {
                              if (isLocked) {
                                if (typeof navigator !== 'undefined' && navigator.vibrate)
                                  navigator.vibrate(50)
                                onLockedSelect?.()
                                setIsOpen(false)
                                stopPreview()
                                return
                              }
                              if (typeof navigator !== 'undefined' && navigator.vibrate)
                                navigator.vibrate(10)
                              onSelect(beat)
                              setIsOpen(false)
                              stopPreview()
                            }}
                            className="flex-1 text-left"
                          >
                            <div
                              className={cn(
                                'font-medium text-sm',
                                isSelected ? 'text-accent-purple' : 'text-white'
                              )}
                            >
                              {beat.title}
                            </div>
                            <div className="text-xs text-text-secondary flex items-center gap-2">
                              <span>{beat.bpm} BPM</span>
                              {(beat.tags || []).slice(0, 2).map((t: string) => (
                                <span key={t} className="opacity-70">
                                  #{t}
                                </span>
                              )) ||
                                (beat.genre && <span className="opacity-70">#{beat.genre}</span>)}
                            </div>
                          </button>

                          <div className="flex items-center gap-2 ml-2">
                            <button
                              onClick={(e) => handleToggleFavorite(beat.id, e)}
                              className={cn(
                                'p-1.5 rounded-full transition-colors',
                                isFavorited
                                  ? 'text-accent-pink'
                                  : 'text-text-tertiary hover:text-accent-pink'
                              )}
                            >
                              <Heart size={14} fill={isFavorited ? 'currentColor' : 'none'} />
                            </button>
                            {beat.isPremium && (
                              <div className="flex items-center gap-1 rounded-full bg-accent-orange/10 px-2 py-0.5 border border-accent-orange/20">
                                <Crown size={10} className="text-accent-orange" />
                              </div>
                            )}
                            {isSelected && <Check size={16} className="text-accent-purple" />}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </TabsContent>

              {/* My Beats Tab (Cloud) */}
              <TabsContent value="my-beats" className="flex-1 min-h-0 overflow-y-auto mt-0">
                <div className="p-4 border-b border-white/5"></div>
                <div className="p-2 space-y-1">
                  {myBeats.length === 0 ? (
                    <div className="p-8 text-center text-sm text-text-secondary">
                      No beats uploaded yet.
                    </div>
                  ) : (
                    myBeats.map((beat) => {
                      const isSelected = selectedBeat?.id === beat.id
                      const isPreviewing = previewingBeatId === beat.id
                      return (
                        <div
                          key={beat.id}
                          className={cn(
                            'flex items-center rounded-lg p-3 transition-colors',
                            isSelected ? 'bg-accent-purple/20' : 'hover:bg-white/5'
                          )}
                        >
                          <button
                            onClick={(e) => handlePreview(beat, e)}
                            className={cn(
                              'flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-lg border mr-3 transition-all',
                              isPreviewing
                                ? 'border-accent-green/50 bg-accent-green/20 text-accent-green'
                                : 'border-white/10 bg-white/5 text-text-secondary hover:text-white'
                            )}
                          >
                            {isPreviewing ? (
                              <Square size={14} />
                            ) : (
                              <Play size={14} className="ml-0.5" />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              onSelect(beat)
                              stopPreview()
                            }}
                            className="flex-1 text-left"
                          >
                            <div className="font-medium text-white text-sm">{beat.title}</div>
                            <div className="text-xs text-text-secondary flex gap-2">
                              <span>{beat.bpm} BPM</span>
                              {beat.offset > 0 && (
                                <span className="text-accent-cyan">
                                  Offset: {beat.offset.toFixed(2)}s
                                </span>
                              )}
                            </div>
                          </button>
                          <button
                            onClick={(e) => handleDeleteCloud(beat.id, e)}
                            className="p-2 text-text-tertiary hover:text-red-400 transition-colors"
                            title="Delete cloud beat"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )
                    })
                  )}
                </div>
              </TabsContent>

              {/* Local Tab */}
              {isPro && (
                <TabsContent value="local" className="flex-1 min-h-0 overflow-y-auto mt-0">
                  <div className="p-4 border-b border-white/5">
                    <label className="flex items-center justify-center w-full gap-2 p-3 text-sm font-medium text-white transition-colors border border-dashed rounded-xl cursor-pointer bg-white/5 border-white/20 hover:bg-white/10 hover:border-accent-purple/50 hover:text-accent-purple">
                      <input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <Upload size={16} />
                      <span>Upload Local Track</span>
                    </label>
                    <p className="mt-2 text-[10px] text-center text-text-tertiary">
                      Stored in your browser (IndexedDB). Not synced to cloud.
                    </p>
                  </div>
                  <div className="p-2 space-y-1">
                    {localBeats.length === 0 ? (
                      <div className="p-8 text-center text-sm text-text-secondary">
                        No local tracks yet.
                      </div>
                    ) : (
                      localBeats.map((beat) => {
                        const isSelected = selectedBeat?.id === beat.id
                        const isPreviewing = previewingBeatId === beat.id
                        return (
                          <div
                            key={beat.id}
                            className={cn(
                              'flex items-center rounded-lg p-3 transition-colors',
                              isSelected ? 'bg-accent-purple/20' : 'hover:bg-white/5'
                            )}
                          >
                            <button
                              onClick={(e) => handlePreview(beat, e)}
                              className={cn(
                                'flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-lg border mr-3 transition-all',
                                isPreviewing
                                  ? 'border-accent-green/50 bg-accent-green/20 text-accent-green'
                                  : 'border-white/10 bg-white/5 text-text-secondary hover:text-white'
                              )}
                            >
                              {isPreviewing ? (
                                <Square size={14} />
                              ) : (
                                <Play size={14} className="ml-0.5" />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                onSelect(beat)
                                setIsOpen(false)
                                stopPreview()
                              }}
                              className="flex-1 text-left"
                            >
                              <div className="font-medium text-white text-sm">{beat.title}</div>
                              <div className="text-xs text-text-secondary">Local Storage</div>
                            </button>
                            <button
                              onClick={(e) => handleDeleteLocal(beat.id, e)}
                              className="p-2 text-text-tertiary hover:text-red-400 transition-colors"
                              title="Delete local beat"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )
                      })
                    )}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}
