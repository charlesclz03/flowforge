import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Get the current user's ID from the server session
 * Works with database sessions by querying the database
 */
export async function getServerUserId(): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return null
    }

    // With database sessions, user.id might not be in session directly
    // Try to get it from session.user.id first (set by callback)
    if (session.user.id) {
      return session.user.id
    }

    // Fallback: Query database for user by email
    if (session.user.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      })
      return user?.id || null
    }

    return null
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
  const userId = await getServerUserId()

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
