'use client'

import {
  Settings,
  Shield,
  Volume2,
  Mic,
  FileText,
  Bug,
  User,
  Scale,
  LogOut,
  LogIn,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Zap,
  Crown,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut, signIn } from 'next-auth/react'
import { usePracticeSession } from '@/contexts/SessionContext'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { useState } from 'react'
import { SupportModal } from '@/components/organisms/support/SupportModal'
import { getLevelInfo } from '@/lib/gamification/xp'

export function SettingsList({ onItemClick }: { onItemClick?: () => void }) {
  const { data: session } = useSession()
  const [isManaging, setIsManaging] = useState(false)
  const {
    isTTSEnabled,
    setTTSEnabled,
    ttsVolume,
    setTTSVolume,
    testVoice,
    isStudioFXEnabled,
    setStudioFXEnabled,
    beatVolume,
    setBeatVolume,
  } = usePracticeSession()
  const [isStudioOpen, setIsStudioOpen] = useState(false)
  const [isSupportOpen, setIsSupportOpen] = useState(false)

  // Determine subscription status
  const isPro =
    session?.user?.subscriptionStatus === 'active' ||
    session?.user?.subscriptionStatus === 'trialing'

  const handleLinkClick = () => {
    if (onItemClick) onItemClick()
  }

  const handlePortalRedirect = async () => {
    if (isManaging) return
    setIsManaging(true)
    try {
      const response = await fetch('/api/stripe/portal', { method: 'POST' })
      if (!response.ok) throw new Error('Failed to open billing portal')
      const { url } = await response.json()
      if (url) window.location.href = url
    } catch (error) {
      console.error('Portal error:', error)
      toast.error('Could not open billing portal')
    } finally {
      setIsManaging(false)
    }
  }

  // Helper for consistent menu items
  const MenuItem = ({
    icon: Icon,
    label,
    href,
    onClick,
    color = 'text-zinc-400',
    showChevron = true,
  }: {
    icon: React.ElementType
    label: string
    href?: string
    onClick?: () => void
    color?: string
    showChevron?: boolean
  }) => {
    const content = (
      <div className="flex w-full items-center justify-between px-5 py-4 transition-all hover:bg-white/5 active:scale-[0.98]">
        <div className="flex items-center gap-4">
          <Icon size={20} className={color} />
          <span className="text-sm font-medium text-zinc-200">{label}</span>
        </div>
        {showChevron && <ChevronRight size={16} className="text-white/20" />}
      </div>
    )

    if (href) {
      return (
        <Link href={href} onClick={handleLinkClick} className="block w-full">
          {content}
        </Link>
      )
    }

    return (
      <button onClick={onClick} className="w-full text-left">
        {content}
      </button>
    )
  }

  return (
    <div className="w-full space-y-6 pb-8">
      {/* Profile Card */}
      <div className="mx-4 mt-2">
        <Link
          href={
            session?.user?.username ? `/u/${session.user.username}` : '/profile'
          }
          className={cn(
            'block relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900/50 to-purple-900/50 p-6 border border-white/10 shadow-xl transition-transform active:scale-[0.98]',
            session?.user?.username && 'cursor-pointer hover:border-white/20'
          )}
        >
          <div className="absolute top-0 right-0 p-3 opacity-20">
            <Sparkles size={64} className="text-white" />
          </div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-accent-purple flex items-center justify-center border-2 border-white/20 shadow-lg shrink-0">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  width={56}
                  height={56}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User size={24} className="text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold text-white leading-tight truncate">
                  {session?.user?.name || 'Practitioner'}
                </p>
                {/* Level Badge */}
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent-gold/10 border border-accent-gold/20 shrink-0">
                  <span className="text-[10px] font-bold text-accent-gold uppercase tracking-wider">
                    Lvl
                  </span>
                  <span className="text-sm font-black text-accent-gold">
                    {getLevelInfo(session?.user?.xp || 0).level}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-wider text-accent-blue border border-white/10">
                  Lyricist
                </span>
                {isPro ? (
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-accent-purple/30 to-accent-pink/30 text-[10px] font-bold uppercase tracking-wider text-accent-purple border border-accent-purple/20 flex items-center gap-1">
                    <Crown size={10} fill="currentColor" /> Pro
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-wider text-accent-yellow border border-white/10 flex items-center gap-1">
                    <Zap size={10} fill="currentColor" /> Free
                  </span>
                )}
              </div>

              {/* XP Bar */}
              {session?.user?.xp !== undefined && (
                <div className="mt-3 w-full">
                  {(() => {
                    const levelInfo = getLevelInfo(session.user.xp || 0)
                    return (
                      <>
                        <div className="flex justify-between text-[10px] font-bold text-zinc-400 mb-1">
                          <span>XP</span>
                          <span>
                            {Math.round(levelInfo.currentXP).toLocaleString()} /{' '}
                            {Math.round(levelInfo.maxXP).toLocaleString()}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/10">
                          <div
                            className="h-full bg-gradient-to-r from-accent-blue to-accent-purple rounded-full transition-all duration-500 ease-out"
                            style={{
                              width: `${levelInfo.progress}%`,
                            }}
                          />
                        </div>
                      </>
                    )
                  })()}
                </div>
              )}
            </div>
          </div>
        </Link>
      </div>

      {/* Studio Controls (Collapsible) */}
      <div className="px-4 space-y-2">
        <button
          onClick={() => setIsStudioOpen(!isStudioOpen)}
          className="w-full flex items-center justify-between ml-2 mb-3 group"
        >
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest group-hover:text-white transition-colors">
            Studio Controls
          </h3>
          <div
            className={cn(
              'p-1 rounded-md bg-white/10 text-zinc-400 transition-all',
              isStudioOpen && 'bg-accent-purple/20 text-accent-purple'
            )}
          >
            <ChevronDown
              size={14}
              className={cn(
                'transition-transform duration-300',
                isStudioOpen && 'rotate-180'
              )}
            />
          </div>
        </button>

        <div
          className={cn(
            'overflow-hidden rounded-2xl bg-zinc-900/50 border border-white/10 divide-y divide-white/5 transition-all duration-500 ease-in-out',
            isStudioOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          {/* TTS Toggle */}
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-4">
              <Mic size={20} className="text-accent-orange" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-zinc-200">
                  Voice Prompts
                </span>
                <span className="text-xs text-zinc-500">
                  Spoken word suggestions
                </span>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault()
                const newValue = !isTTSEnabled
                setTTSEnabled(newValue)
                toast.success(
                  newValue
                    ? 'Voice Assistant Enabled'
                    : 'Voice Assistant Disabled'
                )
              }}
              className={cn(
                'w-11 h-6 rounded-full transition-all duration-300 relative focus:outline-none focus:ring-2 focus:ring-accent-orange/50',
                isTTSEnabled ? 'bg-accent-orange' : 'bg-white/10'
              )}
            >
              <div
                className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm',
                  isTTSEnabled ? 'left-6' : 'left-1'
                )}
              />
            </button>
          </div>

          {/* Studio FX Toggle */}
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-4">
              <Zap size={20} className="text-accent-cyan" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-zinc-200">
                  Studio FX
                </span>
                <span className="text-xs text-zinc-500">
                  Reverb and audio enhancements
                </span>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault()
                const newValue = !isStudioFXEnabled
                setStudioFXEnabled(newValue)
                toast.success(
                  newValue ? 'Studio FX Enabled' : 'Studio FX Disabled'
                )
              }}
              className={cn(
                'w-11 h-6 rounded-full transition-all duration-300 relative focus:outline-none focus:ring-2 focus:ring-accent-cyan/50',
                isStudioFXEnabled ? 'bg-accent-cyan' : 'bg-white/10'
              )}
            >
              <div
                className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm',
                  isStudioFXEnabled ? 'left-6' : 'left-1'
                )}
              />
            </button>
          </div>

          {/* Audio Levels (Beat & TTS) */}
          <div
            className={cn(
              'overflow-hidden transition-all duration-300 bg-black/20',
              isStudioOpen || isTTSEnabled
                ? 'max-h-40 opacity-100'
                : 'max-h-0 opacity-0'
            )}
          >
            <div className="px-5 py-4 space-y-4">
              {/* Beat Volume */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Beat Volume</span>
                  <span>{Math.round(beatVolume * 100)}%</span>
                </div>
                <div className="flex items-center gap-4">
                  <Volume2 size={16} className="text-accent-cyan" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={beatVolume}
                    onChange={(e) => {
                      e.preventDefault()
                      setBeatVolume(parseFloat(e.target.value))
                    }}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg hover:[&::-webkit-slider-thumb]:bg-accent-cyan transition-colors"
                  />
                </div>
              </div>

              {/* TTS Volume */}
              {isTTSEnabled && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Voice Volume</span>
                    <span>{Math.round(ttsVolume * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Volume2 size={16} className="text-accent-orange" />
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
                      className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg hover:[&::-webkit-slider-thumb]:bg-accent-orange transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>
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
              className="w-full flex items-center gap-4 px-5 py-3 text-xs font-medium text-accent-purple bg-accent-purple/5 hover:bg-accent-purple/10 transition-colors"
            >
              <Mic size={14} />
              Test Voice Generation (Admin)
            </button>
          )}

          <MenuItem
            icon={Settings}
            label="Audio Calibration"
            href="/settings/latency"
            color="text-accent-blue"
          />

          {isPro && (
            <MenuItem
              icon={Crown}
              label={isManaging ? 'Opening Portal...' : 'Manage Subscription'}
              onClick={handlePortalRedirect}
              color="text-accent-purple"
            />
          )}
        </div>
      </div>

      {/* Support & Legal Grid (Condensed) */}
      <div className="px-4 space-y-2">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-2 mb-3">
          App Support
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {/* Contact Support */}
          <button
            onClick={() => setIsSupportOpen(true)}
            className="col-span-2 flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
          >
            <div className="flex items-center gap-2">
              <Mic size={16} className="text-accent-blue" />
              <span className="text-xs font-bold text-white">
                Contact Support
              </span>
            </div>
          </button>

          {/* Patch Notes */}
          <Link
            href="/patch-notes"
            onClick={handleLinkClick}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
          >
            <FileText size={20} className="text-accent-pink" />
            <span className="text-xs font-medium text-zinc-300">
              Patch Notes
            </span>
          </Link>

          {/* Report Bug */}
          <Link
            href="/feedback"
            onClick={handleLinkClick}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
          >
            <Bug size={20} className="text-accent-red" />
            <span className="text-xs font-medium text-zinc-300">
              Report Bug
            </span>
          </Link>

          {/* Terms */}
          <Link
            href="/legal/terms"
            onClick={handleLinkClick}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
          >
            <Scale size={18} className="text-zinc-500" />
            <span className="text-xs font-medium text-zinc-400">Terms</span>
          </Link>

          {/* Privacy */}
          <Link
            href="/legal/privacy"
            onClick={handleLinkClick}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
          >
            <Shield size={18} className="text-zinc-500" />
            <span className="text-xs font-medium text-zinc-400">Privacy</span>
          </Link>
        </div>
      </div>

      {/* Sign In / Sign Out */}
      <div className="px-4 mt-6">
        {session ? (
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 font-medium hover:bg-red-950/30 hover:text-red-400 hover:border-red-900/50 transition-all active:scale-[0.98]"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        ) : (
          <button
            onClick={() => signIn('google', { callbackUrl: '/profile' })}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white font-medium hover:scale-[1.02] transition-all active:scale-[0.98] shadow-lg shadow-accent-purple/20"
          >
            <LogIn size={18} />
            Sign In
          </button>
        )}
        <p className="text-zinc-600 text-[10px] font-medium tracking-widest uppercase">
          FreeStyla v0.9.73 (Feature Labels)
        </p>
      </div>
      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />
    </div>
  )
}
