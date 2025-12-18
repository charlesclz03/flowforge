'use client'

import { Fragment, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import {
  Settings,
  Shield,
  Smartphone,
  Volume2,
  Mic,
  FileText,
  Bug,
  Snowflake,
  User,
  Scale,
  LogOut,
} from 'lucide-react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePracticeSession } from '@/contexts/SessionContext'
import { cn } from '@/lib/utils'

export function SettingsDropdown() {
  const { data: session } = useSession()
  const [visualizer, setVisualizer] = useState<'ring' | 'wave'>('ring')
  const { isTTSEnabled, setTTSEnabled, ttsVolume, setTTSVolume, safeMode, setSafeMode } =
    usePracticeSession()

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="p-2 text-text-secondary hover:text-white transition-colors rounded-full hover:bg-white/5">
          <Settings size={20} />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-72 origin-top-right divide-y divide-white/10 rounded-xl bg-background-elevated border border-white/10 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden">
          {/* User Header (Bible 5.1) */}
          <div className="px-4 py-4 bg-white/5 border-b border-white/10">
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
                  <div className="flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 border border-blue-500/20">
                    <Snowflake size={10} className="text-blue-400" />
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">
                      Streak Freeze
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Controls */}
          <div className="py-1">
            {/* Safe Mode */}
            <Menu.Item>
              {({ active }) => (
                <div
                  className={cn(
                    'flex items-center justify-between px-4 py-3 transition-colors cursor-pointer',
                    active ? 'bg-white/5' : ''
                  )}
                  onClick={() => setSafeMode(!safeMode)}
                >
                  <div className="flex items-center gap-3 text-sm text-white">
                    <Shield size={16} className="text-accent-blue" />
                    <span>Safe Mode</span>
                  </div>
                  <div
                    className={cn(
                      'w-9 h-5 rounded-full transition-colors relative',
                      safeMode ? 'bg-accent-blue' : 'bg-white/20'
                    )}
                  >
                    <div
                      className={cn(
                        'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm',
                        safeMode ? 'left-4.5' : 'left-0.5'
                      )}
                    />
                  </div>
                </div>
              )}
            </Menu.Item>

            {/* Visualizer Style */}
            <Menu.Item>
              {({ active }) => (
                <div
                  className={cn(
                    'flex items-center justify-between px-4 py-3 transition-colors',
                    active ? 'bg-white/5' : ''
                  )}
                >
                  <div className="flex items-center gap-3 text-sm text-white">
                    <Smartphone size={16} className="text-accent-purple" />
                    <span>Visualizer</span>
                  </div>
                  <div className="flex bg-black/20 rounded-lg p-0.5">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        setVisualizer('ring')
                      }}
                      className={cn(
                        'px-2 py-1 text-[10px] font-medium rounded-md transition-all',
                        visualizer === 'ring'
                          ? 'bg-background-elevated text-white shadow-sm'
                          : 'text-text-secondary hover:text-white'
                      )}
                    >
                      Ring
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        setVisualizer('wave')
                      }}
                      className={cn(
                        'px-2 py-1 text-[10px] font-medium rounded-md transition-all',
                        visualizer === 'wave'
                          ? 'bg-background-elevated text-white shadow-sm'
                          : 'text-text-secondary hover:text-white'
                      )}
                    >
                      Wave
                    </button>
                  </div>
                </div>
              )}
            </Menu.Item>

            {/* TTS Toggle */}
            <Menu.Item>
              {({ active }) => (
                <div
                  className={cn(
                    'flex items-center justify-between px-4 py-3 transition-colors cursor-pointer',
                    active ? 'bg-white/5' : ''
                  )}
                >
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
              )}
            </Menu.Item>

            {/* Volume Slider - Inline or separate? Separate looks cleaner */}
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
                    onClick={(e) => e.stopPropagation()}
                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white hover:[&::-webkit-slider-thumb]:bg-accent-orange transition-colors"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Links Section */}
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/settings/latency"
                  className={cn(
                    'flex w-full items-center px-4 py-2.5 text-sm text-text-primary transition-colors',
                    active ? 'bg-white/5' : ''
                  )}
                >
                  <Settings size={16} className="mr-3 text-text-secondary" />
                  Calibrate
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/patch-notes"
                  className={cn(
                    'flex w-full items-center px-4 py-2.5 text-sm text-text-primary transition-colors',
                    active ? 'bg-white/5' : ''
                  )}
                >
                  <FileText size={16} className="mr-3 text-text-secondary" />
                  Patch Notes
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/legal/terms"
                  className={cn(
                    'flex w-full items-center px-4 py-2.5 text-sm text-text-primary transition-colors',
                    active ? 'bg-white/5' : ''
                  )}
                >
                  <Scale size={16} className="mr-3 text-text-secondary" />
                  Terms of Service
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/legal/privacy"
                  className={cn(
                    'flex w-full items-center px-4 py-2.5 text-sm text-text-primary transition-colors',
                    active ? 'bg-white/5' : ''
                  )}
                >
                  <Shield size={16} className="mr-3 text-text-secondary" />
                  Privacy Policy
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <a
                  href="mailto:support@flowforge.com"
                  className={cn(
                    'flex w-full items-center px-4 py-2.5 text-sm text-text-primary transition-colors',
                    active ? 'bg-white/5' : ''
                  )}
                >
                  <Bug size={16} className="mr-3 text-text-secondary" />
                  Report Bug
                </a>
              )}
            </Menu.Item>

            <div className="my-1 border-t border-white/5" />

            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className={cn(
                    'flex w-full items-center px-4 py-2.5 text-sm text-text-primary transition-colors',
                    active ? 'bg-white/5' : ''
                  )}
                >
                  <LogOut size={16} className="mr-3 text-text-secondary" />
                  Sign Out
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
