import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { OnboardingLayout } from '@/components/organisms/layout/OnboardingLayout'
import { LandingPricing } from '@/components/organisms/landing/LandingPricing'
import { Surface } from '@/components/atoms/Surface'
import { StatusBadge } from '@/components/atoms/StatusBadge'
import { authOptions } from '@/lib/auth'
import { PLANS } from '@/lib/stripe'
import { isProUser } from '@/lib/subscription/isPro'

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Compare FreeStyla Free and Pro plans, then upgrade securely with Stripe.',
}

export default async function PricingPage() {
  const session = await getServerSession(authOptions)
  const isAuthenticated = Boolean(session?.user)
  const isPro = isProUser(session?.user)

  return (
    <OnboardingLayout
      showBackButton
      customTitle="PRICING"
      customSubtitle="Choose your practice setup"
      showProgress={false}
    >
      <div className="space-y-6 py-8 sm:py-12">
        <Surface tone="glass" padding="md" className="rounded-3xl">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <StatusBadge tone="premium">Pro workspace</StatusBadge>
              <h1 className="mt-3 text-2xl font-semibold text-white">
                Upgrade when review and storage matter.
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary">
                Free is built for practice. Pro adds saved takes, deeper review,
                and upload workflows without changing the core training loop.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {['Record', 'Review', 'Upload'].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-black/25 px-3 py-3 text-xs font-semibold text-white"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </Surface>
        <LandingPricing
          isAuthenticated={isAuthenticated}
          isPro={isPro}
          monthlyPrice={PLANS.monthly.price}
          yearlyPrice={PLANS.yearly.price}
          ctaPath="/difficultyselection"
        />
      </div>
    </OnboardingLayout>
  )
}
