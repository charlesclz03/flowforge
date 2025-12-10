'use client'

import { ReactNode } from 'react'
import { Container } from '@/components/atoms/Container'

interface ReviewTemplateProps {
  header: ReactNode
  pageHeader: ReactNode
  player: ReactNode
  metadata: ReactNode
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
    <div className="min-h-screen bg-background text-text-primary pb-24">
      {header}

      <main className="pt-24 md:pt-32">
        <Container>
          {alerts}

          <div className="mb-8">{pageHeader}</div>

          <div className="max-w-4xl mx-auto space-y-8">
            <section>{player}</section>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <section className="flex-1 w-full">{metadata}</section>
            </div>

            {/* Actions Footer / Section */}
            {actions && (
              <section className="flex justify-center pt-8 border-t border-white/5">
                {actions}
              </section>
            )}
          </div>
        </Container>
      </main>
    </div>
  )
}
