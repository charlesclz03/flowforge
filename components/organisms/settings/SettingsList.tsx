'use client'

import { Settings, Shield, Volume2, Mic, FileText, Bug, User, Scale, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePracticeSession } from '@/contexts/SessionContext'
import { cn } from '@/lib/utils'

export function SettingsList({ onItemClick }: { onItemClick?: () => void }) {
  const { data: session } = useSession()
  const { isTTSEnabled, setTTSEnabled, ttsVolume, setTTSVolume, testVoice } = usePracticeSession()

  const handleLinkClick = () => {
    if (onItemClick) onItemClick()
  }

  return (
    <div className="w-full">
      {/* User Header */}
      <div className="px-4 py-4 bg-white/5 border-b border-white/10 mb-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-accent-purple/10 flex items-center justify-center border border-accent-purple/20">
            <User size={20} className="text-accent-purple" />
          </div>
          <div>
            <p className="text-sm font-medium text-white truncate max-w-[150px]">
              {session?.user?.name || 'Practitioner'}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-text-secondary">Lyricist</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Controls */}
      <div className="py-1">
        {/* TTS Toggle */}
        <div className="flex items-center justify-between px-4 py-3 transition-colors cursor-pointer hover:bg-white/5">
          <div className="flex items-center gap-3 text-sm text-white">
            <Mic size={16} className="text-accent-orange" />
            <span>Voice Prompts</span>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault()
              setTTSEnabled(!isTTSEnabled)
            }}
            className={cn(
              'w-9 h-5 rounded-full transition-colors relative',
              isTTSEnabled ? 'bg-accent-orange' : 'bg-white/20'
            )}
          >
            <div
              className={cn(
                'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm',
                isTTSEnabled ? 'left-4.5' : 'left-0.5'
              )}
            />
          </button>
        </div>

        {/* Admin Only: Test Voice */}
        {['triplyricist@gmail.com', 'charles.cluzeaud@gmail.com'].includes(
          session?.user?.email || ''
        ) && (
          <button
            onClick={(e) => {
              e.preventDefault()
              testVoice()
            }}
            className="flex w-full items-center px-4 py-2 text-xs font-medium text-accent-purple transition-colors hover:bg-white/5"
          >
            <Mic size={14} className="mr-3" />
            Test Voice (Admin)
          </button>
        )}

        {/* Volume Slider */}
        {isTTSEnabled && (
          <div className="px-4 py-2 pb-3">
            <div className="flex items-center gap-3 mb-2">
              <Volume2 size={14} className="text-text-secondary" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={ttsVolume}
                onChange={(e) => {
                  e.preventDefault()
                  setTTSVolume(parseFloat(e.target.value))
                }}
                className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white hover:[&::-webkit-slider-thumb]:bg-accent-orange transition-colors"
              />
            </div>
          </div>
        )}
      </div>

      <div className="my-1 border-t border-white/5" />

      {/* Links Section */}
      <div className="py-1">
        <Link
          href="/settings/latency"
          onClick={handleLinkClick}
          className="flex w-full items-center px-4 py-3 text-sm text-text-primary transition-colors hover:bg-white/5"
        >
          <Settings size={16} className="mr-3 text-text-secondary" />
          Calibrate
        </Link>
        <Link
          href="/patch-notes"
          onClick={handleLinkClick}
          className="flex w-full items-center px-4 py-3 text-sm text-text-primary transition-colors hover:bg-white/5"
        >
          <FileText size={16} className="mr-3 text-text-secondary" />
          Patch Notes
        </Link>
        <Link
          href="/legal/terms"
          onClick={handleLinkClick}
          className="flex w-full items-center px-4 py-3 text-sm text-text-primary transition-colors hover:bg-white/5"
        >
          <Scale size={16} className="mr-3 text-text-secondary" />
          Terms of Service
        </Link>
        <Link
          href="/legal/privacy"
          onClick={handleLinkClick}
          className="flex w-full items-center px-4 py-3 text-sm text-text-primary transition-colors hover:bg-white/5"
        >
          <Shield size={16} className="mr-3 text-text-secondary" />
          Privacy Policy
        </Link>
        <a
          href="mailto:support@flowforge.com"
          className="flex w-full items-center px-4 py-3 text-sm text-text-primary transition-colors hover:bg-white/5"
        >
          <Bug size={16} className="mr-3 text-text-secondary" />
          Report Bug
        </a>

        <div className="my-1 border-t border-white/5" />

        {session && (
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex w-full items-center px-4 py-3 text-sm text-text-primary transition-colors hover:bg-white/5"
          >
            <LogOut size={16} className="mr-3 text-text-secondary" />
            Sign Out
          </button>
        )}
      </div>
    </div>
  )
}
