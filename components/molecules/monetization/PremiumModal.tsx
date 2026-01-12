'use client'

import { X, Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!mounted || !isOpen) return null

  const getContent = () => {
    switch (trigger) {
      case 'recording':
        return {
          title: 'Conquer the Studio: Unlimited Access',
          description:
            'Free users are limited to 2-minute sessions. Upgrade to record full studio-length tracks.',
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
    'Record full tracks. No limits. Total freedom.',
    `Unlock access to ${beatCount || 100}+ premium beats`,
    'Analyze your evolution with advanced stats',
    'Download studio-quality audio',
  ]

  const modal = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 safe-top safe-bottom">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-background-elevated border border-stroke-glow shadow-glow transform transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-text-secondary hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* Header Image/Gradient */}
        <div className="h-32 bg-gradient-to-br from-accent-purple/20 via-background-elevated to-accent-blue/20 relative">
          <div className="absolute inset-0 bg-grid-white/[0.05]" />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background-elevated to-transparent" />
        </div>

        <div className="px-6 pb-8 -mt-6 relative">
          {/* Icon Badge */}
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-purple shadow-lg mb-4 text-white">
            <Check size={24} strokeWidth={3} />
          </div>

          <h3 className="text-2xl font-bold text-white mb-2">
            {content.title}
          </h3>
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

          <button
            onClick={() => {
              router.push('/profile')
            }}
            className="w-full py-4 rounded-xl bg-white text-black font-bold text-lg hover:bg-gray-100 transition-transform active:scale-95 shadow-glow"
          >
            Get Pro - 3.99€/mo
          </button>

          <p className="mt-4 text-center text-xs text-text-tertiary">
            Cancel anytime. 7-day free trial included.
          </p>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
