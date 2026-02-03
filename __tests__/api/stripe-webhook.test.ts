import { describe, it, expect, vi, beforeAll, beforeEach, afterAll } from 'vitest'

vi.mock('next/headers', () => ({
  headers: vi.fn(() => ({
    get: vi.fn(),
  })),
}))

vi.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: vi.fn(),
    },
    checkout: {
      sessions: {
        retrieve: vi.fn(),
      },
    },
  },
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      updateMany: vi.fn(),
    },
  },
}))

import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { POST } from '@/app/api/stripe/webhook/route'

beforeAll(() => {
  vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test')
})

afterAll(() => {
  vi.unstubAllEnvs()
})

beforeEach(() => {
  vi.clearAllMocks()
  setSignatureHeader('sig_test')
  vi.mocked((prisma as any).user.updateMany).mockResolvedValue({ count: 1 })
})

function setSignatureHeader(value: string | null) {
  vi.mocked(headers).mockReturnValue({
    get: vi.fn((key: string) => (key === 'stripe-signature' ? value : null)),
  } as never)
}

function setConstructedEvent(event: unknown) {
  vi.mocked((stripe as any).webhooks.constructEvent).mockReturnValue(event)
}

function setConstructEventThrows() {
  vi.mocked((stripe as any).webhooks.constructEvent).mockImplementation(() => {
    throw new Error('bad signature')
  })
}

function setUpdateManyCount(count: number) {
  vi.mocked((prisma as any).user.updateMany).mockResolvedValue({ count })
}

describe('POST /api/stripe/webhook', () => {
  it('returns 400 when signature verification fails', async () => {
    setConstructEventThrows()

    const req = new Request('http://localhost/api/stripe/webhook', {
      method: 'POST',
      body: 'raw-body',
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    expect(vi.mocked((prisma as any).user.updateMany)).not.toHaveBeenCalled()
  })

  it('returns 400 when stripe-signature header is missing', async () => {
    setSignatureHeader(null)

    const req = new Request('http://localhost/api/stripe/webhook', {
      method: 'POST',
      body: 'raw-body',
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    expect(vi.mocked((prisma as any).user.updateMany)).not.toHaveBeenCalled()
  })

  it('acknowledges checkout.session.completed without metadata.userId (no DB write)', async () => {
    setConstructedEvent({
      id: 'evt_123',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_123',
          metadata: {},
          customer: 'cus_123',
          subscription: 'sub_123',
        },
      },
    })

    const req = new Request('http://localhost/api/stripe/webhook', {
      method: 'POST',
      body: 'raw-body',
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(vi.mocked((prisma as any).user.updateMany)).not.toHaveBeenCalled()
  })

  it('updates user on checkout.session.completed with metadata.userId', async () => {
    setConstructedEvent({
      id: 'evt_123',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_123',
          metadata: { userId: 'user-123' },
          customer: 'cus_123',
          subscription: 'sub_123',
        },
      },
    })

    const req = new Request('http://localhost/api/stripe/webhook', {
      method: 'POST',
      body: 'raw-body',
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(vi.mocked((prisma as any).user.updateMany)).toHaveBeenCalledWith({
      where: { id: 'user-123' },
      data: {
        subscriptionStatus: 'active',
        subscriptionId: 'sub_123',
        customerId: 'cus_123',
      },
    })
  })

  it('updates subscription status on customer.subscription.updated', async () => {
    setConstructedEvent({
      id: 'evt_456',
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_123',
          customer: 'cus_123',
          status: 'trialing',
        },
      },
    })

    const req = new Request('http://localhost/api/stripe/webhook', {
      method: 'POST',
      body: 'raw-body',
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(vi.mocked((prisma as any).user.updateMany)).toHaveBeenCalledWith({
      where: { OR: [{ customerId: 'cus_123' }, { subscriptionId: 'sub_123' }] },
      data: { subscriptionStatus: 'trialing' },
    })
  })

  it('returns 200 even when no user matches (updateMany count = 0)', async () => {
    setUpdateManyCount(0)
    setConstructedEvent({
      id: 'evt_789',
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_999',
          customer: 'cus_999',
          status: 'active',
        },
      },
    })

    const req = new Request('http://localhost/api/stripe/webhook', {
      method: 'POST',
      body: 'raw-body',
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
  })
})
