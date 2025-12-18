'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Beat } from '@/types/database'
import { Crown, Check, ChevronDown, Music, Play, Square, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/atoms/Skeleton'
import { toast } from 'react-hot-toast'
import { getFavoriteBeatIds, toggleBeatFavorite } from '@/app/actions/beats'

interface BeatDropdownProps {
  beats: Beat[]
  selectedBeat: Beat | null
  onSelect: (beat: Beat) => void
  onLockedSelect?: () => void
  disabled?: boolean
  isPro?: boolean
  isLoading?: boolean
}

export function BeatDropdown({
  beats,
  selectedBeat,
  onSelect,
  onLockedSelect,
  disabled = false,
  isPro = false,
  isLoading = false,
}: BeatDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [favoriteBeatIds, setFavoriteBeatIds] = useState<Set<string>>(new Set())
  const [previewingBeatId, setPreviewingBeatId] = useState<string | null>(null)
  const previewAudioRef = useRef<HTMLAudioElement | null>(null)

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load favorites on mount
  useEffect(() => {
    getFavoriteBeatIds()
      .then((ids) => {
        setFavoriteBeatIds(new Set(ids))
      })
      .catch((err) => console.error('Failed to load favorites', err))
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
  }, [])

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
    
    // Optimistic Update
    setFavoriteBeatIds((prev) => {
      const next = new Set(prev)
      if (next.has(beatId)) {
        next.delete(beatId)
      } else {
        next.add(beatId)
      }
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

  const stopPreview = useCallback(() => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause()
      previewAudioRef.current.currentTime = 0
    }
    setPreviewingBeatId(null)
  }, [])

  const handlePreview = useCallback((beat: Beat, e: React.MouseEvent) => {
    e.stopPropagation()
    
    // If already previewing this beat, stop it
    if (previewingBeatId === beat.id) {
      stopPreview()
      return
    }

    // Stop any current preview
    stopPreview()

    // Start new preview
    const audio = new Audio(beat.storageUrl)
    audio.volume = 0.5
    audio.onended = () => setPreviewingBeatId(null)
    audio.play().catch((err) => {
      console.error('Failed to preview beat:', err)
      toast.error('Could not preview beat')
    })
    
    previewAudioRef.current = audio
    setPreviewingBeatId(beat.id)
  }, [previewingBeatId, stopPreview])

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
        {/* Trigger Button */}
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

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[300px] overflow-y-auto rounded-xl border border-white/10 bg-[#121216] shadow-2xl ring-1 ring-black/5">
            <div className="p-2 space-y-1">
              {beats.map((beat) => {
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
                    {/* Preview Button */}
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
                      title={isPreviewing ? 'Stop preview' : 'Preview beat'}
                    >
                      {isPreviewing ? <Square size={14} /> : <Play size={14} className="ml-0.5" />}
                    </button>

                    {/* Main Click Area */}
                    <button
                      onClick={() => {
                        if (isLocked) {
                          if (typeof navigator !== 'undefined' && navigator.vibrate) {
                            navigator.vibrate(50)
                          }
                          onLockedSelect?.()
                          setIsOpen(false)
                          stopPreview()
                          return
                        }
                        if (typeof navigator !== 'undefined' && navigator.vibrate) {
                          navigator.vibrate(10)
                        }
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
                        {beat.genre && (
                          <>
                            <span className="h-0.5 w-0.5 rounded-full bg-text-tertiary" />
                            <span>{beat.genre}</span>
                          </>
                        )}
                      </div>
                    </button>

                    {/* Right Side Icons */}
                    <div className="flex items-center gap-2 ml-2">
                      {/* Favorite Button */}
                      <button
                        onClick={(e) => handleToggleFavorite(beat.id, e)}
                        className={cn(
                          'p-1.5 rounded-full transition-colors',
                          isFavorited
                            ? 'text-accent-pink'
                            : 'text-text-tertiary hover:text-accent-pink'
                        )}
                        title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Heart
                          size={14}
                          fill={isFavorited ? 'currentColor' : 'none'}
                        />
                      </button>

                      {beat.isPremium && (
                        <div className="flex items-center gap-1 rounded-full bg-accent-orange/10 px-2 py-0.5 border border-accent-orange/20">
                          <Crown size={10} className="text-accent-orange" />
                          <span className="text-[10px] font-bold text-accent-orange uppercase tracking-wider">
                            Pro
                          </span>
                        </div>
                      )}

                      {isSelected && <Check size={16} className="text-accent-purple" />}
                    </div>
                  </div>
                )
              })}

              {beats.length === 0 && (
                <div className="p-4 text-center text-sm text-text-secondary">
                  No beats available
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
