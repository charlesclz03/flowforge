'use client'

import { Player } from '@remotion/player'
import { ShareClip } from '@/components/features/export/remotion/ShareClip'

interface RemotionClipPreviewProps {
  title: string
  handle: string
  audioSrc?: string
}

const FPS = 30
const DURATION_SECONDS = 30

export function RemotionClipPreview({
  title,
  handle,
  audioSrc,
}: RemotionClipPreviewProps) {
  return (
    <div className="mx-auto w-full max-w-[300px]">
      <div className="overflow-hidden rounded-3xl border border-white/10 shadow-soft">
        <Player
          component={ShareClip}
          inputProps={{
            title,
            handle,
            caption: 'Practice free · freestyla.app',
            audioSrc,
          }}
          durationInFrames={FPS * DURATION_SECONDS}
          fps={FPS}
          compositionWidth={1080}
          compositionHeight={1920}
          style={{ width: '100%' }}
          controls
          loop
        />
      </div>
      <p className="mt-2 text-center text-xs text-text-tertiary">
        Animated branded preview — Remotion
      </p>
    </div>
  )
}
