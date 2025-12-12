'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Shield, FileText, Smartphone, LogOut } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { usePracticeSession } from '@/contexts/SessionContext'
import { Volume2, Mic } from 'lucide-react'
import { signOut } from 'next-auth/react'

interface SettingsDropdownProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsDropdown({ isOpen, onClose }: SettingsDropdownProps) {
  const [safeMode, setSafeMode] = useState(false)
  const [visualizer, setVisualizer] = useState<'ring' | 'wave'>('ring')
  const { isTTSEnabled, setTTSEnabled, ttsVolume, setTTSVolume } = usePracticeSession()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute top-12 right-0 mt-2 w-80 bg-background-elevated rounded-xl border border-white/10 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Settings</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Preferences */}
        <div className="space-y-3">
          {/* Safe Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-accent-blue" />
              <span className="text-sm text-white">Safe Mode</span>
            </div>
            <button
              onClick={() => setSafeMode(!safeMode)}
              className={cn(
                'w-8 h-4 rounded-full transition-colors relative',
                safeMode ? 'bg-accent-blue' : 'bg-white/10'
              )}
            >
              <div
                className={cn(
                  'absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform',
                  safeMode ? 'left-4.5' : 'left-0.5'
                )}
              />
            </button>
          </div>

          {/* Visualizer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone size={16} className="text-accent-purple" />
              <span className="text-sm text-white">Visualizer</span>
            </div>
            <div className="flex bg-background-card rounded p-0.5">
              <button
                onClick={() => setVisualizer('ring')}
                className={cn(
                  'px-2 py-0.5 text-[10px] rounded transition-all',
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
                  'px-2 py-0.5 text-[10px] rounded transition-all',
                  visualizer === 'wave'
                    ? 'bg-white/10 text-white'
                    : 'text-text-secondary hover:text-white'
                )}
              >
                Wave
              </button>
            </div>
          </div>
        </div>

        {/* Audio */}
        <div className="space-y-3 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic size={16} className="text-accent-orange" />
              <span className="text-sm text-white">Voice Prompts</span>
            </div>
            <button
              onClick={() => setTTSEnabled(!isTTSEnabled)}
              className={cn(
                'w-8 h-4 rounded-full transition-colors relative',
                isTTSEnabled ? 'bg-accent-orange' : 'bg-white/10'
              )}
            >
              <div
                className={cn(
                  'absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform',
                  isTTSEnabled ? 'left-4.5' : 'left-0.5'
                )}
              />
            </button>
          </div>

          {isTTSEnabled && (
            <div className="flex items-center gap-2 pl-6">
              <Volume2 size={14} className="text-text-tertiary" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={ttsVolume}
                onChange={(e) => setTTSVolume(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              />
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-white/10 space-y-2">
          <Link
            href="/legal/terms"
            onClick={onClose}
            className="flex items-center gap-2 text-xs text-text-secondary hover:text-white transition-colors"
          >
            <FileText size={14} />
            <span>Terms</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors w-full text-left mt-2"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  )
}
