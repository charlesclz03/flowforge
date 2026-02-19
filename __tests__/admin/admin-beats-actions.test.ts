import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/auth/admin', () => ({
  verifySuperAdmin: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    beat: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
      findUnique: vi.fn(),
      deleteMany: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

import { revalidatePath } from 'next/cache'
import { verifySuperAdmin } from '@/lib/auth/admin'
import { prisma } from '@/lib/prisma'
import {
  deleteBeat,
  getAdminBeats,
  reorderBeat,
  updateBeat,
} from '@/app/actions/admin/beats'

type MockFn = ReturnType<typeof vi.fn>

const beatMocks = prisma.beat as unknown as {
  findMany: MockFn
  updateMany: MockFn
  findUnique: MockFn
  deleteMany: MockFn
  update: MockFn
}

const transactionMock = prisma.$transaction as unknown as MockFn
const verifySuperAdminMock = verifySuperAdmin as unknown as MockFn
const revalidatePathMock = revalidatePath as unknown as MockFn

describe('admin beats actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    verifySuperAdminMock.mockResolvedValue({
      user: { role: 'SUPERADMIN' },
    })
  })

  it('loads only public beats for admin listing', async () => {
    beatMocks.findMany.mockResolvedValue([])

    await getAdminBeats()

    expect(verifySuperAdminMock).toHaveBeenCalledOnce()
    expect(beatMocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { uploaderId: null },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      })
    )
  })

  it('rejects invalid update payloads with unknown fields', async () => {
    await expect(
      updateBeat('beat-1', {
        title: 'Valid',
        sortOrder: 99,
      })
    ).rejects.toThrow('Invalid beat update payload')
  })

  it('rejects updates for beats outside public library scope', async () => {
    beatMocks.updateMany.mockResolvedValue({ count: 0 })

    await expect(
      updateBeat('private-beat-id', { title: 'Updated Title' })
    ).rejects.toThrow('Beat not found in public library')
  })

  it('updates and normalizes allowed admin beat fields', async () => {
    beatMocks.updateMany.mockResolvedValue({ count: 1 })
    beatMocks.findUnique.mockResolvedValue({
      id: 'beat-1',
      title: 'Updated Title',
    })

    const updated = await updateBeat('beat-1', {
      title: '  Updated Title  ',
      artistName: '',
      label: '',
      genre: '',
      bpm: 90,
      isPremium: true,
    })

    expect(updated).toMatchObject({ id: 'beat-1' })
    expect(beatMocks.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'beat-1', uploaderId: null },
        data: {
          title: 'Updated Title',
          artistName: null,
          label: null,
          genre: null,
          bpm: 90,
          isPremium: true,
        },
      })
    )
    expect(revalidatePathMock).toHaveBeenCalledWith('/admin/beats')
    expect(revalidatePathMock).toHaveBeenCalledWith('/tracks')
  })

  it('rejects deletion for beats outside public library scope', async () => {
    beatMocks.deleteMany.mockResolvedValue({ count: 0 })

    await expect(deleteBeat('private-beat-id')).rejects.toThrow(
      'Beat not found in public library'
    )
  })

  it('deletes public beat and revalidates affected routes', async () => {
    beatMocks.deleteMany.mockResolvedValue({ count: 1 })

    await deleteBeat('public-beat-id')

    expect(beatMocks.deleteMany).toHaveBeenCalledWith({
      where: { id: 'public-beat-id', uploaderId: null },
    })
    expect(revalidatePathMock).toHaveBeenCalledWith('/admin/beats')
    expect(revalidatePathMock).toHaveBeenCalledWith('/tracks')
  })

  it('rejects reorder if beat id is not in public list', async () => {
    beatMocks.findMany.mockResolvedValue([
      {
        id: 'beat-1',
        createdAt: new Date('2026-02-01T00:00:00.000Z'),
      },
    ])

    await expect(reorderBeat('beat-missing', 'up')).rejects.toThrow(
      'Beat not found in public library'
    )
  })

  it('reorders beats with normalized sort order', async () => {
    beatMocks.findMany.mockResolvedValue([
      { id: 'beat-1', createdAt: new Date('2026-02-01T00:00:00.000Z') },
      { id: 'beat-2', createdAt: new Date('2026-02-02T00:00:00.000Z') },
    ])
    beatMocks.update.mockImplementation((args) => args)
    transactionMock.mockResolvedValue([])

    await reorderBeat('beat-2', 'up')

    expect(beatMocks.update).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: { id: 'beat-2' },
        data: { sortOrder: 0 },
      })
    )
    expect(beatMocks.update).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: { id: 'beat-1' },
        data: { sortOrder: 1 },
      })
    )
    expect(transactionMock).toHaveBeenCalledOnce()
  })
})
