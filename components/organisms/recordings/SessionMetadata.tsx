'use client'

import { formatDuration, formatRelativeTime } from '@/lib/utils'
import { FreestyleSessionWithBeat } from '@/types/database'
import { Calendar, Clock, Disc, Mic, BarChart, Activity } from 'lucide-react'
import { Card } from '@/components/atoms/Card'

interface SessionMetadataProps {
  recording: FreestyleSessionWithBeat
}

export function SessionMetadata({ recording }: SessionMetadataProps) {
  const difficultyLabel =
    ['Easy', 'Medium', 'Hard'][recording.difficulty - 1] || 'Unknown'
  const difficultyColor =
    {
      1: 'text-accent-green',
      2: 'text-accent-orange',
      3: 'text-accent-red',
    }[recording.difficulty] || 'text-text-secondary'

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Beat Details */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Disc className="text-accent-purple" size={20} />
          Beat Information
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-text-secondary">Title</span>
            <span className="text-white font-medium">
              {recording.beat.title}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-text-secondary">Artist</span>
            <span className="text-white font-medium">
              {recording.beat.artistName || 'Unknown Artist'}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-text-secondary">BPM</span>
            <span className="text-white font-medium">{recording.beat.bpm}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Genre</span>
            <span className="text-white font-medium">
              {recording.beat.genre || 'Hip Hop'}
            </span>
          </div>
        </div>
      </Card>

      {/* Session Stats */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="text-accent-purple" size={20} />
          Session Stats
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-text-secondary">Recorded</span>
            <span className="text-white font-medium flex items-center gap-2">
              <Calendar size={14} className="text-text-tertiary" />
              {formatRelativeTime(recording.createdAt)}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-text-secondary">Duration</span>
            <span className="text-white font-medium flex items-center gap-2">
              <Clock size={14} className="text-text-tertiary" />
              {formatDuration(recording.durationSeconds)}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-text-secondary">Difficulty</span>
            <span
              className={`font-medium ${difficultyColor} flex items-center gap-2`}
            >
              <BarChart size={14} />
              {difficultyLabel}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Frequency</span>
            <span className="text-white font-medium flex items-center gap-2">
              <Mic size={14} className="text-text-tertiary" />
              {recording.frequency} bars
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}
