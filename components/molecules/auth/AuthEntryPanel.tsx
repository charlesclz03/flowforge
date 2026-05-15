'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { OnboardingLayout } from '@/components/organisms/layout/OnboardingLayout'
import { SignInButton } from '@/components/molecules/auth/SignInButton'

interface AuthEntryPanelProps {
  mode: 'login' | 'signup'
  callbackPath: string
}

export function AuthEntryPanel({ mode, callbackPath }: AuthEntryPanelProps) {
  const isSignup = mode === 'signup'

  return (
    <OnboardingLayout
      customTitle={isSignup ? 'SIGN UP' : 'SIGN IN'}
      customSubtitle="Continue your freestyle practice"
      showBackButton
      showSettings={false}
      showProgress={false}
    >
      <div className="mx-auto flex min-h-[calc(100dvh-12rem)] max-w-md flex-col justify-center py-10">
        <div className="rounded-2xl border border-white/10 bg-background-card/70 p-6 shadow-soft backdrop-blur-xl sm:p-8">
          <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-accent-purple/30 bg-accent-purple/10 text-accent-purple">
            <Sparkles size={22} aria-hidden="true" />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-white">
            {isSignup ? 'Create your FreeStyla account' : 'Welcome back'}
          </h1>
          <p className="mt-3 text-sm leading-6 text-text-secondary">
            Sign in with Google to save sessions, unlock your profile, and keep
            the requested page ready after authentication.
          </p>

          <SignInButton
            callbackUrl={callbackPath}
            className="mt-8 w-full rounded-xl py-4 text-base focus-visible:ring-2 focus-visible:ring-accent-purple focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Continue with Google
          </SignInButton>

          <Link
            href="/difficultyselection"
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Continue as guest
            <ArrowRight size={16} aria-hidden="true" />
          </Link>

          <p className="mt-5 text-center text-xs text-text-tertiary">
            Guests can practice right away. Sign in when you want saved
            progress, recordings, and Pro checkout.
          </p>
        </div>
      </div>
    </OnboardingLayout>
  )
}
