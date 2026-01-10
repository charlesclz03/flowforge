'use server'

import { prisma } from '@/lib/prisma'
import { Beat } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function getAdminBeats() {
  return await prisma.beat.findMany({
    where: {
      uploaderId: null, // Only fetch public beats for admin management
    },
    orderBy: {
      sortOrder: 'asc', // Default sort by custom order
    } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
  })
}

export async function updateBeat(id: string, data: Partial<Beat>) {
  const result = await prisma.beat.update({
    where: { id },
    data,
  })
  revalidatePath('/admin/beats')
  revalidatePath('/tracks') // Update public tracks page
  return result
}

export async function deleteBeat(id: string) {
  await prisma.beat.delete({
    where: { id },
  })
  revalidatePath('/admin/beats')
  revalidatePath('/tracks')
}

export async function reorderBeat(id: string, direction: 'up' | 'down') {
  const currentBeat = await prisma.beat.findUnique({ where: { id } })
  if (!currentBeat) return

  // Find adjacent beat
  const operator = direction === 'up' ? 'lt' : 'gt'
  const orderDirection = direction === 'up' ? 'desc' : 'asc'

  const adjacentBeat = await prisma.beat.findFirst({
    where: {
      uploaderId: null,
      sortOrder: {
        [operator]: (currentBeat as any).sortOrder, // eslint-disable-line @typescript-eslint/no-explicit-any
      },
    } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    orderBy: {
      sortOrder: orderDirection,
    } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
  })

  if (adjacentBeat) {
    // Swap sortOrders using a transaction
    await prisma.$transaction([
      prisma.beat.update({
        where: { id: currentBeat.id },
        data: { sortOrder: (adjacentBeat as any).sortOrder } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      }),
      prisma.beat.update({
        where: { id: adjacentBeat.id },
        data: { sortOrder: (currentBeat as any).sortOrder } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      }),
    ])

    revalidatePath('/admin/beats')
    revalidatePath('/tracks')
  }
}
