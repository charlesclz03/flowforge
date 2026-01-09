'use client'

import { Modal } from '@/components/atoms/Modal'
import { Button } from '@/components/atoms/Button'
import { useRouter } from 'next/navigation'
import { Sparkles, Wand2, Share2, Crown } from 'lucide-react'
import { PostProcessingModal } from './PostProcessingModal'
import { useState } from 'react'
import { ShareButton } from '@/components/molecules/sharing/ShareButton'

interface SessionSummaryData {
  score: number
  vibe: string
  description: string
  wordCount: number
  duration: number
  audioUrl?: string
  newBadges?: string[]
  difficulty: string
  bpm: number
  frequency: number
}

type SessionSummaryModalProps = {
  data: SessionSummaryData | null
  onClose: () => void
}

export default function SessionSummaryModal({
  data,
  onClose,
}: SessionSummaryModalProps) {
  const router = useRouter()
  const [showStudio, setShowStudio] = useState(false)

  if (!data) return null

  if (showStudio && data.audioUrl) {
    return (
      <PostProcessingModal
        audioUrl={data.audioUrl}
        onClose={() => setShowStudio(false)}
        onSave={(_blob) => {}}
      />
    )
  }

  return (
    <Modal isOpen={!!data} onClose={onClose} title="Session Complete">
      <div className="space-y-6">
        {/* Session Details Recap (New) */}
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-text-tertiary uppercase tracking-widest opacity-60">
          <span>
            {data.difficulty === 'Easy'
              ? 'Beginner'
              : data.difficulty === 'Medium'
                ? 'Medium'
                : data.difficulty === 'Hard'
                  ? 'Hard'
                  : data.difficulty}
          </span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span>{data.bpm} BPM</span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span>{data.frequency} Bars</span>
        </div>
        {/* Score & Vibe */}
        <div className="text-center space-y-2">
          <div className="inline-block p-4 rounded-full bg-accent-purple/20 border border-accent-purple/50 mb-2">
            <Sparkles size={32} className="text-accent-purple" />
          </div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-purple to-accent-pink">
            {data.vibe}
          </h2>
          <p className="text-text-secondary text-lg">{data.description}</p>
        </div>

        {/* New Badges Notification */}
        {data.newBadges && data.newBadges.length > 0 && (
          <div className="bg-accent-purple/10 border border-accent-purple/30 rounded-2xl p-4 animate-in zoom-in-95 duration-500">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-8 w-8 rounded-full bg-accent-purple/20 flex items-center justify-center">
                <Crown size={18} className="text-accent-purple" />
              </div>
              <h3 className="font-bold text-white">New Achievements!</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.newBadges.map((badge) => (
                <div
                  key={badge}
                  className="px-3 py-1.5 rounded-lg bg-accent-purple/20 border border-accent-purple/30 text-xs font-bold text-accent-purple flex items-center gap-2"
                >
                  <Sparkles size={12} />
                  {badge}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-white">{data.score}</div>
            <div className="text-sm text-text-secondary">Vibe Score</div>
          </div>
          <div className="bg-white/5 p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-white">
              {data.wordCount}
            </div>
            <div className="text-sm text-text-secondary">Words Flowed</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {data.audioUrl && (
            <Button
              onClick={() => setShowStudio(true)}
              variant="outline"
              className="w-full border-accent-purple text-accent-purple hover:bg-accent-purple/10 flex items-center justify-center gap-2"
            >
              <Wand2 size={18} />
              Studio FX & Mixer
            </Button>
          )}
          {data.audioUrl && (
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => {
                  const url = `/api/og?score=${data.score}&vibe=${data.vibe}&beat=${data.description.split('on ')[1] || 'FlowForge'}`
                  window.open(url, '_blank')
                }}
                variant="outline"
                className="border-white/10 bg-white/5 text-white hover:bg-white/10 flex items-center justify-center gap-2"
              >
                <Share2 size={16} />
                PNG Record
              </Button>
              <ShareButton
                title="My FreeStyla Session"
                text={`Check out my flow! Vibe score: ${data.score} (${data.vibe}). #FreeStyla #Freestyle`}
                url={window?.location?.origin}
                className="bg-accent-blue text-white hover:bg-accent-blue/90 w-full justify-center"
              />
            </div>
          )}
          <Button
            onClick={() => router.push('/recordings')}
            className="w-full bg-white text-black hover:bg-white/90"
          >
            View in Recordings
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full">
            Close & Keep Practicing
          </Button>
        </div>
      </div>
    </Modal>
  )
}
