'use client'

import { Container } from '@/components/atoms/Container'
import { AppHeader } from '@/components/organisms/layout/AppHeader'
import { FeedbackForm } from '@/components/features/feedback/FeedbackForm'
import { useRouter } from 'next/navigation'
import { Bug, Lightbulb, MessageSquare } from 'lucide-react'

export default function FeedbackPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background pb-bottomnav">
      <AppHeader
        showBackButton
        onBack={() => router.back()}
        customTitle="FEEDBACK"
        customSubtitle="Report bugs & share ideas"
      />
      <Container className="pt-8 space-y-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-purple/10 mb-4">
            <MessageSquare className="w-8 h-8 text-accent-purple" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Report a Bug or Share Feedback
          </h1>
          <p className="text-text-secondary text-sm max-w-md mx-auto">
            Found something broken? Have an idea to improve FreeStyla?
            We&apos;re listening. Your feedback shapes our roadmap.
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/5 bg-surface-elevation-1 p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Bug size={18} className="text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm mb-1">
                  Report a Bug
                </h3>
                <p className="text-xs text-text-tertiary">
                  Describe what went wrong, steps to reproduce, and what
                  device/browser you&apos;re using.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-surface-elevation-1 p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-accent-purple/10 rounded-lg">
                <Lightbulb size={18} className="text-accent-purple" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm mb-1">
                  Feature Request
                </h3>
                <p className="text-xs text-text-tertiary">
                  Tell us what features would make FreeStyla even better for
                  your practice.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Form */}
        <FeedbackForm />

        {/* Footer Note */}
        <div className="text-center pt-4">
          <p className="text-xs text-text-tertiary">
            We review all submissions. Thank you for helping us improve!
          </p>
        </div>
      </Container>
    </div>
  )
}
