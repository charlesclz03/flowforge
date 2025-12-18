import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Container } from '@/components/atoms/Container'
import { PageHeader } from '@/components/organisms/common'
import { LeaderboardRow } from '@/components/molecules/social/LeaderboardRow'
import { Trophy } from 'lucide-react'
import Link from 'next/link'

// Cache for 60 seconds
export const revalidate = 60

type Period = 'all_time' | 'weekly'

interface LeaderboardUser {
  id: string
  username: string | null
  name: string | null
  image: string | null
  flowPoints: number
}

async function getLeaderboard(period: Period = 'all_time'): Promise<LeaderboardUser[]> {
  const where: Prisma.FreestyleSessionWhereInput = {}

  if (period === 'weekly') {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    where.createdAt = { gte: sevenDaysAgo }
  }

  // Aggregate count of sessions per user
  const sessionCounts = await prisma.freestyleSession.groupBy({
    by: ['userId'],
    where,
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take: 50,
  })

  // Fetch user details for these sessions
  const userIds = sessionCounts.map((s) => s.userId)
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
    },
  })

  // Map back to LeaderboardUser format
  return sessionCounts.map((entry) => {
    const user = users.find((u) => u.id === entry.userId)
    return {
      id: entry.userId,
      username: user?.username || null,
      name: user?.name || null,
      image: user?.image || null,
      flowPoints: entry._count.id || 0,
    }
  })
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: { period?: string }
}) {
  const session = await getServerSession(authOptions)
  const currentUserId = session?.user?.id

  const period = (searchParams?.period === 'weekly' ? 'weekly' : 'all_time') as Period
  const users = await getLeaderboard(period)

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* AppHeader removed for gamified layout */}
      <Container className="pt-8">
        <PageHeader title="Leaderboard" description="Top flows this week." />

        <div className="mt-8 space-y-4 max-w-2xl mx-auto">
          {/* Header / Tabs */}
          <div className="flex gap-4 mb-6 border-b border-white/10 pb-2">
            <Link
              href="/leaderboard?period=all_time"
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                period === 'all_time'
                  ? 'text-white border-accent-purple'
                  : 'text-text-tertiary border-transparent hover:text-white'
              }`}
            >
              All Time
            </Link>
            <Link
              href="/leaderboard?period=weekly"
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                period === 'weekly'
                  ? 'text-white border-accent-purple'
                  : 'text-text-tertiary border-transparent hover:text-white'
              }`}
            >
              Weekly
            </Link>
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
