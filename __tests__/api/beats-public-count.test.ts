import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/beats/route'
import { getBeats, getFreeBeats } from '@/lib/db/beats'

vi.mock('@/lib/db/beats', () => ({
  getBeats: vi.fn(),
  getFreeBeats: vi.fn(),
}))

const publicBeats = [
  {
    id: 'public-1',
    title: '2 Naughty',
    bpm: 90,
    storageUrl: '/beats/2-Naughty.mp3',
    isPremium: false,
    artistName: 'FreeStyla',
    genre: 'Boom Bap',
    duration: 180,
  },
  {
    id: 'public-2',
    title: 'Public Premium',
    bpm: 120,
    storageUrl: '/beats/Public-Premium.mp3',
    isPremium: true,
    artistName: 'FreeStyla',
    genre: 'Trap',
    duration: 180,
  },
]

describe('GET /api/beats public count', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getBeats).mockResolvedValue({
      success: true,
      data: publicBeats,
    } as never)
    vi.mocked(getFreeBeats).mockResolvedValue({
      success: true,
      data: publicBeats.filter((beat) => !beat.isPremium),
    } as never)
  })

  it('reports count from the public getBeats result', async () => {
    const res = await GET(new NextRequest('http://localhost/api/beats'))
    const data = await res.json()

    expect(getBeats).toHaveBeenCalled()
    expect(data.beats).toHaveLength(2)
    expect(data.count).toBe(data.beats.length)
  })

  it('reports count from the free public getFreeBeats result', async () => {
    const res = await GET(new NextRequest('http://localhost/api/beats?free=true'))
    const data = await res.json()

    expect(getFreeBeats).toHaveBeenCalled()
    expect(data.beats).toHaveLength(1)
    expect(data.count).toBe(data.beats.length)
  })
})
