'use client'

import { ReactNode } from 'react'
import { Container } from '@/components/atoms/Container'

interface ReviewTemplateProps {
  header: ReactNode
  pageHeader: ReactNode
  player: ReactNode
  metadata?: ReactNode
  actions?: ReactNode
  alerts?: ReactNode
}

export function ReviewTemplate({
  header,
  pageHeader,
  player,
  metadata,
  actions,
  alerts,
}: ReviewTemplateProps) {
  return (
    <div className="min-h-screen bg-background text-text-primary pb-32">
      {header}

      <main className="pt-20 md:pt-24 px-4">
        <Container>
          {alerts}

          {/* Centered Page Header - Only render if content exists to avoid empty margin space */}
          {pageHeader && (
            <div className="mb-6 md:mb-8 text-center">{pageHeader}</div>
          )}

          <div className="max-w-2xl mx-auto space-y-6">
            <section>{player}</section>

            {/* Optional Metadata Section */}
            {metadata && <section className="w-full">{metadata}</section>}

            {/* Actions Footer */}
            {actions && (
              <section className="flex flex-col sm:flex-row justify-center gap-3 pt-6 border-t border-white/5">
                {actions}
              </section>
            )}
          </div>
        </Container>
      </main>
    </div>
  )
}
