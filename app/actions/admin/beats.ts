'use server'

import { prisma } from '@/lib/prisma'
import { Beat } from '@/types/database'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'

export async function getAdminBeats() {
  return await prisma.beat.findMany({
    where: {
      uploaderId: null, // Only fetch public beats for admin management
    },
    orderBy: [
      { sortOrder: 'asc' },
      { createdAt: 'desc' },
    ] as Prisma.BeatOrderByWithRelationInput[],
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
  // 1. Fetch ALL admin beats in current sorted order
  const allBeats = await prisma.beat.findMany({
    where: { uploaderId: null },
    orderBy: [
      { sortOrder: 'asc' },
      { createdAt: 'desc' },
    ] as Prisma.BeatOrderByWithRelationInput[],
  })

  const currentIndex = allBeats.findIndex((b) => b.id === id)
  if (currentIndex === -1) return

  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

  // Check bounds
  if (targetIndex < 0 || targetIndex >= allBeats.length) return

  // 2. Create a new ordered list with the swap
  const newOrder = [...allBeats]
  // Swap
  ;[newOrder[currentIndex], newOrder[targetIndex]] = [
    newOrder[targetIndex],
    newOrder[currentIndex],
  ]

  // 3. Update ALL beats with their new normalized index
  // We use a transaction to ensure integrity
  await prisma.$transaction(
    newOrder.map((beat, index) =>
      prisma.beat.update({
        where: { id: beat.id },
        data: { sortOrder: index },
      })
    )
  )

  revalidatePath('/admin/beats')
  revalidatePath('/tracks')
}
