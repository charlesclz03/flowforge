import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AppHeader } from '@/components/organisms/layout/AppHeader'
import { Container } from '@/components/atoms/Container'
import { PageHeader } from '@/components/organisms/common'
import { LeaderboardRow } from '@/components/molecules/social/LeaderboardRow'
import { Trophy } from 'lucide-react'

// Cache for 60 seconds
export const revalidate = 60

async function getLeaderboard() {
  return prisma.user.findMany({
    take: 50,
    orderBy: {
      flowPoints: 'desc',
    },
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
      flowPoints: true,
    },
  })
}

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions)
  const currentUserId = session?.user?.id
  const users = await getLeaderboard()

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader />
      <Container className="pt-8">
        <PageHeader title="Leaderboard" description="Top flows this week." />

        <div className="mt-8 space-y-4 max-w-2xl mx-auto">
          {/* Header / Tabs placeholder */}
          <div className="flex gap-4 mb-6 border-b border-white/10 pb-2">
            <button className="px-4 py-2 text-white font-medium border-b-2 border-accent-purple">
              All Time
            </button>
            <button className="px-4 py-2 text-text-tertiary hover:text-white transition-colors">
              Weekly
            </button>
          </div>

          <div className="space-y-3">
            {users.map((user, index) => (
              <LeaderboardRow
                key={user.id}
                rank={index + 1}
                userId={user.id}
                username={user.username || user.name || 'Anonymous'}
                image={user.image}
                score={user.flowPoints}
                isCurrentUser={user.id === currentUserId}
              />
            ))}

            {users.length === 0 && (
              <div className="text-center py-12 text-text-tertiary">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No legends yet. Be the first.</p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  )
}
