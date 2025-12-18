import { NextResponse } from 'next/server'
import { getServerSessionWithUserId } from '@/lib/auth/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSessionWithUserId()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const wordCount = await prisma.collectedWord.count({
      where: { userId: session.user.id },
    })

    return NextResponse.json({
      wordVaultCount: wordCount,
      totalWordsPool: 2000, // Matching the Bible requirement stat: "X / 2000"
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}