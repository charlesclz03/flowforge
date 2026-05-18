import Link from 'next/link'
import { SignInButton } from '@/components/molecules/auth/SignInButton'
import { UpgradeButton } from '@/components/molecules/subscription/UpgradeButton'

interface LandingPricingProps {
  isAuthenticated: boolean
  isPro: boolean
  monthlyPrice: number
  yearlyPrice: number
  ctaPath?: string
}

function formatPrice(price: number) {
  return `EUR ${price.toFixed(2)}`
}

export function LandingPricing({
  isAuthenticated,
  isPro,
  monthlyPrice,
  yearlyPrice,
  ctaPath = '/difficultyselection',
}: LandingPricingProps) {
  const yearlySavings = Math.max(
    0,
    Math.round((1 - yearlyPrice / (monthlyPrice * 12)) * 100)
  )
  const yearlyMonthlyEquivalent = yearlyPrice / 12

  return (
    <section id="pricing" className="scroll-mt-20">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-light text-white">Pricing</h2>
        <p className="mt-2 text-text-secondary">
          Practice free, then upgrade only if you want saved takes and more room
          to grow.
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-stroke-subtle/40 bg-background-card/40 p-8 backdrop-blur-light">
          <h3 className="text-2xl font-medium text-white">Free</h3>
          <p className="mt-2 text-4xl font-light text-white">
            EUR 0<span className="text-lg text-text-secondary">/forever</span>
          </p>
          <ul className="mt-6 space-y-3">
            {[
              'Guided practice sessions',
              'Starter beat vault access',
              'On-beat word prompts and XP',
              'Metadata-only session tracking',
            ].map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2 text-text-secondary"
              >
                <svg
                  className="h-5 w-5 text-accent-green"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {isAuthenticated ? (
            <Link
              href={ctaPath}
              className="mt-8 inline-flex w-full items-center justify-center rounded-lg border border-stroke-subtle/40 bg-background-card py-3 text-text-primary transition-colors hover:border-accent-blue/40"
            >
              Start Free
            </Link>
          ) : (
            <SignInButton
              callbackUrl={ctaPath}
              className="mt-8 w-full rounded-lg bg-white py-3 text-sm font-semibold text-gray-900"
            >
              Sign In and Start Free
            </SignInButton>
          )}
        </div>

        <div className="relative rounded-2xl border border-stroke-glow/60 bg-gradient-to-br from-accent-purple/10 via-accent-purple/5 to-accent-violet/10 p-8 backdrop-blur-light shadow-glow">
          <div className="absolute -top-3 right-6 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            Live Now
          </div>
          <h3 className="text-2xl font-medium text-white">Pro</h3>
          <p className="mt-2 text-4xl font-light text-white">
            {formatPrice(monthlyPrice)}
            <span className="text-lg text-text-secondary">/month</span>
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            Or {formatPrice(yearlyPrice)}/year, about{' '}
            {formatPrice(yearlyMonthlyEquivalent)}/month. Save {yearlySavings}%.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              'Unlimited practice sessions',
              'Premium beat vault access',
              'Save, replay, and download recordings',
              'Upload your own beats',
              'Stats, streaks, and full progress history',
            ].map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2 text-text-secondary"
              >
                <svg
                  className="h-5 w-5 text-accent-purple"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {isPro ? (
            <Link
              href="/profile"
              className="btn-primary mt-8 inline-flex w-full items-center justify-center rounded-full bg-primary px-8 py-3 text-center text-sm font-semibold text-primary-foreground shadow-neon transition hover:bg-primary/90 hover:shadow-glow"
            >
              Manage Pro
            </Link>
          ) : isAuthenticated ? (
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <UpgradeButton
                plan="monthly"
                className="rounded-full bg-gradient-pulse shadow-neon transition hover:shadow-glow"
              />
              <UpgradeButton
                plan="yearly"
                className="rounded-full border border-white/10 bg-white/10 text-white shadow-none hover:bg-white/15"
              />
            </div>
          ) : (
            <div className="mt-8 space-y-3">
              <SignInButton
                callbackUrl="/profile"
                className="w-full rounded-full bg-white py-3 text-sm font-semibold text-gray-900"
              >
                Sign In for Pro Checkout
              </SignInButton>
              <p className="text-center text-xs text-text-tertiary">
                Secure checkout powered by Stripe after sign-in.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
