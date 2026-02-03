function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, '')
}

/**
 * Computes the canonical base URL for generating absolute links in server routes.
 *
 * Fallback order:
 * 1) NEXT_PUBLIC_SITE_URL
 * 2) NEXT_PUBLIC_APP_URL
 * 3) NEXTAUTH_URL
 * 4) http://localhost:3000
 */
export function getBaseUrl(): string {
  const candidate =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    'http://localhost:3000'

  return normalizeBaseUrl(candidate)
}

