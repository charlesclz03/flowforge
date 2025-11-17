'use client'

import { ReactNode } from 'react'
import { OnboardingLayout } from '@/components/organisms/layout/OnboardingLayout'

interface LandingTemplateProps {
  hero: ReactNode
  howItWorks: ReactNode
  pricing: ReactNode
  faq: ReactNode
}

export function LandingTemplate({ hero, howItWorks, pricing, faq }: LandingTemplateProps) {
  return (
    <OnboardingLayout>
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-16 pb-16 pt-16 md:pb-24 md:pt-20">
        {/* Hero Section */}
        {hero}

        {/* How it Works Section */}
        <section id="how-it-works" className="scroll-mt-20">
          {howItWorks}
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="scroll-mt-20">
          {pricing}
        </section>

        {/* FAQ Section */}
        <section id="faq" className="scroll-mt-20 pb-8">
          {faq}
        </section>
      </section>
    </OnboardingLayout>
  )
}
