import React from 'react'
import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'

export type ShareClipProps = {
  title: string
  handle: string
  caption: string
  audioSrc?: string
}

const PURPLE = '#7D7AFF'
const BARS = 32

// In-app share-clip composition rendered by @remotion/player on the video page.
// Mirrors the offline content-factory clip; props come from the recording.
export const ShareClip: React.FC<ShareClipProps> = ({
  title,
  handle,
  caption,
  audioSrc,
}) => {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  const fade = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' })
  const chipIn = spring({ frame: frame - 8, fps, config: { damping: 13 } })
  const ringProgress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: 'clamp',
  })

  const radius = 250
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - ringProgress)

  const bars = Array.from(
    { length: BARS },
    (_, i) => 28 + Math.abs(Math.sin(frame * 0.18 + i * 0.5)) * 120
  )

  const label = (title || 'FREESTYLE').toUpperCase().slice(0, 20)

  return (
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(120% 50% at 50% 0%, rgba(125,122,255,0.42), transparent 62%), #060608',
        fontFamily: 'Inter, system-ui, sans-serif',
        color: '#ffffff',
        opacity: fade,
      }}
    >
      {audioSrc ? <Audio src={audioSrc} /> : null}

      <div
        style={{
          position: 'absolute',
          top: 70,
          left: 70,
          right: 70,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 40,
          fontWeight: 600,
        }}
      >
        <span>{handle}</span>
        <span style={{ color: '#A1A1AA', fontFamily: 'monospace' }}>FLOW</span>
      </div>

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            transform: `translateY(${(1 - chipIn) * 30}px)`,
            opacity: chipIn,
            marginBottom: 60,
            padding: '16px 40px',
            borderRadius: 999,
            border: `2px solid ${PURPLE}`,
            background: 'rgba(125,122,255,0.18)',
            fontSize: 40,
            fontWeight: 800,
            letterSpacing: 3,
            maxWidth: 800,
            textAlign: 'center',
          }}
        >
          {label}
        </div>

        <div style={{ position: 'relative', width: 560, height: 560 }}>
          <svg width={560} height={560} viewBox="0 0 560 560">
            <circle
              cx={280}
              cy={280}
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={14}
            />
            <circle
              cx={280}
              cy={280}
              r={radius}
              fill="none"
              stroke={PURPLE}
              strokeWidth={16}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 280 280)"
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'monospace',
              fontWeight: 800,
              fontSize: 92,
              letterSpacing: 8,
            }}
          >
            FLOW
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            height: 160,
            marginTop: 70,
          }}
        >
          {bars.map((h, i) => (
            <div
              key={i}
              style={{
                width: 10,
                height: h,
                borderRadius: 6,
                background: PURPLE,
                opacity: 0.85,
              }}
            />
          ))}
        </div>
      </AbsoluteFill>

      <div
        style={{
          position: 'absolute',
          bottom: 90,
          left: 70,
          right: 70,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
        }}
      >
        <div
          style={{
            fontFamily: 'monospace',
            fontWeight: 700,
            letterSpacing: 8,
            fontSize: 44,
          }}
        >
          FREESTYLA
        </div>
        <div style={{ color: '#A1A1AA', fontSize: 32 }}>{caption}</div>
      </div>
    </AbsoluteFill>
  )
}
