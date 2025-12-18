'use client'

import { Modal } from '@/components/atoms/Modal'
import { Button } from '@/components/atoms/Button'
import { useRouter } from 'next/navigation'
import { Sparkles, Wand2, Share2 } from 'lucide-react'
import { PostProcessingModal } from './PostProcessingModal'
import { useState } from 'react'

interface SessionSummaryData {
  score: number
  vibe: string
  description: string
  wordCount: number
  duration: number
  audioUrl?: string
}

interface SessionSummaryModalProps {
  data: SessionSummaryData | null
  onClose: () => void
}

export function SessionSummaryModal({ data, onClose }: SessionSummaryModalProps) {
  const router = useRouter()
  const [showStudio, setShowStudio] = useState(false)

  if (!data) return null

  if (showStudio && data.audioUrl) {
    return (
      <PostProcessingModal
        audioUrl={data.audioUrl}
        onClose={() => setShowStudio(false)}
        onSave={(blob) => {
          console.log('Processed blob ready for upload:', blob)
          // Integration point for re-uploading processed audio if needed
        }}
      />
    )
  }

  return (
    <Modal isOpen={!!data} onClose={onClose} title="Session Complete">
      <div className="space-y-6">
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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-white">{data.score}</div>
            <div className="text-sm text-text-secondary">Vibe Score</div>
          </div>
          <div className="bg-white/5 p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-white">{data.wordCount}</div>
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
            <Button
              onClick={() => {
                const url = `/api/og?score=${data.score}&vibe=${data.vibe}&beat=${data.description.split('on ')[1] || 'FlowForge'}`
                window.open(url, '_blank')
              }}
              variant="outline"
              className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10 flex items-center justify-center gap-2"
            >
              <Share2 size={18} />
              Share Record (PNG)
            </Button>
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
