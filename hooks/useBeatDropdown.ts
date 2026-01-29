'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Beat } from '@/types/database'
import { getFavoriteBeatIds, toggleBeatFavorite } from '@/app/actions/beats'
import { deleteLocalBeat } from '@/lib/beats/localBeats'

interface UseBeatDropdownOptions {
  isPro: boolean
  onRefresh?: () => void
}

interface UseBeatDropdownReturn {
  // State
  myBeats: Beat[]
  favoriteIds: Set<string>
  playingId: string | null
  isLoading: boolean

  // Actions
  fetchMyBeats: () => Promise<void>
  handleDeleteBeat: (beatId: string, e: React.MouseEvent) => Promise<void>
  handlePreview: (e: React.MouseEvent, beat: Beat) => void
  handleToggleFavorite: (beatId: string, e: React.MouseEvent) => Promise<void>
  stopPreview: () => void
}

/**
 * Custom hook for BeatDropdown component logic
 * Extracts data fetching, audio preview, favorites, and delete operations
 */
export function useBeatDropdown({
  isPro,
  onRefresh,
}: UseBeatDropdownOptions): UseBeatDropdownReturn {
  const [myBeats, setMyBeats] = useState<Beat[]>([])
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  /**
   * Fetch user's uploaded beats from the server
   */
  const fetchMyBeats = useCallback(async () => {
    if (!isPro) return
    setIsLoading(true)
    try {
      const res = await fetch('/api/user/beats')
      const contentType = res.headers.get('content-type')

      if (res.ok && contentType?.includes('application/json')) {
        const data = await res.json()
        setMyBeats(data.beats || [])
      } else {
        console.warn('Failed to fetch my beats:', {
          status: res.status,
          contentType,
        })
        if (res.status === 401) {
          setMyBeats([])
        }
      }
    } catch (e) {
      console.error('Failed to fetch my beats', e)
    } finally {
      setIsLoading(false)
    }
  }, [isPro])

  /**
   * Toggle favorite status for a beat
   */
  const handleToggleFavorite = useCallback(
    async (beatId: string, e: React.MouseEvent) => {
      e.stopPropagation()
      const newFavs = new Set(favoriteIds)
      if (newFavs.has(beatId)) newFavs.delete(beatId)
      else newFavs.add(beatId)
      setFavoriteIds(newFavs)
      await toggleBeatFavorite(beatId)
    },
    [favoriteIds]
  )

  /**
   * Delete a beat (handles both local IndexedDB and server-side beats)
   */
  const handleDeleteBeat = useCallback(
    async (beatId: string, e: React.MouseEvent) => {
      e.stopPropagation()
      if (!confirm('Delete this track?')) return

      try {
        if (beatId.startsWith('local-')) {
          await deleteLocalBeat(beatId)
        } else {
          const res = await fetch(`/api/user/beats/${beatId}`, {
            method: 'DELETE',
          })
          if (!res.ok) {
            throw new Error('Failed to delete beat')
          }
        }
        fetchMyBeats()
        onRefresh?.()
      } catch (error) {
        console.error('Delete beat error:', error)
        alert('Failed to delete beat')
      }
    },
    [fetchMyBeats, onRefresh]
  )

  /**
   * Preview/play a beat audio
   */
  const handlePreview = useCallback(
    (e: React.MouseEvent, beat: Beat) => {
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
    },
    [playingId]
  )

  /**
   * Stop any currently playing preview
   */
  const stopPreview = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      setPlayingId(null)
    }
  }, [])

  // Initialize: fetch beats and favorites on mount
  useEffect(() => {
    fetchMyBeats()
    getFavoriteBeatIds().then((ids) => setFavoriteIds(new Set(ids)))
  }, [fetchMyBeats])

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  return {
    myBeats,
    favoriteIds,
    playingId,
    isLoading,
    fetchMyBeats,
    handleDeleteBeat,
    handlePreview,
    handleToggleFavorite,
    stopPreview,
  }
}
