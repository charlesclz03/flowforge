'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import confetti from 'canvas-confetti'
import { Check, Music, Zap, Mic, Upload, BarChart2 } from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { AppHeader } from '@/components/organisms/layout/AppHeader'

type ActivationState = 'checking' | 'confirmed' | 'timeout' | 'unauthorized'

export default function OrderConfirmedPage() {
  const [activationState, setActivationState] =
    useState<ActivationState>('checking')
  const [retryKey, setRetryKey] = useState(0)
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(
    null
  )
  const startedAtRef = useRef<number>(Date.now())

  useEffect(() => {
    setActivationState('checking')
    startedAtRef.current = Date.now()

    let cancelled = false
    let timeoutId: NodeJS.Timeout | null = null

    async function poll() {
      if (cancelled) return

      try {
        const res = await fetch('/api/subscription/status', {
          method: 'GET',
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
        })

        if (res.status === 401) {
          setActivationState('unauthorized')
          return
        }

        if (!res.ok) {
          // If the backend is temporarily unavailable, keep polling until timeout.
          throw new Error(`Status ${res.status}`)
        }

        const data = (await res.json()) as {
          subscriptionStatus: string | null
          isPro: boolean
        }

        setSubscriptionStatus(data.subscriptionStatus ?? null)

        if (data.isPro) {
          setActivationState('confirmed')
          return
        }
      } catch (_e) {
        // fallthrough to timeout logic
      }

      const elapsedMs = Date.now() - startedAtRef.current
      if (elapsedMs >= 60_000) {
        setActivationState('timeout')
        return
      }

      timeoutId = setTimeout(poll, 1500)
    }

    poll()

    return () => {
      cancelled = true
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [retryKey])

  useEffect(() => {
    if (activationState !== 'confirmed') return

    // Fire confetti on mount
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min
    }

    const interval: NodeJS.Timeout = setInterval(function () {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      // since particles fall down, start a bit higher than random
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    }, 250)

    return () => clearInterval(interval)
  }, [activationState])

  return (
    <div className="min-h-screen bg-black text-white selection:bg-accent-purple/30">
      <AppHeader showBackButton={false} showSettings={true} />

      <main className="container max-w-2xl mx-auto px-4 py-8 md:py-16 text-center">
        {activationState === 'confirmed' ? (
          <>
            {/* Success Animation Container */}
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 shadow-[0_0_40px_-5px_rgba(74,222,128,0.3)]">
              <Check className="h-10 w-10 text-green-400" strokeWidth={3} />
            </div>

            <h1 className="mb-2 text-4xl font-black uppercase tracking-tight text-white sm:text-5xl">
              You Are Now a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-purple to-accent-pink">
                Pro
              </span>
            </h1>

            <p className="mb-10 text-lg text-text-secondary">
              Your membership is active. Welcome to Pro.
            </p>

            {/* Feature Unlocked Card */}
            <div className="mb-12 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:p-8">
              <h2 className="mb-6 text-xl font-bold uppercase tracking-widest text-text-secondary">
                Unlocked Features
              </h2>

              <div className="space-y-4 text-left">
                <FeatureItem icon={Zap} text="Unlimited practice sessions" />
                <FeatureItem icon={Music} text="Access to all premium beats" />
                <FeatureItem icon={Mic} text="Save & download recordings" />
                <FeatureItem icon={Upload} text="Upload your own beats" />
                <FeatureItem
                  icon={BarChart2}
                  text="Stats & history visualization"
                />
              </div>
            </div>

            {/* Primary Action */}
            <div className="flex flex-col items-center justify-center gap-4">
              <Link href="/difficultyselection" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="xl"
                  className="w-full sm:min-w-[280px] bg-gradient-to-r from-accent-purple to-accent-pink text-black font-bold shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)] hover:scale-105 hover:shadow-[0_0_50px_-10px_rgba(168,85,247,0.6)] animate-pulse-slow"
                >
                  Start Pro Practice
                </Button>
              </Link>

              <Link
                href="/profile"
                className="text-sm font-medium text-text-tertiary hover:text-white transition-colors"
              >
                View my receipt
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/5 border border-white/10">
              <div className="h-10 w-10 rounded-full border-2 border-accent-purple/40 border-t-accent-purple animate-spin" />
            </div>

            <h1 className="mb-2 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
              Activating Pro...
            </h1>

            <p className="mb-8 text-base text-text-secondary">
              {activationState === 'unauthorized'
                ? 'Please sign in to finish activation.'
                : activationState === 'timeout'
                  ? 'Still processing. This can take up to a minute.'
                  : "Hang tight - your payment is processing and we're upgrading your account."}
            </p>

            <div className="mb-10 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:p-8 text-left">
              <div className="text-sm text-text-tertiary mb-2">
                Current status:{' '}
                <span className="text-text-secondary font-mono">
                  {subscriptionStatus ?? 'unknown'}
                </span>
              </div>
              <div className="text-sm text-text-secondary leading-relaxed">
                {activationState === 'timeout' ? (
                  <>
                    If you already paid, your Pro access should activate
                    shortly. You can also open your Profile and refresh.
                  </>
                ) : activationState === 'unauthorized' ? (
                  <>Sign in again to sync your account status after checkout.</>
                ) : (
                  <>
                    We'll automatically unlock Pro as soon as the payment
                    webhook confirms your subscription.
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-3">
              {activationState !== 'unauthorized' ? (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto sm:min-w-[240px] bg-gradient-to-r from-accent-purple to-accent-pink text-black font-bold"
                  onClick={() => setRetryKey((k) => k + 1)}
                >
                  Retry activation
                </Button>
              ) : (
                <Link href="/" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:min-w-[240px] bg-gradient-to-r from-accent-purple to-accent-pink text-black font-bold"
                  >
                    Sign in
                  </Button>
                </Link>
              )}

              <Link
                href="/profile"
                className="text-sm font-medium text-text-tertiary hover:text-white transition-colors"
              >
                Go to Profile
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function FeatureItem({
  icon: Icon,
  text,
}: {
  icon: React.ElementType
  text: string
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-white/5 p-3 transition-colors hover:bg-white/10">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent-purple/20">
        <Icon className="h-5 w-5 text-accent-purple" />
      </div>
      <span className="font-medium text-text-primary">{text}</span>
    </div>
  )
}
