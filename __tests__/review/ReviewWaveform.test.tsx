import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ReviewWaveform } from '@/components/molecules/review/ReviewWaveform'

vi.mock('wavesurfer.js', () => ({
  default: {
    create: () => {
      throw new Error('decode failed')
    },
  },
}))

vi.mock('@/components/molecules/practice/WaveformScrubber', () => ({
  WaveformScrubber: () => <div data-testid="waveform-fallback" />,
}))

describe('ReviewWaveform', () => {
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
})
