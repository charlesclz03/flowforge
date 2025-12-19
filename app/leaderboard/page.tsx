import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Container } from '@/components/atoms/Container'
import { PageHeader } from '@/components/organisms/common'
import { LeaderboardRow } from '@/components/molecules/leaderboard/LeaderboardRow'
import { Trophy } from 'lucide-react'
import Link from 'next/link'
import { OnboardingLayout } from '@/components/organisms/layout/OnboardingLayout'

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
  const where: Prisma.UserAchievementWhereInput = {}

  if (period === 'weekly') {
    // Resetting every Wednesday logic
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    // Adjust to last Wednesday
    // Day 0 = Sun, 3 = Wed.
    // If today is Wed (3), diff is 0? No, resetting every Wednesday means from THIS Wednesday.
    // If today is Thu, from yesterday.
    // If today is Tue, from last Wed.
    const day = d.getDay() // 0-6
    const diff = (day < 3 ? 7 : 0) + day - 3
    d.setDate(d.getDate() - diff)

    where.unlockedAt = { gte: d }
  }

  // Fetch all achievements in period
  // We want to sum points per user.
  // Fastest way might be raw query but let's stick to Prisma for now.
  const userAchievements = await prisma.userAchievement.findMany({
    where,
    select: {
      userId: true,
      achievement: {
        select: { points: true },
      },
    },
  })

  // Aggregate
  const scores: Record<string, number> = {}
  userAchievements.forEach((ua) => {
    scores[ua.userId] = (scores[ua.userId] || 0) + ua.achievement.points
  })

  // Sort and take top 50
  const sortedEntries = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 50)

  if (sortedEntries.length === 0) return []

  // Fetch User Details
  const userIds = sortedEntries.map(([uid]) => uid)
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
    },
  })

  // Map back
  return sortedEntries.map(([uid, score]) => {
    const user = users.find((u) => u.id === uid)
    return {
      id: uid,
      username: user?.username || null,
      name: user?.name || null,
      image: user?.image || null,
      flowPoints: score, // Mapping "points" to flowPoints prop for compatibility with LeaderboardRow
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
    <OnboardingLayout showBackButton={false} showSettings={true} className="bg-background">
      <Container className="pt-8 pb-32">
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
    </OnboardingLayout>
  )
}
