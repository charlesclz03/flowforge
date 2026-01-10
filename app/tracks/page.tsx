'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/organisms/common'
import { BeatGridCard } from '@/components/molecules/tracks/BeatGridCard'
import { Beat } from '@/types/database'
import { Search, Music, Plus, Lock } from 'lucide-react'
import { getFavoriteBeatIds, toggleBeatFavorite } from '@/app/actions/beats'

import { useSession } from 'next-auth/react'
import { UserBeatUploadModal } from '@/components/molecules/practice/UserBeatUploadModal'
import { PremiumModal } from '@/components/molecules/monetization/PremiumModal'
import { AppHeader } from '@/components/organisms/layout/AppHeader'

export default function TracksPage() {
  const [beats, setBeats] = useState<Beat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [playingBeatId, setPlayingBeatId] = useState<string | null>(null)

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

  const filteredBeats = beats
    .filter((b) => {
      if (activeTab === 'mine') {
        return b.uploaderId && b.uploaderId === session?.user?.id
      } else {
        return !b.uploaderId // System beats
      }
    })
    .filter(
      (b) =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.artistName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.tags.some((t: string) =>
          t.toLowerCase().includes(searchQuery.toLowerCase())
        )
    )

  return (
    <div className="min-h-screen bg-background pb-32">
      <AppHeader />
      <audio ref={audioRef} className="hidden" />

      <div className="px-6 pt-12 pb-6 space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader
            title="Beat Vault"
            description="Discover beats for your next session."
          />
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex p-1 bg-surface-elevated/50 rounded-xl w-fit">
            <button
              onClick={() => handleTabChange('public')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'public'
                  ? 'bg-accent-purple text-white shadow-sm'
                  : 'text-text-tertiary hover:text-white'
              }`}
            >
              Public Tracks
            </button>
            <button
              onClick={() => handleTabChange('mine')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'mine'
                  ? 'bg-accent-purple text-white shadow-sm'
                  : 'text-text-tertiary hover:text-white'
              }`}
            >
              My Tracks
              {!isPro && <Lock size={12} className="opacity-70" />}
            </button>
          </div>

          <button
            onClick={handleNewBeatClick}
            className="flex items-center gap-2 px-4 py-2 bg-accent-purple text-white rounded-lg font-medium text-sm hover:scale-105 transition-transform"
          >
            {isPro ? <Plus size={16} /> : <Lock size={16} />}
            <span>New Beat</span>
          </button>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
              size={18}
            />
            <input
              type="text"
              placeholder="Search beats, flow types, and drill vibes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 text-white placeholder:text-text-tertiary focus:outline-none focus:border-accent-purple/50 focus:ring-1 focus:ring-accent-purple/50 transition-all"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl bg-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
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

        {filteredBeats.length === 0 && !isLoading && searchQuery.length > 0 && (
          <div className="py-20 text-center space-y-4 opacity-50">
            <div className="mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <Music size={32} />
            </div>
            <p>No beats found looking for &quot;{searchQuery}&quot;</p>
          </div>
        )}

        {filteredBeats.length === 0 &&
          !isLoading &&
          searchQuery.length === 0 &&
          activeTab === 'public' && (
            <div className="py-20 text-center space-y-4 opacity-50">
              <div className="mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <Music size={32} />
              </div>
              <p>No beats available. Pull to refresh.</p>
            </div>
          )}

        {filteredBeats.length === 0 &&
          !isLoading &&
          activeTab === 'mine' &&
          searchQuery.length === 0 && (
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
    </div>
  )
}
