import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * DELETE /api/admin/cleanup-beats
 * Removes beats with invalid (external) URLs that cannot be played
 */
export async function DELETE() {
  try {
    // Find all beats with external URLs (Pixabay, etc.)
    const externalBeats = await prisma.beat.findMany({
      where: {
        OR: [
          { storageUrl: { contains: 'pixabay' } },
          { storageUrl: { contains: 'example.com' } },
          { storageUrl: { startsWith: 'http' } },
        ],
        // Only delete beats that don't have a local storageUrl
        NOT: {
          storageUrl: { startsWith: '/beats/' },
        },
      },
    })

    if (externalBeats.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No external beats found to clean up',
        deleted: 0,
      })
    }

    // Delete sessions associated with these beats first (foreign key constraint)
    await prisma.freestyleSession.deleteMany({
      where: {
        beatId: { in: externalBeats.map((b) => b.id) },
      },
    })

    // Delete the beats
    const result = await prisma.beat.deleteMany({
      where: {
        id: { in: externalBeats.map((b) => b.id) },
      },
    })

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${result.count} beats with invalid URLs`,
      deleted: result.count,
      beatTitles: externalBeats.map((b) => b.title),
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to clean up beats' },
      { status: 500 }
    )
  }
}
