'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

import { BeatGridCard } from '@/components/molecules/tracks/BeatGridCard'
import { Beat } from '@/types/database'
import { Music, Plus, Lock, Settings } from 'lucide-react'
import { getFavoriteBeatIds, toggleBeatFavorite } from '@/app/actions/beats'

import { useSession } from 'next-auth/react'
import { UserBeatUploadModal } from '@/components/molecules/practice/UserBeatUploadModal'
import { PremiumModal } from '@/components/molecules/monetization/PremiumModal'
import { AppHeader } from '@/components/organisms/layout/AppHeader'
import { ScreenPage } from '@/components/layout/ScreenPage'
import { cn } from '@/lib/utils'

// Desktop responsiveness fix applied
export default function TracksPage() {
  const [beats, setBeats] = useState<Beat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())

  const [playingBeatId, setPlayingBeatId] = useState<string | null>(null)
  const [selectedGenre, setSelectedGenre] = useState<string>('All')

  const { data: session } = useSession()
  const router = useRouter()
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)

  const user = session?.user
  const isPro =
    user?.subscriptionStatus === 'active' ||
    user?.subscriptionStatus === 'trialing' ||
    user?.role === 'SUPERADMIN'

  const handleUseTrack = (beat: Beat) => {
    router.push(`/difficultyselection?beatId=${beat.id}`)
  }

  const fetchBeats = useCallback(async () => {
    setIsLoading(true)
    try {
      const [beatsRes, userBeatsRes, favs] = await Promise.all([
        fetch('/api/beats')
          .then((res) => (res.ok ? res.json() : { beats: [] }))
          .catch(() => ({ beats: [] })),
        fetch('/api/user/beats')
          .then((res) =>
            res.ok &&
            res.headers.get('content-type')?.includes('application/json')
              ? res.json()
              : { beats: [] }
          )
          .catch(() => ({ beats: [] })),
        getFavoriteBeatIds().catch(() => []),
      ])

      let publicBeats = beatsRes.beats || []
      const userBeats = userBeatsRes.beats || []

      // Client-side Fallback
      if (publicBeats.length === 0) {
        publicBeats = [
          {
            id: 'fallback-1',
            title: 'Classic Flow (Offline)',
            bpm: 90,
            storageUrl: '/beats/2-Naughty.mp3',
            isPremium: false,
            artistName: 'FreeStyla Default',
            genre: 'Boom Bap',
            duration: 180,
            tags: ['offline', 'fallback'],
          },
          {
            id: 'fallback-2',
            title: 'Modern Trap (Offline)',
            bpm: 140,
            storageUrl: '/beats/2-Naughty.mp3',
            isPremium: false,
            artistName: 'FreeStyla Default',
            genre: 'Trap',
            duration: 180,
            tags: ['offline', 'fallback'],
          },
        ]
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
  }, [])

  useEffect(() => {
    fetchBeats()

    const audio = audioRef.current
    return () => {
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
    }
  }, [fetchBeats])

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

  const handleDeleteBeat = async (beatId: string) => {
    if (!confirm('Are you sure you want to delete this beat?')) return

    try {
      const res = await fetch(`/api/user/beats/${beatId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete')

      setBeats((prev) => prev.filter((b) => b.id !== beatId))
    } catch (e) {
      console.error(e)
      alert('Failed to delete beat')
    }
  }

  const [activeTab, setActiveTab] = useState<'public' | 'mine'>('public')

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
      footer={<div className="h-24" />} /* spacer for bottom nav */
    >
      <audio ref={audioRef} className="hidden" />

      <div className="px-6 py-6 space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex p-1 bg-surface-elevated/50 rounded-xl w-fit">
            <button
              onClick={() => handleTabChange('public')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center ${
                activeTab === 'public'
                  ? 'bg-accent-purple/10 text-accent-purple border border-accent-purple/20 shadow-[0_0_15px_rgba(125,122,255,0.15)]'
                  : 'text-text-tertiary hover:text-white'
              }`}
            >
              Public Tracks
            </button>
            <button
              onClick={() => handleTabChange('mine')}
              className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'mine'
                  ? 'bg-accent-purple/10 text-accent-purple border border-accent-purple/20 shadow-[0_0_15px_rgba(125,122,255,0.15)]'
                  : 'text-text-tertiary hover:text-white'
              }`}
            >
              My Tracks
              {!isPro && <Lock size={12} className="opacity-70" />}
            </button>
          </div>

          {session?.user?.role === 'SUPERADMIN' && (
            <button
              onClick={() => router.push('/admin/beats')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg font-medium text-sm hover:bg-red-500/20 hover:scale-105 transition-all shadow-[0_0_15px_rgba(248,113,113,0.15)] mr-2"
            >
              <Settings size={16} />
              <span>Admin</span>
            </button>
          )}
          <button
            onClick={handleNewBeatClick}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-accent-purple/10 text-accent-purple border border-accent-purple/20 rounded-lg font-medium text-sm hover:bg-accent-purple/20 hover:scale-105 transition-all shadow-[0_0_15px_rgba(125,122,255,0.15)]"
          >
            {isPro ? <Plus size={16} /> : <Lock size={16} />}
            <span>New Beat</span>
          </button>
        </div>

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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl bg-white/5 animate-pulse"
              />
            ))}
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
                onUseTrack={() => handleUseTrack(beat)}
                onDelete={
                  beat.uploaderId && beat.uploaderId === session?.user?.id
                    ? () => handleDeleteBeat(beat.id)
                    : undefined
                }
              />
            ))}
          </div>
        )}

        {filteredBeats.length === 0 && !isLoading && activeTab === 'public' && (
          <div className="py-20 text-center space-y-4 opacity-50">
            <div className="mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <Music size={32} />
            </div>
            <p>No beats available. Pull to refresh.</p>
          </div>
        )}

        {filteredBeats.length === 0 && !isLoading && activeTab === 'mine' && (
          <div className="py-20 text-center space-y-4 px-6 opacity-50">
            <div className="mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <Music size={32} />
            </div>
            <p className="text-lg font-bold text-white">
              Capture your own sound.
            </p>
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
      />
    </ScreenPage>
  )
}
