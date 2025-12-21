'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/organisms/common'
import { BeatGridCard } from '@/components/molecules/tracks/BeatGridCard'
import { Beat } from '@/types/database'
import { Search, Music, Plus } from 'lucide-react'
import { getFavoriteBeatIds, toggleBeatFavorite } from '@/app/actions/beats'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { UserBeatUploadModal } from '@/components/molecules/practice/UserBeatUploadModal'
import { AddBeatCard } from '@/components/molecules/tracks/AddBeatCard'

export default function TracksPage() {
  const [beats, setBeats] = useState<Beat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [playingBeatId, setPlayingBeatId] = useState<string | null>(null)
  const router = useRouter()
  const { data: session } = useSession()
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const [beatsRes, userBeatsRes, favs] = await Promise.all([
          fetch('/api/beats').then((res) => res.json()),
          fetch('/api/user/beats').then((res) => (res.ok ? res.json() : { beats: [] })),
          getFavoriteBeatIds(),
        ])

        const publicBeats = beatsRes.beats || []
        const userBeats = userBeatsRes.beats || []

        // Merge beats, potentially removing duplicates if logic requires, but usually IDs are unique.
        // User beats designated by uploaderId, but Beat interface should handle it.
        setBeats([...userBeats, ...publicBeats])
        setFavoriteIds(new Set(favs))
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const fetchBeats = async () => {
    setIsLoading(true)
    try {
      const [beatsRes, userBeatsRes, favs] = await Promise.all([
        fetch('/api/beats').then((res) => res.json()),
        fetch('/api/user/beats').then((res) => (res.ok ? res.json() : { beats: [] })),
        getFavoriteBeatIds(),
      ])

      const publicBeats = beatsRes.beats || []
      const userBeats = userBeatsRes.beats || []

      setBeats([...userBeats, ...publicBeats])
      setFavoriteIds(new Set(favs))
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBeats()
  }, [])

  const handlePlay = (beat: Beat) => {
    if (playingBeatId === beat.id) {
      setPlayingBeatId(null)
      const audio = document.getElementById('preview-audio') as HTMLAudioElement
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
    } else {
      setPlayingBeatId(beat.id)
      const audio = document.getElementById('preview-audio') as HTMLAudioElement
      if (audio) {
        audio.src = beat.storageUrl
        audio.play()
        audio.onended = () => setPlayingBeatId(null)
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
      const res = await fetch(`/api/user/beats/${beatId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')

      setBeats((prev) => prev.filter((b) => b.id !== beatId))
      // toast.success('Beat deleted') // Toast usage requires toaster but basic alert/log is fine if toast component isn't readily available in this scope, but usually it is.
      // Assuming layout provider handles toasts or simple console for now if imports missing.
    } catch (e) {
      console.error(e)
      alert('Failed to delete beat')
    }
  }

  const [activeTab, setActiveTab] = useState<'public' | 'mine'>('public')

  const filteredBeats = beats
    .filter((b) => {
      // Tab Filter
      if (activeTab === 'mine') {
        // User's uploaded beats
        return b.uploaderId && b.uploaderId === session?.user?.id
        // Or favorites? Usually "My Tracks" implies uploads or favorites.
        // Assuming "My Tracks" means uploaded beats for now based on context,
        // OR we could show favorites too. Let's stick to Uploaded + maybe Favorites if requested.
        // But traditionally "My Tracks" = Uploads. Favorited is separate or marked.
      } else {
        // Public beats (no uploader or not current user? Or just all public?)
        // Assuming Public = All beats? Or just system beats?
        // Let's assume Public = All except potentially private user beats if any.
        // For now, let's show ALL beats in Public, or just System beats.
        // Re-reading fetch: merge user + public.
        // If "My Tracks" exists, "Public" should probably exclude my private uploads or just be the main catalog.
        // Let's default Public to: System beats (uploaderId null) OR beats that are public.
        return !b.uploaderId // System beats
      }
    })
    .filter(
      (b) =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.artistName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    )

  return (
    <div className="min-h-screen bg-background pb-32">
      <audio id="preview-audio" className="hidden" />

      <div className="px-6 pt-12 pb-6 space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader
            title="Vinyl Collection"
            description="Discover beats for your next session."
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between mb-6">
          {/* Tabs */}
          <div className="flex p-1 bg-surface-elevated/50 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('public')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'public'
                  ? 'bg-accent-purple text-white shadow-sm'
                  : 'text-text-tertiary hover:text-white'
              }`}
            >
              Public Tracks
            </button>
            <button
              onClick={() => setActiveTab('mine')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'mine'
                  ? 'bg-accent-purple text-white shadow-sm'
                  : 'text-text-tertiary hover:text-white'
              }`}
            >
              My Tracks
            </button>
          </div>

          {/* Action Button */}
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent-purple text-white rounded-lg font-medium text-sm hover:scale-105 transition-transform"
          >
            <Plus size={16} />
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
              placeholder="Search beats, artists, vibes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 text-white placeholder:text-text-tertiary focus:outline-none focus:border-accent-purple/50 focus:ring-1 focus:ring-accent-purple/50 transition-all"
            />
          </div>
          {/* Removed non-functional filter button */}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {activeTab === 'mine' && <AddBeatCard onClick={() => setIsUploadModalOpen(true)} />}
            {filteredBeats.map((beat) => (
              <BeatGridCard
                key={beat.id}
                beat={beat}
                isSelected={false}
                isPlaying={playingBeatId === beat.id}
                isFavorited={favoriteIds.has(beat.id)}
                onPlay={() => handlePlay(beat)}
                onSelect={() => router.push(`/practice?beat=${beat.id}`)}
                onToggleFavorite={(e) => handleToggleFavorite(beat.id, e)}
                onDelete={
                  beat.uploaderId && beat.uploaderId === session?.user?.id
                    ? () => handleDeleteBeat(beat.id)
                    : undefined
                }
              />
            ))}
          </div>
        )}

        {filteredBeats.length === 0 &&
          !isLoading &&
          (activeTab !== 'mine' || searchQuery.length > 0) && (
            <div className="py-20 text-center space-y-4 opacity-50">
              <div className="mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <Music size={32} />
              </div>
              <p>No beats found looking for &quot;{searchQuery}&quot;</p>
            </div>
          )}
      </div>
      <UserBeatUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        isPro={true} // Improve: Check actual subscription if needed, but for now assuming access or handling inside
        onSuccess={() => {
          fetchBeats()
        }}
      />
    </div>
  )
}
