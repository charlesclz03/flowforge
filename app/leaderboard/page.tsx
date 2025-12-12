import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AppHeader } from '@/components/organisms/layout/AppHeader'
import { Container } from '@/components/atoms/Container'
import { PageHeader } from '@/components/organisms/common'
import { LeaderboardRow } from '@/components/molecules/social/LeaderboardRow'
import { Trophy } from 'lucide-react'
import Link from 'next/link'

// Cache for 60 seconds
export const revalidate = 60

type Period = 'all_time' | 'weekly'

async function getLeaderboard(period: Period = 'all_time') {
  if (period === 'weekly') {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    // Aggregate scores from sessions in the last 7 days
    const weeklyScores = await prisma.freestyleSession.groupBy({
      by: ['userId'],
      where: {
        createdAt: { gte: sevenDaysAgo },
        score: { gt: 0 }, // Only count scored sessions
      },
      _sum: {
        score: true,
      },
      orderBy: {
        _sum: {
          score: 'desc',
        },
      },
      take: 50,
    })

    // Fetch user details for these scores
    const userIds = weeklyScores.map((s) => s.userId)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
      },
    })

    // Map scores back to users
    return weeklyScores.map((scoreEntry) => {
      const user = users.find((u) => u.id === scoreEntry.userId)
      return {
        id: scoreEntry.userId,
        username: user?.username,
        name: user?.name,
        image: user?.image,
        flowPoints: scoreEntry._sum.score || 0,
      }
    })
  }

  // All Time: Use the pre-calculated flowPoints field on User
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
      <AppHeader />
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
