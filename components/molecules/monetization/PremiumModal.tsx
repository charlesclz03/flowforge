'use client'

import { Check } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { PLANS } from '@/lib/stripe'
import { SignInButton } from '@/components/molecules/auth/SignInButton'
import { UpgradeButton } from '@/components/molecules/subscription/UpgradeButton'
import { Modal } from '@/components/atoms/Modal'

export interface PremiumModalProps {
  isOpen: boolean
  onClose: () => void
  trigger: 'recording' | 'beat' | 'history' | 'general'
  beatCount?: number
}

export function PremiumModal({
  isOpen,
  onClose,
  trigger,
  beatCount,
}: PremiumModalProps) {
  const { data: session } = useSession()
  const isAuthenticated = Boolean(session?.user)

  const getContent = () => {
    switch (trigger) {
      case 'recording':
        return {
          title: 'Conquer the Studio: Unlimited Access',
          description:
            'Sessions run up to 10 minutes. Upgrade to save, download, and polish full studio-length tracks.',
        }
      case 'beat':
        return {
          title: 'Unlock the Secret Beat Vault',
          description:
            'This track is locked. Pro members get access to our full library of secret premium beats.',
        }
      case 'history':
        return {
          title: 'Analyze Your Evolution',
          description:
            'Save and review all your past sessions to track your growth with FreeStyla Pro.',
        }
      default:
        return {
          title: 'Unlock the Secret to Pro Flow',
          description:
            'Take your freestyle skills to the next level with professional tools.',
        }
    }
  }

  const content = getContent()

  const benefits = [
    'Save and export full 10-minute tracks.',
    `Unlock access to ${beatCount || 100}+ premium beats`,
    'Analyze your evolution with advanced stats',
    'Download studio-quality audio',
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={content.title}
      className="max-w-sm"
    >
      <div className="-mx-6 -mt-6">
        <div className="relative h-32 bg-gradient-to-br from-accent-purple/20 via-background-elevated to-accent-blue/20">
          <div className="absolute inset-0 bg-grid-white/[0.05]" />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background-elevated to-transparent" />
        </div>

        <div className="px-6 pb-8 -mt-6 relative">
          {/* Icon Badge */}
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-purple shadow-lg mb-4 text-white">
            <Check size={24} strokeWidth={3} />
          </div>

          <p className="text-text-secondary mb-6 leading-relaxed">
            {content.description}
          </p>

          <div className="space-y-3 mb-8">
            {benefits.map((benefit, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-sm text-text-primary/90"
              >
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent-purple/20 flex items-center justify-center text-accent-purple">
                  <Check size={12} strokeWidth={3} />
                </div>
                {benefit}
              </div>
            ))}
          </div>

          {isAuthenticated ? (
            <div className="grid gap-3">
              <UpgradeButton
                plan="monthly"
                source={`premium_modal_${trigger}`}
                className="w-full rounded-xl bg-primary py-4 text-lg font-bold text-primary-foreground shadow-glow hover:bg-primary/90"
              >
                Get Pro -{' '}
                {PLANS.monthly.price.toLocaleString('en-US', {
                  style: 'currency',
                  currency: PLANS.monthly.currency,
                })}
                /mo
              </UpgradeButton>
              <UpgradeButton
                plan="yearly"
                source={`premium_modal_${trigger}`}
                className="w-full rounded-xl border border-white/10 bg-white/10 py-3 text-sm font-semibold text-white shadow-none hover:bg-white/15"
              >
                Upgrade yearly
              </UpgradeButton>
            </div>
          ) : (
            <div className="grid gap-3">
              <SignInButton
                callbackUrl="/pricing"
                className="w-full rounded-xl py-4 text-lg font-bold"
              >
                Sign in to upgrade
              </SignInButton>
              <Link
                href="/pricing"
                onClick={onClose}
                className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                View pricing
              </Link>
            </div>
          )}

          <p className="mt-4 text-center text-xs text-text-tertiary">
            Cancel anytime.
          </p>
        </div>
      </div>
    </Modal>
  )
}
