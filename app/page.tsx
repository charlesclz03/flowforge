import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

type HomeSearchParams = {
  callbackUrl?: string | string[]
}

function normalizeCallbackPath(
  rawCallback: HomeSearchParams['callbackUrl']
): string | null {
  const value = Array.isArray(rawCallback) ? rawCallback[0] : rawCallback
  if (!value) return null

  let decoded = value
  try {
    decoded = decodeURIComponent(value)
  } catch {
    decoded = value
  }

  if (!decoded.startsWith('/') || decoded.startsWith('//')) return null

  return decoded
}

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<HomeSearchParams>
}) {
  const params = (await searchParams) ?? {}
  const callbackPath = normalizeCallbackPath(params.callbackUrl)
  const session = await getServerSession(authOptions)

  if (callbackPath) {
    if (session?.user) {
      redirect(callbackPath)
    }

    redirect(`/howitworks?callbackUrl=${encodeURIComponent(callbackPath)}`)
  }

  redirect('/howitworks')
}
