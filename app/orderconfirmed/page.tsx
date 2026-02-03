'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import confetti from 'canvas-confetti'
import { Check, Music, Zap, Mic, Upload, BarChart2 } from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { AppHeader } from '@/components/organisms/layout/AppHeader'

export default function OrderConfirmedPage() {
  useEffect(() => {
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
  }, [])

  return (
    <div className="min-h-screen bg-black text-white selection:bg-accent-purple/30">
      <AppHeader showBackButton={false} showSettings={true} />

      <main className="container max-w-2xl mx-auto px-4 py-8 md:py-16 text-center">
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
          Thank you for your purchase! Your account has been upgraded instantly.
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
