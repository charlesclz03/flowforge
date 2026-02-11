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
    <div className="h-full min-h-full bg-background text-text-primary">
      {header}

      <main className="px-4 py-6 md:py-8">
        <Container>
          {alerts}

          {/* Centered Page Header - Only render if content exists to avoid empty margin space */}
          {pageHeader && <div className="mb-6 md:mb-8">{pageHeader}</div>}

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
