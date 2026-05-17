'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'react-hot-toast'

import { BeatGridCard } from '@/components/molecules/tracks/BeatGridCard'
import { Beat } from '@/types/database'
import { Music, Plus, Lock, Settings } from 'lucide-react'
import { getFavoriteBeatIds, toggleBeatFavorite } from '@/app/actions/beats'

import { useSession } from 'next-auth/react'
import { UserBeatUploadModal } from '@/components/molecules/practice/UserBeatUploadModal'
import { PremiumModal } from '@/components/molecules/monetization/PremiumModal'
import { AppHeader } from '@/components/organisms/layout/AppHeader'
import { ScreenPage } from '@/components/layout/ScreenPage'
import { Button } from '@/components/atoms/Button'
import { IconFrame } from '@/components/atoms/IconFrame'
import { Modal } from '@/components/atoms/Modal'
import { Toolbar } from '@/components/molecules/display/Toolbar'
import { cn } from '@/lib/utils'
import { FALLBACK_BEATS } from '@/lib/data/fallbacks'

// Desktop responsiveness fix applied
export default function TracksPage() {
  const [beats, setBeats] = useState<Beat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())

  const [playingBeatId, setPlayingBeatId] = useState<string | null>(null)
  const [selectedGenre, setSelectedGenre] = useState<string>('All')

  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false)
  const [beatPendingDelete, setBeatPendingDelete] = useState<Beat | null>(null)

  const audioRef = useRef<HTMLAudioElement>(null)

  const user = session?.user
  const isPro =
    user?.subscriptionStatus === 'active' ||
    user?.subscriptionStatus === 'trialing' ||
    user?.role === 'SUPERADMIN'

  const handleUseTrack = (beat: Beat) => {
    router.push(`/difficultyselection?beatId=${beat.id}`)
  }

  const userId = session?.user?.id

  const fetchBeats = useCallback(async () => {
    setIsLoading(true)
    try {
      const userBeatsPromise = userId
        ? fetch('/api/user/beats')
            .then((res) => {
              // Guests will 401: treat as expected and return no user beats
              if (res.status === 401) return { beats: [] }

              return res.ok &&
                res.headers.get('content-type')?.includes('application/json')
                ? res.json()
                : { beats: [] }
            })
            .catch(() => ({ beats: [] }))
        : Promise.resolve({ beats: [] })

      const [beatsRes, userBeatsRes, favs] = await Promise.all([
        fetch('/api/beats')
          .then((res) => (res.ok ? res.json() : { beats: [] }))
          .catch(() => ({ beats: [] })),
        userBeatsPromise,
        getFavoriteBeatIds().catch(() => []),
      ])

      let publicBeats = beatsRes.beats || []
      const userBeats = userBeatsRes.beats || []

      // Client-side Fallback
      if (publicBeats.length === 0) {
        publicBeats = FALLBACK_BEATS
      }

      setFavoriteIds(new Set(favs))
      setBeats(() => {
        const combined = [...userBeats, ...publicBeats]
        const unique = combined.filter(
          (beat, index, self) =>
            index === self.findIndex((b) => b.id === beat.id)
        )
        return unique
      })
    } catch (e) {
      console.error('Fetch beats failed completely', e)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchBeats()
  }, [fetchBeats])

  useEffect(() => {
    const audio = audioRef.current
    return () => {
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
    }
  }, [])

  const handlePlay = (beat: Beat) => {
    const audio = audioRef.current
    if (!audio) return

    if (playingBeatId === beat.id) {
      setPlayingBeatId(null)
      audio.pause()
      audio.currentTime = 0
    } else {
      setPlayingBeatId(beat.id)
      audio.src = beat.storageUrl

      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.error('Playback failed:', err)
          setPlayingBeatId(null)
        })
      }

      audio.onended = () => setPlayingBeatId(null)
      audio.onerror = (e) => {
        console.error('Audio element error:', e)
        setPlayingBeatId(null)
      }
    }
  }

  const handleToggleFavorite = async (beatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newFavs = new Set(favoriteIds)
    if (newFavs.has(beatId)) {
      newFavs.delete(beatId)
    } else {
      newFavs.add(beatId)
    }
    setFavoriteIds(newFavs)

    await toggleBeatFavorite(beatId)
  }

  const confirmDeleteBeat = async () => {
    if (!beatPendingDelete) return
    try {
      const res = await fetch(`/api/user/beats/${beatPendingDelete.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete')

      setBeats((prev) => prev.filter((b) => b.id !== beatPendingDelete.id))
      toast.success('Beat deleted')
    } catch (e) {
      console.error(e)
      toast.error('Failed to delete beat')
    } finally {
      setBeatPendingDelete(null)
    }
  }

  const [activeTab, setActiveTab] = useState<'public' | 'mine'>('public')

  // Handle URL query params for redirecting from difficulty selection
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    const uploadParam = searchParams.get('upload')

    if (tabParam === 'mine' && isPro) {
      setActiveTab('mine')
      if (uploadParam === 'true') {
        setIsUploadModalOpen(true)
      }
    }
  }, [searchParams, isPro])

  const handleTabChange = (tab: 'public' | 'mine') => {
    if (tab === 'mine' && !isPro) {
      setIsPremiumModalOpen(true)
      return
    }
    setActiveTab(tab)
  }

  const handleNewBeatClick = () => {
    if (!isPro) {
      setIsPremiumModalOpen(true)
      return
    }
    setIsUploadModalOpen(true)
  }

  // 1. Filter by Active Tab (Public vs Mine)
  const currentTabBeats = beats.filter((b) => {
    if (activeTab === 'mine') {
      return !!(b.uploaderId && b.uploaderId === session?.user?.id)
    } else {
      return !b.uploaderId // System beats (Public)
    }
  })

  // 2. Derive Genres from ONLY the tracks in the current tab
  const genres = [
    'All',
    ...new Set(currentTabBeats.map((b) => b.genre).filter(Boolean)),
  ] as string[]

  // 3. Filter by Selected Genre
  const filteredBeats = currentTabBeats.filter((b) => {
    if (selectedGenre === 'All') return true
    return b.genre === selectedGenre
  })

  // Reset genre when tab changes (optional but safer)
  useEffect(() => {
    setSelectedGenre('All')
  }, [activeTab])

  return (
    <ScreenPage
      header={
        <AppHeader
          customTitle="Beat Vault"
          customSubtitle="Discover beats for your next session"
        />
      }
    >
      <audio ref={audioRef} className="hidden" />

      <div className="px-6 py-6 space-y-6 pb-bottomnav">
        <Toolbar
          className="mb-6"
          leading={
            <div className="flex p-1 bg-surface-elevation-1/80 rounded-xl w-fit">
              <button
                onClick={() => handleTabChange('public')}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple',
                  activeTab === 'public'
                    ? 'bg-accent-purple/20 text-white border border-accent-purple/40 shadow-purple-glow'
                    : 'text-text-tertiary hover:text-white'
                )}
              >
                Public Tracks
              </button>
              <button
                onClick={() => handleTabChange('mine')}
                aria-label={
                  isPro ? 'Show my tracks' : 'My Tracks requires FreeStyla Pro'
                }
                className={cn(
                  'flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple',
                  activeTab === 'mine'
                    ? 'bg-accent-purple/20 text-white border border-accent-purple/40 shadow-purple-glow'
                    : isPro
                      ? 'text-text-tertiary hover:text-white'
                      : 'border border-white/10 bg-white/[0.03] text-text-secondary hover:border-accent-purple/40 hover:text-white'
                )}
              >
                My Tracks
                {!isPro && (
                  <IconFrame
                    icon={Lock}
                    variant="inline"
                    tone="zinc"
                    decorative
                    className="opacity-70"
                  />
                )}
              </button>
            </div>
          }
          trailing={
            <>
              {session?.user?.role === 'SUPERADMIN' && (
                <button
                  onClick={() => router.push('/admin/beats')}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-accent-red/10 text-accent-red border border-accent-red/20 rounded-lg font-medium text-sm hover:bg-accent-red/20 transition-all shadow-red-glow"
                >
                  <IconFrame
                    icon={Settings}
                    variant="inline"
                    tone="red"
                    decorative
                  />
                  <span>Admin</span>
                </button>
              )}
              <button
                onClick={handleNewBeatClick}
                aria-label={
                  isPro
                    ? 'Upload a new beat'
                    : 'New Beat requires FreeStyla Pro'
                }
                className={cn(
                  'flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple',
                  isPro
                    ? 'bg-accent-purple text-white border border-accent-purple hover:bg-accent-purple/90 shadow-purple-glow'
                    : 'border border-white/10 bg-white/5 text-text-secondary hover:border-accent-purple/40 hover:text-white'
                )}
              >
                <IconFrame
                  icon={isPro ? Plus : Lock}
                  variant="inline"
                  tone={isPro ? 'white' : 'zinc'}
                  decorative
                />
                <span>New Beat</span>
              </button>
            </>
          }
        />
        {/* Genre Filter - derived dynamically */}
        {!isLoading && currentTabBeats.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border flex items-center justify-center',
                  selectedGenre === genre
                    ? 'bg-white text-black border-white'
                    : 'bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10 hover:text-white'
                )}
              >
                {genre}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3" role="status" aria-live="polite">
            <p className="text-sm font-medium text-text-secondary">
              Loading Beat Vault...
            </p>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-square rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <div className="h-full animate-pulse rounded-xl bg-white/[0.06]" />
                  <div className="mt-3 h-3 w-2/3 animate-pulse rounded-full bg-white/10" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredBeats.map((beat) => (
              <BeatGridCard
                key={beat.id}
                beat={beat}
                isSelected={playingBeatId === beat.id}
                isPlaying={playingBeatId === beat.id}
                isFavorited={favoriteIds.has(beat.id)}
                isLocked={!isPro && beat.isPremium}
                onPlay={() => handlePlay(beat)}
                onSelect={() => {}}
                onToggleFavorite={(e) => handleToggleFavorite(beat.id, e)}
                onUseTrack={
                  !isPro && beat.isPremium
                    ? () => setIsPremiumModalOpen(true)
                    : () => handleUseTrack(beat)
                }
                onLockedClick={() => setIsPremiumModalOpen(true)}
                onDelete={
                  beat.uploaderId && beat.uploaderId === session?.user?.id
                    ? () => setBeatPendingDelete(beat)
                    : undefined
                }
              />
            ))}
          </div>
        )}

        {filteredBeats.length === 0 && !isLoading && activeTab === 'public' && (
          <div className="py-20 text-center space-y-4 opacity-50">
            <IconFrame
              icon={Music}
              variant="hero"
              tone="zinc"
              decorative
              className="mx-auto"
            />
            <p>No beats available. Pull to refresh.</p>
          </div>
        )}

        {filteredBeats.length === 0 && !isLoading && activeTab === 'mine' && (
          <div className="py-20 text-center space-y-4 px-6 opacity-50">
            <IconFrame
              icon={Music}
              variant="hero"
              tone="zinc"
              decorative
              className="mx-auto"
            />
            <h2 className="text-lg font-bold text-white">
              Capture your own sound.
            </h2>
            <p className="max-w-xs mx-auto text-sm">
              Upload local tracks to practice rap improvisation offline. Build
              your personal library and flow to your own instrumentals,
              anywhere, anytime.
            </p>
          </div>
        )}
      </div>
      <UserBeatUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        isPro={!!isPro}
        onSuccess={() => {
          fetchBeats()
        }}
      />
      <PremiumModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        trigger="beat"
        beatCount={beats.length}
      />
      <Modal
        isOpen={Boolean(beatPendingDelete)}
        onClose={() => setBeatPendingDelete(null)}
        title="Delete Beat?"
      >
        <div className="space-y-4">
          <p className="text-text-secondary">
            {beatPendingDelete
              ? `Remove "${beatPendingDelete.title}" from your library?`
              : 'Remove this beat from your library?'}
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setBeatPendingDelete(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={confirmDeleteBeat}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </ScreenPage>
  )
}
