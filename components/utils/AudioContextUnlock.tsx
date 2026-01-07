'use client'

import { useEffect, useCallback } from 'react'

/**
 * Invisible component that unlocks the AudioContext on the first user interaction
 * Critical for iOS Safari where audio is suspended until a touch event.
 */
export function AudioContextUnlock() {
  const unlock = useCallback(() => {
    // 1. Create a dummy context
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    if (!AudioContextClass) return

    const ctx = new AudioContextClass()

    // 2. Resume if suspended (common in iOS)
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    // 3. Play silent buffer to force the "hardware" to wake up
    const buffer = ctx.createBuffer(1, 1, 22050)
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(ctx.destination)
    source.start(0)

    // 4. Cleanup
    setTimeout(() => {
      if (ctx.state === 'running') {
        // We keep it running? Or close it?
        // Actually, for "global" context (like passing it around), we'd want to keep it.
        // But since our app creates new AudioContexts in `analyzeAudio` and `AudioRecorder`,
        // we mainly just need to "bless" the page interaction.
        // However, `AudioRecorder` and `analyzeAudio` create NEW contexts.
        // Unlocking ONE context often unlocks the "Process" permission for audio on the tab in modern browsers.
        // But strict iOS might require each context to be resumed in a touch handler.

        // For `useRecording`, the user clicks "Start Recording", which is an interaction, so that's safe.
        // For `analyzeAudio`, it runs AFTER recording (on a blob), so it's purely computational (offline context usually).

        // The main issue is AudioVisualizer if it tries to run on load?
        // Or `AudioPlayer` (HTML5 Audio) which usually just needs play() called on click.

        // So this Unlocker is mostly a safety net.
        ctx.close()
      }
    }, 100)

    // Remove listeners once unlocked
    window.removeEventListener('touchstart', unlock)
    window.removeEventListener('click', unlock)
    window.removeEventListener('keydown', unlock)
  }, [])

  useEffect(() => {
    window.addEventListener('touchstart', unlock, { passive: true })
    window.addEventListener('click', unlock, { passive: true })
    window.addEventListener('keydown', unlock, { passive: true })

    return () => {
      window.removeEventListener('touchstart', unlock)
      window.removeEventListener('click', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [unlock])

  return null
}
