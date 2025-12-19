'use client'

import { useEffect, Suspense, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { SignInButton } from '@/components/molecules/auth/SignInButton'
import { LandingHowItWorks } from '@/components/organisms/landing/LandingHowItWorks'
import Image from 'next/image'

function HomePageContent() {
  const { status, data: session } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isTimedOut, setIsTimedOut] = useState(false)
  const isAuthenticated = status === 'authenticated'

  // Redirect to callbackUrl after sign-in
  useEffect(() => {
    if (isAuthenticated && session) {
      const callbackUrl = searchParams?.get('callbackUrl')
      if (callbackUrl) {
        const decodedUrl = decodeURIComponent(callbackUrl)
        console.log('Redirecting to callback URL:', decodedUrl)
        router.push(decodedUrl)
      } else {
        // If logged in and no callback, go to practice (App Home)
        router.push('/practice')
      }
    }
  }, [isAuthenticated, session, searchParams, router])

  // Fallback for stuck session
  useEffect(() => {
    const timer = setTimeout(() => {
      if (status === 'loading') setIsTimedOut(true)
    }, 6000)
    return () => clearTimeout(timer)
  }, [status])

  // If loading or authenticated (and redirecting), show minimal loader
  if ((status === 'loading' || isAuthenticated) && !isTimedOut) {
    return (
      <main className="flex h-[100dvh] items-center justify-center bg-black">
        <div className="animate-pulse">
          <Image
            src="/logo.png"
            alt="Loading..."
            width={48}
            height={48}
            priority
            className="h-12 w-12 object-contain drop-shadow-neon"
          />
        </div>
      </main>
    )
  }

  return (
    <main className="relative flex h-[100dvh] w-full flex-col items-center justify-between overflow-hidden bg-black p-6 safe-top safe-bottom">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/20 via-black to-accent-blue/10 opacity-60" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-accent-purple/30 rounded-full blur-[120px] animate-pulse-slow" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full max-w-md gap-8 text-center">
        {/* Brand */}
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
              <Image
                src="/logo.png"
                alt="Freestyla Logo"
                width={48}
                height={48}
                priority
                className="h-12 w-12 object-contain drop-shadow-neon"
              />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Freestyla</h1>
            <p className="text-lg font-medium text-text-secondary">Master your freestyle.</p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="w-full">
          <LandingHowItWorks />
        </div>
      </div>

      {/* Actions (Bottom) */}
      <div className="relative z-10 w-full max-w-md space-y-4 mb-8">
        <Link
          href="/practice" // Guest Mode Access
          className="flex items-center justify-center w-full py-4 text-lg font-semibold text-black bg-white rounded-full hover:bg-white/90 transition-transform active:scale-95 shadow-glow"
        >
          Start Practicing
        </Link>

        <div className="flex items-center justify-center gap-4 text-sm text-text-secondary">
          <span>Already have an account?</span>
          <SignInButton mode="link" />
        </div>
      </div>
    </main>
  )
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center">
            <p className="text-text-secondary">Loading...</p>
          </div>
        </main>
      }
    >
      <HomePageContent />
    </Suspense>
  )
}
