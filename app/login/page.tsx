import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { AuthEntryPanel } from '@/components/molecules/auth/AuthEntryPanel'
import { authOptions } from '@/lib/auth'
import {
  buildCompleteProfilePath,
  getDefaultAuthenticatedPath,
  isProfileSetupComplete,
  normalizeInternalPath,
} from '@/lib/auth/paths'

export const metadata: Metadata = {
  title: 'Sign In',
}

interface LoginPageProps {
  searchParams?: Promise<{ callbackUrl?: string | string[] }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const rawCallback = Array.isArray(params?.callbackUrl)
    ? params?.callbackUrl[0]
    : params?.callbackUrl
  const callbackPath = normalizeInternalPath(rawCallback) || '/practice'
  const session = await getServerSession(authOptions)

  if (session?.user) {
    if (!isProfileSetupComplete(session.user)) {
      redirect(buildCompleteProfilePath(callbackPath))
    }

    redirect(callbackPath || getDefaultAuthenticatedPath(session.user))
  }

  return <AuthEntryPanel mode="login" callbackPath={callbackPath} />
}
