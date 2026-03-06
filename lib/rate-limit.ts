/**
 * In-Memory Rate Limiter for Next.js API Routes (Vercel-Compatible)
 *
 * Uses a sliding-window counter keyed by IP address.
 * On Vercel, each serverless invocation shares memory within the same
 * function instance, which provides reasonable burst protection.
 */

const rateLimitMap = new Map<string, { count: number; lastReset: number }>()

// Clean up stale entries every 60s to avoid memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of rateLimitMap) {
      if (now - value.lastReset > 120_000) {
        rateLimitMap.delete(key)
      }
    }
  }, 60_000)
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Check rate limit for a given identifier (typically IP or userId).
 *
 * @param identifier - Unique key (IP address, userId, etc.)
 * @param limit      - Max requests allowed in the window
 * @param windowMs   - Time window in milliseconds (default: 60 000 = 1 min)
 */
export function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number = 60_000
): RateLimitResult {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  if (!entry || now - entry.lastReset > windowMs) {
    // First request or expired window; reset the counter state.
    rateLimitMap.set(identifier, { count: 1, lastReset: now })
    return { success: true, limit, remaining: limit - 1, reset: now + windowMs }
  }

  entry.count++

  if (entry.count > limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: entry.lastReset + windowMs,
    }
  }

  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    reset: entry.lastReset + windowMs,
  }
}

/**
 * Pre-configured rate limit tiers.
 */
export const RATE_LIMITS = {
  /** Auth endpoints: 10 req / 15 min */
  auth: (ip: string) => rateLimit(ip, 10, 15 * 60_000),
  /** Standard API: 60 req / min */
  standard: (ip: string) => rateLimit(ip, 60, 60_000),
  /** Heavy / mutation endpoints: 20 req / min */
  mutation: (ip: string) => rateLimit(ip, 20, 60_000),
  /** Upload / expensive operations: 5 req / min */
  upload: (ip: string) => rateLimit(ip, 5, 60_000),
} as const
