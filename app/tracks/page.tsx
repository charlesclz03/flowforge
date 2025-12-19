'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/organisms/common'
import { BeatGridCard } from '@/components/molecules/tracks/BeatGridCard'
import { Beat } from '@/types/database'
import { Disc3, Search, SlidersHorizontal, Music } from 'lucide-react'
import { BeatDropdown } from '@/components/molecules/practice/BeatDropdown' // Import type or similar if needed? No, we use BeatGridCard
import { Input } from '@/components/atoms/Input'
import { getFavoriteBeatIds, toggleBeatFavorite } from '@/app/actions/beats'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

// Mocking getBeats for client-side example, or duplicate logic.
// In reality, we should fetch from API or pass as server props.
// For now, fetching client side.

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
        const [beatsRes, favs] = await Promise.all([
          fetch('/api/beats').then(res => res.json()),
          getFavoriteBeatIds()
        ])
        setBeats(beatsRes)
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
      // Stop logic would need audio context or ref
      // Ideally we use a global player or local audio element.
      // For MVP, simplistic preview:
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
    // Optimistic Update
    const newFavs = new Set(favoriteIds)
    if (newFavs.has(beatId)) {
      newFavs.delete(beatId)
    } else {
      newFavs.add(beatId)
    }
    setFavoriteIds(newFavs)

    await toggleBeatFavorite(beatId)
  }

  const filteredBeats = beats.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.artistName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-background pb-32"> {/* pb-32 for bottom nav */}
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

        {/* Search & Filter */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
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

        {/* Beats Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-square rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredBeats.map(beat => (
              <BeatGridCard
                key={beat.id}
                beat={beat}
                isSelected={false} // No selection state in this view (yet)
                isPlaying={playingBeatId === beat.id}
                isFavorited={favoriteIds.has(beat.id)}
                onPlay={() => handlePlay(beat)}
                onSelect={() => router.push(`/practice?beat=${beat.id}`)} // Or open modal? "clicking one starts a practice session"
                onToggleFavorite={(e) => handleToggleFavorite(beat.id, e)}
              />
            ))}
          </div>
        )}

        {filteredBeats.length === 0 && !isLoading && (
          <div className="py-20 text-center space-y-4 opacity-50">
            <div className="mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <Music size={32} />
            </div>
            <p>No beats found looking for "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  )
}
