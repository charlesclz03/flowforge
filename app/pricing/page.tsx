import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { OnboardingLayout } from '@/components/organisms/layout/OnboardingLayout'
import { LandingPricing } from '@/components/organisms/landing/LandingPricing'
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
      <div className="py-8 sm:py-12">
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
