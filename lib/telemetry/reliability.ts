import * as Sentry from '@sentry/nextjs'

type ReliabilityLevel = 'info' | 'warning' | 'error'
type ReliabilityPrimitive = string | number | boolean | null | undefined
type ReliabilityContextValue = ReliabilityPrimitive | ReliabilityPrimitive[]

export type ReliabilityContext = Record<string, ReliabilityContextValue>

function sanitizeValue(
  value: ReliabilityContextValue
): ReliabilityPrimitive | ReliabilityPrimitive[] {
  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeValue(entry) as ReliabilityPrimitive)
  }

  if (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value
  }

  return String(value)
}

function sanitizeContext(context: ReliabilityContext): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => [key, sanitizeValue(value)])
  )
}

export function trackReliabilityEvent(
  eventName: string,
  context: ReliabilityContext = {},
  level: ReliabilityLevel = 'info'
) {
  const safeContext = sanitizeContext(context)

  if (process.env.NODE_ENV !== 'production') {
    console.info(`[reliability:${eventName}]`, safeContext)
  }

  Sentry.captureMessage(`reliability:${eventName}`, {
    level,
    tags: {
      category: 'reliability',
      event: eventName,
    },
    extra: safeContext,
  })
}

export function trackReliabilityException(
  error: unknown,
  eventName: string,
  context: ReliabilityContext = {}
) {
  Sentry.captureException(error, {
    tags: {
      category: 'reliability',
      event: eventName,
    },
    extra: sanitizeContext(context),
  })
}
