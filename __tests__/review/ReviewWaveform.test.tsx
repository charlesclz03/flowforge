import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ReviewWaveform } from '@/components/molecules/review/ReviewWaveform'

const waveSurferMock = vi.hoisted(() => ({
  create: vi.fn(),
}))

vi.mock('wavesurfer.js', () => ({
  default: waveSurferMock,
}))

vi.mock('@/components/molecules/practice/WaveformScrubber', () => ({
  WaveformScrubber: ({ onSeek }: { onSeek?: (time: number) => void }) => (
    <button data-testid="waveform-fallback" onClick={() => onSeek?.(12)}>
      fallback
    </button>
  ),
}))

describe('ReviewWaveform', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    waveSurferMock.create.mockImplementation(() => {
      throw new Error('decode failed')
    })
  })

  it('renders the existing canvas scrubber when Wavesurfer cannot initialize', async () => {
    render(
      <ReviewWaveform
        url="https://storage.example/audio.webm"
        currentTime={10}
        duration={60}
        onSeek={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByTestId('waveform-fallback')).toBeInTheDocument()
    })
  })

  it('falls back to the canvas scrubber when Wavesurfer emits an error', async () => {
    const handlers = new Map<string, (time?: number) => void>()

    waveSurferMock.create.mockReturnValueOnce({
      on: vi.fn((event: string, handler: (time?: number) => void) => {
        handlers.set(event, handler)
        return vi.fn()
      }),
      destroy: vi.fn(),
      getDuration: vi.fn(() => 60),
      getCurrentTime: vi.fn(() => 0),
      setTime: vi.fn(),
    })

    render(
      <ReviewWaveform
        url="https://storage.example/audio.webm"
        currentTime={10}
        duration={60}
        onSeek={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(waveSurferMock.create).toHaveBeenCalled()
    })

    act(() => {
      handlers.get('error')?.()
    })

    await waitFor(() => {
      expect(screen.getByTestId('waveform-fallback')).toBeInTheDocument()
    })
  })
})
