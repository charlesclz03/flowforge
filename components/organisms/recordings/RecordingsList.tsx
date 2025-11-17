'use client'

import { Card } from '@/components/atoms/Card'
import { Spinner } from '@/components/atoms/Spinner'
import { EmptyState } from '@/components/molecules/feedback/EmptyState'
import { RecordingCard } from '@/components/organisms/recordings/RecordingCard'
import { FreestyleSessionWithBeat } from '@/types/database'

interface RecordingsListProps {
  recordings: FreestyleSessionWithBeat[]
  isLoading: boolean
  onDelete: (id: string) => Promise<void>
  onDownload: (recording: FreestyleSessionWithBeat) => Promise<void>
}

export function RecordingsList({
  recordings,
  isLoading,
  onDelete,
  onDownload,
}: RecordingsListProps) {
  if (isLoading) {
    return (
      <Card>
        <div className="py-12 text-center">
          <Spinner size="lg" className="mx-auto" />
          <p className="mt-4 text-text-secondary">Loading recordings...</p>
        </div>
      </Card>
    )
  }

  if (recordings.length === 0) {
    return (
      <Card>
        <EmptyState
          title="No recordings yet"
          description="Start practicing to save your recordings here"
        />
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {recordings.map((recording) => (
        <RecordingCard
          key={recording.id}
          recording={recording}
          onDelete={onDelete}
          onDownload={onDownload}
        />
      ))}
    </div>
  )
}
