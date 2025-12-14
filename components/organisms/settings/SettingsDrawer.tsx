'use client'

import { useState } from 'react'
import { X, Shield, FileText, Smartphone, Settings } from 'lucide-react'
import Link from 'next/link'
// import { Card } from '@/components/atoms/Card'
import { cn } from '@/lib/utils'
import { usePracticeSession } from '@/contexts/SessionContext'
import { Volume2, Mic } from 'lucide-react'

interface SettingsDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
  const [safeMode, setSafeMode] = useState(false)
  const [visualizer, setVisualizer] = useState<'ring' | 'wave'>('ring')
  const { isTTSEnabled, setTTSEnabled, ttsVolume, setTTSVolume } = usePracticeSession()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div
        className={cn(
          'relative w-full max-w-md bg-background-elevated rounded-t-2xl sm:rounded-2xl border-t sm:border border-white/10 p-6 shadow-2xl transition-transform duration-300 transform',
          isOpen ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-white rounded-full hover:bg-white/5"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Preferences */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-text-tertiary uppercase tracking-wider">
              Preferences
            </h3>

            {/* Safe Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-accent-blue" />
                <div>
                  <div className="text-white font-medium">Safe Mode</div>
                  <div className="text-xs text-text-secondary">Filter explicit words</div>
                </div>
              </div>
              <button
                onClick={() => setSafeMode(!safeMode)}
                className={cn(
                  'w-12 h-6 rounded-full transition-colors relative',
                  safeMode ? 'bg-accent-blue' : 'bg-white/10'
                )}
              >
                <div
                  className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                    safeMode ? 'left-7' : 'left-1'
                  )}
                />
              </button>
            </div>

            {/* Visualizer Style */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone size={20} className="text-accent-purple" />
                <div>
                  <div className="text-white font-medium">Visualizer</div>
                  <div className="text-xs text-text-secondary">Playback animation style</div>
                </div>
              </div>
              <div className="flex bg-background-card rounded-lg p-1">
                <button
                  onClick={() => setVisualizer('ring')}
                  className={cn(
                    'px-3 py-1 text-xs rounded-md transition-all',
                    visualizer === 'ring'
                      ? 'bg-white/10 text-white'
                      : 'text-text-secondary hover:text-white'
                  )}
                >
                  Ring
                </button>
                <button
                  onClick={() => setVisualizer('wave')}
                  className={cn(
                    'px-3 py-1 text-xs rounded-md transition-all',
                    visualizer === 'wave'
                      ? 'bg-white/10 text-white'
                      : 'text-text-secondary hover:text-white'
                  )}
                >
                  Wave
                </button>
              </div>
            </div>

            {/* Calibration Link */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings size={20} className="text-accent-pink" />
                <div>
                  <div className="text-white font-medium">Latency</div>
                  <div className="text-xs text-text-secondary">Calibrate audio timing</div>
                </div>
              </div>
              <Link
                href="/calibration"
                onClick={onClose}
                className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md transition-colors"
              >
                Calibrate
              </Link>
            </div>
          </div>

          {/* Audio Settings */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h3 className="text-sm font-bold text-text-tertiary uppercase tracking-wider">Audio</h3>

            {/* TTS Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mic size={20} className="text-accent-orange" />
                <div>
                  <div className="text-white font-medium">Voice Prompts</div>
                  <div className="text-xs text-text-secondary">Read words aloud</div>
                </div>
              </div>
              <button
                onClick={() => setTTSEnabled(!isTTSEnabled)}
                className={cn(
                  'w-12 h-6 rounded-full transition-colors relative',
                  isTTSEnabled ? 'bg-accent-orange' : 'bg-white/10'
                )}
              >
                <div
                  className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                    isTTSEnabled ? 'left-7' : 'left-1'
                  )}
                />
              </button>
            </div>

            {/* Volume Slider (Only show if enabled) */}
            <div
              className={cn(
                'overflow-hidden transition-all duration-300 space-y-2 pl-8',
                isTTSEnabled ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
              )}
            >
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>Volume</span>
                <span>{Math.round(ttsVolume * 100)}%</span>
              </div>
              <div className="flex items-center gap-3">
                <Volume2 size={16} className="text-text-tertiary" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={ttsVolume}
                  onChange={(e) => setTTSVolume(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white hover:[&::-webkit-slider-thumb]:bg-accent-orange transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-white/10" />

          {/* Legal Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-text-tertiary uppercase tracking-wider">Legal</h3>
            <Link
              href="/legal/terms"
              className="flex items-center gap-3 text-text-secondary hover:text-white transition-colors"
            >
              <FileText size={20} />
              <span>Terms of Service</span>
            </Link>
            <Link
              href="/legal/privacy"
              className="flex items-center gap-3 text-text-secondary hover:text-white transition-colors"
            >
              <Shield size={20} />
              <span>Privacy Policy</span>
            </Link>
          </div>

          <div className="pt-4 text-center space-y-3">
            <a
              href="mailto:support@flowforge.com"
              className="text-xs text-text-secondary hover:text-white transition-colors underline decoration-white/30 hover:decoration-white"
            >
              Report Bug / Feedback
            </a>
            <div className="text-xs text-text-tertiary">FlowForge v1.0.0</div>
          </div>
        </div>
      </div>
    </div>
  )
}
