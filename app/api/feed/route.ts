import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
export async function GET(req: Request) {
  try {
    // Optional: cursor based pagination
    const { searchParams } = new URL(req.url)
    const cursor = searchParams.get('cursor')

    const items = await prisma.freestyleSession.findMany({
      take: 10,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      where: {
        // sessions with audio
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
          },
        },
      },
    })

    const nextCursor = items.length === 10 ? items[items.length - 1].id : null

    // Sign URLs for playback
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
          storageUrl: data?.signedUrl || item.storageUrl, // Fallback if signing fails
        }
      })
    )

    return NextResponse.json({ items: itemsWithSignedUrls, nextCursor })
  } catch (error) {
    console.error('[FEED_GET]', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}
