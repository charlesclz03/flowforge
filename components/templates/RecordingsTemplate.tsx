'use client'

import { ReactNode } from 'react'
import { Container } from '@/components/atoms/Container'

interface RecordingsTemplateProps {
  header: ReactNode
  pageHeader: ReactNode
  alerts?: ReactNode
  recordingsList: ReactNode
  stats?: ReactNode
}

export function RecordingsTemplate({
  header,
  pageHeader,
  alerts,
  recordingsList,
  stats,
}: RecordingsTemplateProps) {
  return (
    <div className="min-h-screen bg-background">
      {header}

      <main className="py-8">
        <Container>
          <div className="space-y-8">
            {/* Page Header */}
            {pageHeader}

            {/* Error Display */}
            {alerts}

            {/* Recordings List */}
            {recordingsList}

            {/* Stats */}
            {stats}
          </div>
        </Container>
      </main>
    </div>
  )
}
