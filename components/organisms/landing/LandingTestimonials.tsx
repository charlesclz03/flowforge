import { Activity, AudioLines, Trophy } from 'lucide-react'

const PROOF_POINTS = [
  {
    title: 'Built for repetition',
    description:
      'Short setup, fast restarts, and a mobile-first booth keep practice friction low.',
    icon: Activity,
  },
  {
    title: 'Stay on the beat',
    description:
      'Timed prompts and beat-aware pacing keep every round anchored to rhythm instead of guesswork.',
    icon: AudioLines,
  },
  {
    title: 'See progress stack up',
    description:
      'XP, streaks, and saved takes turn casual practice into a measurable routine.',
    icon: Trophy,
  },
]

export function LandingTestimonials() {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-stroke-subtle/40 bg-background-card/30 px-6 py-12 backdrop-blur-light md:px-10">
      <div className="pointer-events-none absolute inset-0 opacity-60 blur-3xl">
        <div className="absolute inset-0 bg-gradient-aurora" aria-hidden />
      </div>

      <div className="relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-light text-white">
            Why the product loop works
          </h2>
          <p className="mt-3 text-text-secondary">
            The edge is not a social feed. It is a tighter practice system that
            keeps rhythm, prompts, and progression in one place.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PROOF_POINTS.map(({ title, description, icon: Icon }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-black/30 p-6 shadow-soft"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-accent-purple">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-medium text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
