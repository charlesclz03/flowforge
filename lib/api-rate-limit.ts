import { NextRequest, NextResponse } from 'next/server'
import { RATE_LIMITS } from '@/lib/rate-limit'

/**
 * Helper to apply rate limiting in a Next.js route handler.
 * Returns a NextResponse (429) if rate limit exceeded, or null if allowed.
 *
 * Usage:
 *   const blocked = applyRateLimit(request, 'standard')
 *   if (blocked) return blocked
 */
export function applyRateLimit(
  request: NextRequest,
  tier: keyof typeof RATE_LIMITS = 'standard'
): NextResponse | null {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'

  const result = RATE_LIMITS[tier](ip)

  if (!result.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(result.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(result.reset),
          'Retry-After': String(Math.ceil((result.reset - Date.now()) / 1000)),
        },
      }
    )
  }

  return null
}
