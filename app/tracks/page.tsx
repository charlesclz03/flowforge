'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/organisms/common'
import { BeatGridCard } from '@/components/molecules/tracks/BeatGridCard'
import { Beat } from '@/types/database'
import { Disc3, Search, SlidersHorizontal, Music } from 'lucide-react'
import { getFavoriteBeatIds, toggleBeatFavorite } from '@/app/actions/beats'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function TracksPage() {
  const [beats, setBeats] = useState<Beat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [playingBeatId, setPlayingBeatId] = useState<string | null>(null)
  const router = useRouter()
  const { data: session } = useSession()

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

  const filteredBeats = beats.filter(
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
          <div className="h-12 w-12 rounded-full bg-accent-purple/10 flex items-center justify-center border border-accent-purple/20">
            <Disc3 className="text-accent-purple animate-spin-slow" size={24} />
          </div>
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
          <button className="h-12 w-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-text-secondary hover:text-white hover:bg-white/10 transition-colors">
            <SlidersHorizontal size={20} />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
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

        {filteredBeats.length === 0 && !isLoading && (
          <div className="py-20 text-center space-y-4 opacity-50">
            <div className="mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <Music size={32} />
            </div>
            <p>No beats found looking for &quot;{searchQuery}&quot;</p>
          </div>
        )}
      </div>
    </div>
  )
}
