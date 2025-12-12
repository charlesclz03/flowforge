'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function toggleBeatFavorite(beatId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new Error('Unauthorized')
    }

    const userId = session.user.id

    // Check if exists
    const existing = await prisma.favoriteBeat.findUnique({
      where: {
        userId_beatId: {
          userId,
          beatId,
        },
      },
    })

    if (existing) {
      // Remove
      await prisma.favoriteBeat.delete({
        where: {
          userId_beatId: {
            userId,
            beatId,
          },
        },
      })
      return { favorited: false }
    } else {
      // Add
      await prisma.favoriteBeat.create({
        data: {
          userId,
          beatId,
        },
      })
      return { favorited: true }
    }
  } catch (error) {
    console.error('Failed to toggle favorite:', error)
    return { error: 'Failed to update favorite' }
  }
}

export async function getFavoriteBeatIds() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return []
    }

    const favorites = await prisma.favoriteBeat.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        beatId: true,
      },
    })

    return favorites.map((f) => f.beatId)
  } catch (error) {
    console.error('Failed to fetch favorites:', error)
    return []
  }
}
