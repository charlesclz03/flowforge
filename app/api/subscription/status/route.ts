import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { subscriptionStatus: true, role: true },
  })

  const status = user?.subscriptionStatus ?? null
  const isPro =
    user?.role === 'SUPERADMIN' ||
    session.user.role === 'SUPERADMIN' ||
    status === 'active' ||
    status === 'trialing'

  return NextResponse.json({ subscriptionStatus: status, isPro })
}
