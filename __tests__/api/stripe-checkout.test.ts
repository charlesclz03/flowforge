import { describe, it, expect, vi, beforeAll, beforeEach, afterAll } from 'vitest'

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
  },
  PLANS: {
    monthly: {
      priceId: 'price_monthly',
      price: 4.99,
      currency: 'EUR',
      interval: 'month' as const,
    },
    yearly: {
      priceId: 'price_yearly',
      price: 49.0,
      currency: 'EUR',
      interval: 'year' as const,
    },
  },
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}))

import { getServerSession } from 'next-auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { POST } from '@/app/api/stripe/checkout/route'

const baseUrl = 'https://example.com'

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', baseUrl)
})

afterAll(() => {
  vi.unstubAllEnvs()
})

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked((stripe as any).checkout.sessions.create).mockResolvedValue({
    url: 'https://stripe.test/checkout',
  })
})

describe('POST /api/stripe/checkout', () => {
  it('rejects unauthenticated users', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    const req = new Request('http://localhost/api/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify({ plan: 'monthly' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('rejects invalid plan', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'user@example.com' },
    } as never)

    const req = new Request('http://localhost/api/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify({ plan: 'nope' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('uses existing customerId when present', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'user@example.com' },
    } as never)

    vi.mocked((prisma as any).user.findUnique).mockResolvedValue({
      customerId: 'cus_123',
    })

    const req = new Request('http://localhost/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: 'monthly' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)

    const args = vi.mocked((stripe as any).checkout.sessions.create).mock
      .calls[0][0]
    expect(args.customer).toBe('cus_123')
    expect(args.customer_email).toBeUndefined()
    expect(args.success_url).toBe(
      `${baseUrl}/orderconfirmed?session_id={CHECKOUT_SESSION_ID}`
    )
    expect(args.cancel_url).toBe(`${baseUrl}/profile`)
  })

  it('falls back to customer_email when customerId is missing', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'user@example.com' },
    } as never)

    vi.mocked((prisma as any).user.findUnique).mockResolvedValue({
      customerId: null,
    })

    const req = new Request('http://localhost/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: 'monthly' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)

    const args = vi.mocked((stripe as any).checkout.sessions.create).mock
      .calls[0][0]
    expect(args.customer_email).toBe('user@example.com')
    expect(args.customer).toBeUndefined()
  })
})

