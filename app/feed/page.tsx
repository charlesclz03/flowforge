import { prisma } from '@/lib/prisma'
import { Container } from '@/components/layout/Container'
import { SessionFeedCard } from '@/components/molecules/social/SessionFeedCard'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

async function getFeed(currentUserId?: string, type: 'trending' | 'following' = 'trending') {
  let whereClause = {}

  if (type === 'following' && currentUserId) {
    // 1. Get IDs of users I follow
    const following = await prisma.follow.findMany({
      where: { followerId: currentUserId },
      select: { followingId: true },
    })
    const followingIds = following.map((f) => f.followingId)

    whereClause = {
      userId: { in: followingIds },
    }
  }

  const sessions = await prisma.freestyleSession.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      user: true,
      beat: true,
      _count: {
        select: { likes: true, comments: true },
      },
      likes: currentUserId
        ? {
            where: { userId: currentUserId },
            select: { userId: true },
          }
        : false,
    },
  })

  return sessions.map((session) => ({
    ...session,
    isLikedByCurrentUser: currentUserId ? session.likes.length > 0 : false,
  }))
}

interface FeedPageProps {
  searchParams: {
    tab?: string
  }
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const session = await getServerSession(authOptions)
  const currentUserId = session?.user?.id

  const activeTab = searchParams.tab === 'following' && currentUserId ? 'following' : 'trending'
  const feedItems = await getFeed(currentUserId, activeTab)

  return (
    <Container className="py-8 max-w-2xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Community Feed
          </h1>
        </div>

        {/* Feed Tabs */}
        <div className="flex p-1 bg-surface-elevated rounded-lg w-full sm:w-auto self-start inline-flex">
          <Link
            href="/feed?tab=trending"
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md transition-all flex-1 sm:flex-none text-center',
              activeTab === 'trending'
                ? 'bg-background-card text-white shadow-sm'
                : 'text-text-tertiary hover:text-white'
            )}
          >
            In The House
          </Link>
          {currentUserId && (
            <Link
              href="/feed?tab=following"
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-all flex-1 sm:flex-none text-center',
                activeTab === 'following'
                  ? 'bg-background-card text-white shadow-sm'
                  : 'text-text-tertiary hover:text-white'
              )}
            >
              People You Follow
            </Link>
          )}
        </div>

        <div className="space-y-4">
          {feedItems.length === 0 ? (
            <div className="text-center py-16 px-4 border border-dashed border-stroke-subtle rounded-xl">
              <p className="text-text-secondary text-lg font-medium mb-2">
                {activeTab === 'following' ? 'No flows from your crew yet.' : 'The block is quiet.'}
              </p>
              <p className="text-text-tertiary text-sm">
                {activeTab === 'following'
                  ? 'Follow more artists to populate your feed!'
                  : 'Be the first to drop some bars!'}
              </p>
            </div>
          ) : (
            feedItems.map((item) => <SessionFeedCard key={item.id} session={item} />)
          )}
        </div>
      </div>
    </Container>
  )
}
