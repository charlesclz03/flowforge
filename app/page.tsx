'use client'

import { useEffect, useState } from 'react'
import { TimerRing } from '@/components/ui/TimerRing'

const HERO_STATS = [
  { label: 'Beats Curated', value: '15+', caption: 'Hand-mastered instrumentals' },
  { label: 'Word Vault', value: '∞', caption: 'Adaptive prompt engine' },
  { label: 'Practice Windows', value: '24/7', caption: 'Always-on companion' },
]

const SESSION_BADGES = [
  { label: 'Session Tempo', value: '90 BPM', accentClass: 'bg-accent-blue' },
  { label: 'Difficulty', value: 'Medium', accentClass: 'bg-accent-orange' },
  { label: 'Frequency', value: '8 Bars', accentClass: 'bg-accent-violet' },
]

export default function HomePage() {
  const [progress, setProgress] = useState(0.25)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 0.01
        return next >= 1 ? 0 : next
      })
    }, 120)

    return () => clearInterval(interval)
  }, [])

  return (
    <main
      id="main-content"
      role="main"
      className="relative min-h-screen overflow-hidden bg-background text-text-primary"
    >
      <div className="absolute inset-0 -z-10 bg-gradient-midnight" aria-hidden="true" />
      <div className="absolute inset-y-0 left-1/2 -z-10 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-gradient-pulse opacity-20 blur-[160px]" />

      <section className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-24 pt-24 md:px-12 lg:px-16">
        <header className="text-center md:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-stroke-subtle/40 bg-background-card/60 px-4 py-2 text-xs uppercase tracking-[0.35em] text-text-secondary backdrop-blur-medium">
            FlowForge Sessions
          </div>
          <h1 className="mt-6 max-w-3xl text-balance text-display font-light text-white">
            The freestyle command center for artists in motion.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Designed with the midnight precision of the iOS Clock and the luminous polish of Revolut—your beats, prompts,
            and recordings unified in a single glowing cockpit.
          </p>
        </header>

        <div className="relative overflow-hidden rounded-[2.5rem] border border-stroke-subtle/60 bg-background-glow/80 p-[1px] shadow-soft">
          <div className="pointer-events-none absolute inset-0 opacity-70 blur-3xl">
            <div className="absolute inset-0 bg-gradient-aurora" aria-hidden />
          </div>
          <div className="relative grid gap-12 rounded-[2.5rem] bg-background/85 p-8 backdrop-blur-heavy md:grid-cols-[2fr_1fr] md:p-12">
            <div className="space-y-8">
              <div className="flex flex-wrap items-center gap-3">
                {SESSION_BADGES.map((badge) => (
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
                  Intelligent prompts sync to your tempo, recording tools glow with status feedback, and every session wraps in a
                  clean timeline designed for late-night flow states.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button className="btn-primary w-full rounded-full bg-gradient-pulse text-base font-medium text-black shadow-neon transition hover:shadow-glow sm:w-auto">
                    Join the waitlist
                  </button>
                  <button className="btn-ghost w-full rounded-full border border-stroke-subtle/40 bg-background-card/70 text-base text-text-primary/90 hover:border-accent-blue/40 sm:w-auto">
                    Preview the experience
                  </button>
                </div>
              </div>

              <dl className="grid gap-4 sm:grid-cols-3">
                {HERO_STATS.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-stroke-subtle/40 bg-background-card/50 p-4 backdrop-blur-light">
                    <dt className="text-xs uppercase tracking-[0.3em] text-text-tertiary">{stat.label}</dt>
                    <dd className="mt-2 text-3xl font-light text-white">{stat.value}</dd>
                    <p className="mt-1 text-xs text-text-secondary">{stat.caption}</p>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative mx-auto flex max-w-xs flex-col items-center justify-center">
              <div className="absolute inset-0 animate-ambient-shift rounded-full bg-gradient-aurora opacity-70 blur-3xl" aria-hidden />
              <div className="relative flex h-[18rem] w-[18rem] items-center justify-center rounded-full border border-stroke-glow/40 bg-background-card/60 p-8 shadow-neon backdrop-blur-medium">
                <div className="absolute inset-6 animate-orbital-glow rounded-full border border-accent-blue/10" aria-hidden />
                <TimerRing progress={progress} size={220} strokeWidth={8} className="text-accent-orange drop-shadow-neon" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xs uppercase tracking-[0.35em] text-text-secondary">Recording</span>
                  <span className="mt-2 text-numeral text-white">01:24</span>
                  <span className="mt-1 text-sm text-text-tertiary">On-beat guidance active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="grid gap-6 rounded-[2rem] border border-stroke-subtle/40 bg-background-card/40 p-8 text-center text-sm text-text-secondary backdrop-blur-light sm:grid-cols-3 sm:text-left">
          <div className="space-y-2">
            <h3 className="text-base font-medium text-text-primary">Clockwork Precision</h3>
            <p>
              Built on the rhythms of the Clock app—precise timing controls, intuitive dialed interactions, and ambient focus for
              deep creative work.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-medium text-text-primary">Revolut Polish</h3>
            <p>
              Neon gradients, glass cards, and tactile shadows signal state changes instantly while keeping the interface
              weightless.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-medium text-text-primary">Creator Ready</h3>
            <p>
              Word prompts, beat library, and session management launch together so you can rehearse, record, and review without
              switching contexts.
            </p>
          </div>
        </footer>
      </section>
    </main>
  )
}
