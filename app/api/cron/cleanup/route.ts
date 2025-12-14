import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // 1. Secure Cron Route
    const authHeader = req.headers.get('authorization')
    if (
      authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
      process.env.NODE_ENV !== 'development'
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    // 2. Find Expired Sessions from Free Users
    const expiredSessions = await prisma.freestyleSession.findMany({
      where: {
        createdAt: { lt: sevenDaysAgo },
        user: {
          subscriptionStatus: 'free', // Ensure we target free users
        },
        storageUrl: { not: null }, // Only those with files
      },
      select: {
        id: true,
        storageUrl: true,
        userId: true,
      },
      take: 100, // Batch size to prevent timeouts
    })

    if (expiredSessions.length === 0) {
      return NextResponse.json({
        success: true,
        deletedCount: 0,
        message: 'No expired sessions found',
      })
    }

    // 3. Prepare File Paths for Deletion
    const pathsToDelete: string[] = []
    const idsToDelete: string[] = []

    expiredSessions.forEach((session: { id: string; storageUrl: string | null }) => {
      idsToDelete.push(session.id)

      // Extract path from Public URL
      // Format: .../storage/v1/object/public/recordings/{userId}/{filename}
      if (session.storageUrl) {
        try {
          const parts = session.storageUrl.split('/recordings/')
          if (parts.length > 1) {
            pathsToDelete.push(decodeURIComponent(parts[1]))
          }
        } catch (e) {
          console.warn('Failed to parse URL for session', session.id, e)
        }
      }
    })

    let storageDeletedCount = 0

    // 4. Delete from Storage (if Service Role Key is available)
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && pathsToDelete.length > 0) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: { persistSession: false },
        }
      )

      const { data, error } = await supabase.storage.from('recordings').remove(pathsToDelete)

      if (error) {
        console.error('Storage Cleanup Error:', error)
      } else {
        storageDeletedCount = data?.length || 0
      }
    } else {
      console.warn('Skipping Storage Deletion: Missing SUPABASE_SERVICE_ROLE_KEY or no paths')
    }

    // 5. Delete from Database
    const dbResult = await prisma.freestyleSession.deleteMany({
      where: {
        id: { in: idsToDelete },
      },
    })

    return NextResponse.json({
      success: true,
      found: expiredSessions.length,
      storageDeleted: storageDeletedCount,
      dbDeleted: dbResult.count,
    })
  } catch (error: any) {
    console.error('Cleanup Error:', error)
    return NextResponse.json({ error: 'Cleanup failed: ' + error.message }, { status: 500 })
  }
}
