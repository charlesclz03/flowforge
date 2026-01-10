'use client'

import { formatDuration, formatRelativeTime } from '@/lib/utils'
import { FreestyleSessionWithBeat } from '@/types/database'
import { Calendar, Clock, Disc, Activity, Type } from 'lucide-react'
import { Card } from '@/components/atoms/Card'

interface SessionMetadataProps {
  recording: FreestyleSessionWithBeat
}

export function SessionMetadata({ recording }: SessionMetadataProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
      {/* Beat Details */}
      <Card className="p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4 flex items-center gap-2">
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
      <Card className="p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4 flex items-center gap-2">
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
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Word Count</span>
            <span className="text-white font-medium flex items-center gap-2">
              <Type size={14} className="text-text-tertiary" />
              {recording.wordCount || 0} Words
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}
