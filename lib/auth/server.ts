import { getServerSession } from 'next-auth'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Get the current user's ID from the server session
 * Works with database sessions by querying the database
 */
async function resolveUserIdFromSession(
  session: Session
): Promise<string | null> {
  if (session.user.id) {
    return session.user.id
  }

  if (session.user.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })
    return user?.id || null
  }

  return null
}

export async function getServerUserId(
  sessionOverride?: Session | null
): Promise<string | null> {
  try {
    const session = sessionOverride ?? (await getServerSession(authOptions))

    if (!session?.user) {
      return null
    }

    return await resolveUserIdFromSession(session)
  } catch (error) {
    console.error('Error getting server user ID:', error)
    return null
  }
}

/**
 * Get the current user's session with user ID
 */
export async function getServerSessionWithUserId() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return null
  }

  const userId = await getServerUserId(session)

  if (!session || !userId) {
    return null
  }

  return {
    ...session,
    user: {
      ...session.user,
      id: userId,
    },
  }
}
