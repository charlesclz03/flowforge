import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getBeats, getFreeBeats, searchBeats } from '@/lib/db/beats'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    beat: {
      findMany: vi.fn(),
    },
  },
}))

describe('public beat inventory boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prisma.beat.findMany).mockResolvedValue([])
  })

  it('defines the public beat library as beats without an uploader', async () => {
    await getBeats()

    expect(prisma.beat.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          uploaderId: null,
        },
      })
    )
  })

  it('keeps free public beats inside the uploaderId null boundary', async () => {
    await getFreeBeats()

    expect(prisma.beat.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          uploaderId: null,
          isPremium: false,
        },
      })
    )
  })

  it('keeps public beat search scoped away from private uploads', async () => {
    await searchBeats('battle')

    expect(prisma.beat.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          uploaderId: null,
        }),
      })
    )
  })
})
