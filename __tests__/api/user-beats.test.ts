/**
 * Integration tests for User Beats API
 * Covers: POST, GET, DELETE operations with auth and ownership checks
 */

import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest'

// Mock environment variables for Supabase
beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-key')
})

afterAll(() => {
  vi.unstubAllEnvs()
})

// Mock NextAuth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    beat: {
      count: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { POST, GET } from '@/app/api/user/beats/route'
import { DELETE } from '@/app/api/user/beats/[id]/route'

const mockSession = {
  user: {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'USER',
  },
}

const mockProUser = {
  id: 'user-123',
  subscriptionStatus: 'active',
  role: 'USER',
}

const mockFreeUser = {
  id: 'user-123',
  subscriptionStatus: null,
  role: 'USER',
}

describe('POST /api/user/beats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects unauthenticated requests', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    const req = new NextRequest('http://localhost/api/user/beats', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test',
        bpm: 90,
        storageUrl: 'http://example.com/beat.mp3',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('rejects free users (Pro gate)', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockFreeUser as never)

    const req = new NextRequest('http://localhost/api/user/beats', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test',
        bpm: 90,
        storageUrl: 'http://example.com/beat.mp3',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(403)
  })

  it('creates beat for Pro users', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockProUser as never)
    vi.mocked(prisma.beat.count).mockResolvedValue(0)
    vi.mocked(prisma.beat.create).mockResolvedValue({
      id: 'beat-123',
      title: 'Test Beat',
      bpm: 90,
      storageUrl: 'http://example.com/beat.mp3',
    } as never)

    const req = new NextRequest('http://localhost/api/user/beats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Beat',
        bpm: '90',
        storageUrl: 'http://example.com/beat.mp3',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.beat.id).toBe('beat-123')
  })

  it('accepts cue offsets beyond 30 seconds for long tracks', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockProUser as never)
    vi.mocked(prisma.beat.count).mockResolvedValue(0)
    vi.mocked(prisma.beat.create).mockResolvedValue({
      id: 'beat-456',
      title: 'Long Intro Beat',
      bpm: 90,
      offset: 120,
      storageUrl: 'http://example.com/beat.mp3',
    } as never)

    const req = new NextRequest('http://localhost/api/user/beats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Long Intro Beat',
        bpm: 90,
        offset: 120,
        storageUrl: 'http://example.com/beat.mp3',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(prisma.beat.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          offset: 120,
        }),
      })
    )
  })

  it('enforces 50 beat quota', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockProUser as never)
    vi.mocked(prisma.beat.count).mockResolvedValue(50)

    const req = new NextRequest('http://localhost/api/user/beats', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test',
        bpm: 90,
        storageUrl: 'http://example.com/beat.mp3',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(403)

    const data = await res.json()
    expect(data.error).toContain('limit')
  })
})

describe('GET /api/user/beats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns user beats for authenticated users', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession)
    vi.mocked(prisma.beat.findMany).mockResolvedValue([
      { id: 'beat-1', title: 'My Beat', bpm: 95 },
    ] as never)

    const req = new NextRequest('http://localhost/api/user/beats')
    const res = await GET(req)

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.beats).toHaveLength(1)
    expect(data.beats[0].title).toBe('My Beat')
  })
})

describe('DELETE /api/user/beats/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('prevents deletion by non-owners', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession)
    vi.mocked(prisma.beat.findUnique).mockResolvedValue({
      id: 'beat-999',
      uploaderId: 'other-user-456', // Different user
      storageUrl: 'http://example.com/beat.mp3',
    } as never)

    const req = new NextRequest('http://localhost/api/user/beats/beat-999', {
      method: 'DELETE',
    })

    const res = await DELETE(req, { params: Promise.resolve({ id: 'beat-999' }) })
    expect(res.status).toBe(403)
  })

  it('allows owners to delete their beats', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession)
    vi.mocked(prisma.beat.findUnique).mockResolvedValue({
      id: 'beat-123',
      uploaderId: 'user-123', // Same user
      storageUrl: 'http://localhost/beat.mp3', // Non-Supabase URL to skip storage delete
    } as never)
    vi.mocked(prisma.beat.delete).mockResolvedValue({} as never)

    const req = new NextRequest('http://localhost/api/user/beats/beat-123', {
      method: 'DELETE',
    })

    const res = await DELETE(req, { params: Promise.resolve({ id: 'beat-123' }) })
    expect(res.status).toBe(200)
  })
})
