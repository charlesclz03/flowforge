'use client'

import Link from 'next/link'
import { SignInButton } from '@/components/molecules/auth/SignInButton'
import { TimerRing } from '@/components/atoms/TimerRing'
import { StatCard } from '@/components/molecules/display/StatCard'

type HeroStat = {
  label: string
  value: string
  caption: string
}

type SessionBadge = {
  label: string
  value: string
  accentClass: string
}

interface LandingHeroProps {
  stats: HeroStat[]
  badges: SessionBadge[]
  progress: number
  isAuthenticated: boolean
}

export function LandingHero({ stats, badges, progress, isAuthenticated }: LandingHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-stroke-subtle/60 bg-background-glow/80 p-[1px] shadow-soft">
      <div className="pointer-events-none absolute inset-0 opacity-70 blur-3xl">
        <div className="absolute inset-0 bg-gradient-aurora" aria-hidden />
      </div>

      <div className="relative grid gap-12 rounded-[2.5rem] bg-background/85 p-8 backdrop-blur-heavy md:grid-cols-[2fr_1fr] md:p-12">
        <div className="space-y-8">
          <div className="flex flex-wrap items-center gap-3">
            {badges.map((badge) => (
              <span
                key={badge.label}
                className="inline-flex items-center gap-2 rounded-full border border-stroke-glow/30 bg-background-card/70 px-4 py-2 text-sm text-text-secondary backdrop-blur-light"
              >
                <span className={`h-2 w-2 rounded-full ${badge.accentClass}`} aria-hidden />
                <span className="text-text-tertiary uppercase tracking-[0.2em]">{badge.label}</span>
                <span className="font-medium text-text-primary">{badge.value}</span>
              </span>
            ))}
          </div>

          <div className="space-y-6">
            <h2 className="text-balance text-3xl font-light text-white sm:text-4xl">
              Cue your beat, spark your next bar, capture the take.
            </h2>
            <p className="max-w-xl text-base text-text-secondary">
              Intelligent prompts sync to your tempo, recording tools glow with status feedback, and
              every session wraps in a clean timeline designed for late-night flow states.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {isAuthenticated ? (
                <Link
                  href="/howitworks"
                  className="btn-primary w-full rounded-full bg-gradient-pulse px-8 py-3 text-center text-base font-medium text-black shadow-neon transition hover:shadow-glow sm:w-auto"
                >
                  Practice Here
                </Link>
              ) : (
                <SignInButton
                  callbackUrl="/howitworks"
                  className="w-full rounded-full px-8 py-3 text-center text-base font-medium sm:w-auto"
                >
                  Practice Here
                </SignInButton>
              )}
            </div>
          </div>

          <dl className="grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                caption={stat.caption}
              />
            ))}
          </dl>
        </div>

        <div className="relative mx-auto flex max-w-xs flex-col items-center justify-center">
          <div
            className="absolute inset-0 animate-ambient-shift rounded-full bg-gradient-aurora opacity-70 blur-3xl"
            aria-hidden
          />
          <div className="relative flex h-[18rem] w-[18rem] items-center justify-center rounded-full border border-stroke-glow/40 bg-background-card/60 p-8 shadow-neon backdrop-blur-medium">
            <div
              className="absolute inset-6 animate-orbital-glow rounded-full border border-accent-blue/10"
              aria-hidden
            />
            <TimerRing
              progress={progress}
              size={220}
              strokeWidth={8}
              className="text-accent-purple drop-shadow-neon"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xs uppercase tracking-[0.35em] text-text-secondary">
                Recording
              </span>
              <span className="mt-2 text-numeral text-white">01:24</span>
              <span className="mt-1 text-sm text-text-tertiary">On-beat guidance active</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
