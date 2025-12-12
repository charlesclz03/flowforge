'use server'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'

export async function toggleFollow(targetUserId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const currentUserId = session.user.id

  if (currentUserId === targetUserId) {
    throw new Error('Cannot follow yourself')
  }

  // Check if already following
  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: currentUserId,
        followingId: targetUserId,
      },
    },
  })

  if (existingFollow) {
    // Unfollow
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    })

    revalidatePath(`/u/${targetUserId}`)
    revalidatePath(`/u/${currentUserId}`) // Revalidate own profile (following count)
    return { isFollowing: false }
  } else {
    // Follow
    await prisma.follow.create({
      data: {
        followerId: currentUserId,
        followingId: targetUserId,
      },
    })

    revalidatePath(`/u/${targetUserId}`)
    revalidatePath(`/u/${currentUserId}`)
    return { isFollowing: true }
  }
}

export async function toggleLike(sessionId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const currentUserId = session.user.id

  const existingLike = await prisma.like.findUnique({
    where: {
      userId_sessionId: {
        userId: currentUserId,
        sessionId: sessionId,
      },
    },
  })

  if (existingLike) {
    await prisma.like.delete({
      where: {
        userId_sessionId: {
          userId: currentUserId,
          sessionId: sessionId,
        },
      },
    })
    return { isLiked: false }
  } else {
    await prisma.like.create({
      data: {
        userId: currentUserId,
        sessionId: sessionId,
      },
    })
    return { isLiked: true }
  }
}

export async function addComment(sessionId: string, content: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      sessionId,
      userId: session.user.id,
    },
    include: {
      user: true,
    },
  })

  revalidatePath('/feed') // Revalidate feed to show updated comment count
  return comment
}

export async function getChallengeSession(sessionId: string) {
  const session = await prisma.freestyleSession.findUnique({
    where: { id: sessionId },
    include: {
      beat: true,
    },
  })

  if (!session) return null

  return {
    beat: session.beat,
    frequency: session.frequency,
    difficulty: session.difficulty,
    user: session.userId, // Maybe we want to know who we are challenging
  }
}

export async function getComments(sessionId: string) {
  return prisma.comment.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
    },
  })
}

export async function updateSocials(socials: { instagram?: string; tiktok?: string }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Unauthorized')

  return prisma.user.update({
    where: { id: session.user.id },
    data: {
      socials: socials,
    },
  })
}
