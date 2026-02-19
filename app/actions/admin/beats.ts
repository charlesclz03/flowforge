'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import { verifySuperAdmin } from '@/lib/auth/admin'
import { z } from 'zod'

const adminBeatUpdateSchema = z
  .object({
    title: z.string().trim().min(1).max(160).optional(),
    artistName: z.string().trim().max(120).optional(),
    label: z.string().trim().max(80).optional(),
    genre: z.string().trim().max(40).optional(),
    bpm: z.number().finite().positive().max(400).optional(),
    isPremium: z.boolean().optional(),
  })
  .strict()
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'At least one field is required',
  })

type AdminBeatUpdateInput = z.infer<typeof adminBeatUpdateSchema>

function toNullableString(
  value: string | undefined
): string | null | undefined {
  if (value === undefined) return undefined
  return value.length > 0 ? value : null
}

function normalizeBeatUpdateData(
  rawData: unknown
): Prisma.BeatUpdateManyMutationInput {
  const parsed = adminBeatUpdateSchema.safeParse(rawData)
  if (!parsed.success) {
    throw new Error('Invalid beat update payload')
  }

  const data: Prisma.BeatUpdateManyMutationInput = {}
  const payload: AdminBeatUpdateInput = parsed.data

  if (payload.title !== undefined) data.title = payload.title
  if (payload.artistName !== undefined) {
    data.artistName = toNullableString(payload.artistName)
  }
  if (payload.label !== undefined) data.label = toNullableString(payload.label)
  if (payload.genre !== undefined) data.genre = toNullableString(payload.genre)
  if (payload.bpm !== undefined) data.bpm = payload.bpm
  if (payload.isPremium !== undefined) data.isPremium = payload.isPremium

  return data
}

export async function getAdminBeats() {
  await verifySuperAdmin()
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

export async function updateBeat(id: string, data: unknown) {
  await verifySuperAdmin()
  const normalizedData = normalizeBeatUpdateData(data)

  const updateResult = await prisma.beat.updateMany({
    where: {
      id,
      uploaderId: null, // Public-beat boundary guard
    },
    data: normalizedData,
  })

  if (updateResult.count === 0) {
    throw new Error('Beat not found in public library')
  }

  const result = await prisma.beat.findUnique({ where: { id } })
  if (!result) {
    throw new Error('Beat update failed')
  }

  revalidatePath('/admin/beats')
  revalidatePath('/tracks') // Update public tracks page
  return result
}

export async function deleteBeat(id: string) {
  await verifySuperAdmin()
  const deleteResult = await prisma.beat.deleteMany({
    where: {
      id,
      uploaderId: null, // Public-beat boundary guard
    },
  })

  if (deleteResult.count === 0) {
    throw new Error('Beat not found in public library')
  }

  revalidatePath('/admin/beats')
  revalidatePath('/tracks')
}

export async function reorderBeat(id: string, direction: 'up' | 'down') {
  await verifySuperAdmin()
  // 1. Fetch ALL admin beats in current sorted order
  const allBeats = await prisma.beat.findMany({
    where: { uploaderId: null },
    orderBy: [
      { sortOrder: 'asc' },
      { createdAt: 'desc' },
    ] as Prisma.BeatOrderByWithRelationInput[],
  })

  const currentIndex = allBeats.findIndex((b) => b.id === id)
  if (currentIndex === -1) {
    throw new Error('Beat not found in public library')
  }

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
