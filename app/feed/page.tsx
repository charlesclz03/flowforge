import { prisma } from '@/lib/prisma'
import { Card } from '@/components/atoms/Card'
import { Beat } from '@prisma/client'
import Link from 'next/link'
import { Play, TrendingUp, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getTrendingDuels() {
  // Find sessions that HAVE a parent (are responses)
  // and order them by recent activity or votes?
  // Schema doesn't have "votesCount" on session efficiently.
  // For MVP, just get recent responses.
  const duels = await prisma.freestyleSession.findMany({
    where: {
      parentId: { not: null } // Only duels
    },
    include: {
      user: true,
      parent: {
        include: { user: true, beat: true }
      },
      _count: {
        select: { duelVotesWon: true } // Votes for this challenger
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 10
  })
  return duels
}

async function getRecentCommunityBeats() {
  const beats = await prisma.beat.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
  })
  return beats
}

export default async function FeedPage() {
  const trendingDuels = await getTrendingDuels()
  const recentBeats = await getRecentCommunityBeats()

  return (
    <div className="min-h-screen bg-background pt-20 px-4 pb-20 max-w-7xl mx-auto space-y-12">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-white tracking-tighter italic">
          DISCOVER
        </h1>
        <p className="text-text-secondary">
          Check out the latest battles and freshest beats.
        </p>
      </div>

      {/* Trending Duels Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-accent-gold">
            <TrendingUp />
            <h2 className="text-xl font-bold tracking-wide">TRENDING BATTLES</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingDuels.map((duel) => (
                <Link key={duel.id} href={`/duels/${duel.id}`} className="group">
                    <Card padding="none" className="h-full overflow-hidden hover:border-accent-gold/50 transition-colors">
                        <div className="aspect-video bg-black/50 relative">
                             {/* Thumbnail Simulation */}
                            <div className="absolute inset-0 flex">
                                <div className="w-1/2 bg-gray-900 border-r border-white/10 flex items-center justify-center">
                                    <span className="text-xs text-white/30">{duel.parent?.user.username}</span>
                                </div>
                                <div className="w-1/2 bg-gray-800 flex items-center justify-center">
                                     <span className="text-xs text-white/30">{duel.user.username}</span>
                                </div>
                            </div>
                            
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[1px]">
                                <div className="bg-accent-gold text-black rounded-full p-3">
                                    <Play size={24} fill="currentColor" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-4 space-y-2">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-white truncate pr-2">
                                    {duel.parent?.user.username} vs {duel.user.username}
                                </h3>
                                <div className="px-2 py-0.5 bg-white/10 rounded text-xs text-text-secondary whitespace-nowrap">
                                    {duel._count.duelVotesWon} votes
                                </div>
                            </div>
                            <p className="text-sm text-text-tertiary truncate">
                                on {duel.parent?.beat.title}
                            </p>
                        </div>
                    </Card>
                </Link>
            ))}
            
            {trendingDuels.length === 0 && (
                <div className="col-span-full py-12 text-center text-text-tertiary bg-surface-elevation-1 rounded-xl border border-white/5">
                    No active battles yet. <Link href="/practice" className="text-accent-primary underline">Start one!</Link>
                </div>
            )}
        </div>
      </section>

      {/* Community Beats */}
      <section className="space-y-6">
          <div className="flex items-center gap-2 text-accent-cyan">
            <Users />
            <h2 className="text-xl font-bold tracking-wide">FRESH DROPS</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             {recentBeats.map((beat) => (
                 <Card key={beat.id} className="group cursor-pointer hover:bg-surface-elevation-2">
                     <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-surface-elevation-3 rounded flex items-center justify-center font-bold text-text-secondary group-hover:text-accent-cyan transition-colors">
                             ♪
                         </div>
                         <div className="flex-1 min-w-0">
                             <h4 className="font-bold text-white truncate">{beat.title}</h4>
                             <p className="text-xs text-text-tertiary truncate">{beat.artistName || 'Unknown'}</p>
                         </div>
                         <div className="text-xs text-text-secondary bg-white/5 px-2 py-1 rounded">
                             {beat.bpm} BPM
                         </div>
                     </div>
                 </Card>
             ))}
        </div>
      </section>

    </div>
  )
}
