import { prisma } from '@/lib/prisma'
import { FeedItem } from '@/components/organisms/social/FeedItem'
import { Container } from '@/components/atoms/Container'
import { PageHeader } from '@/components/organisms/common'
import { ErrorBoundary } from '@/components/utils/ErrorBoundary'

export const dynamic = 'force-dynamic'

async function getInitialFeed() {
  try {
    const items = await prisma.freestyleSession.findMany({
      take: 10,
      where: {
        storageUrl: { not: '' },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: true,
        beat: true,
        _count: {
          select: {
            likes: true,
            comments: true,
            duels: true, // Count child sessions (responses)
          },
        },
      },
    })

    // Sign URLs for playback (Server Component Side)
    // We need to dynamically import Supabase here to avoid client/server bundle issues if any
    const { createServerClient, RECORDINGS_BUCKET } = await import('@/lib/supabase/server')
    const supabase = createServerClient()
    const SIGNED_URL_TTL_SECONDS = 60 * 60 // 1 hour

    const itemsWithSignedUrls = await Promise.all(
      items.map(async (item) => {
        if (!item.storageUrl || item.storageUrl.startsWith('http')) {
          return item
        }

        const { data } = await supabase.storage
          .from(RECORDINGS_BUCKET)
          .createSignedUrl(item.storageUrl, SIGNED_URL_TTL_SECONDS)

        return {
          ...item,
          storageUrl: data?.signedUrl || item.storageUrl,
        }
      })
    )

    return itemsWithSignedUrls
  } catch (error) {
    console.error('Failed to fetch feed:', error)
    return []
  }
}

export default async function FeedPage() {
  const feedItems = await getInitialFeed()

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* AppHeader removed for gamified feel - BottomNav handles navigation */}
      <Container className="pt-8">
        <PageHeader
          title="Community Feed"
          description="Discover the freshest flows from around the world."
        />

        <div className="mt-8 max-w-xl mx-auto space-y-6">
          <ErrorBoundary name="Community Feed">
            {feedItems.length > 0 ? (
              feedItems.map((item) => <FeedItem key={item.id} session={item} />)
            ) : (
              <div className="text-center py-12 text-text-tertiary">
                <p>The feed is quiet... too quiet.</p>
                <p className="text-sm mt-2">Go record something!</p>
              </div>
            )}
          </ErrorBoundary>
        </div>
      </Container>
    </div>
  )
}
