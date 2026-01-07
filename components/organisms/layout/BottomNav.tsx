'use client'

import { useState } from 'react'
import { Disc3, Mic, Trophy, User, CassetteTape } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useSession, signIn } from 'next-auth/react'
import { useHaptics } from '@/hooks/useHaptics'

export function BottomNav() {
  const pathname = usePathname()
  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const { bump } = useHaptics()
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  // Define tabs
  // Order: Vinyl (Home), Rankings, PRACTICE (Center), Recordings, Profile
  const tabs = [
    {
      name: 'Vinyl',
      href: '/tracks',
      icon: Disc3,
      match: (path: string) => path === '/tracks',
    },
    {
      name: 'Trophy',
      href: '/achievements',
      icon: Trophy,
      match: (path: string) => path.startsWith('/achievements') || path.startsWith('/leaderboard'),
    },
    {
      name: 'Record',
      href: '/difficultyselection',
      icon: Mic,
      match: (path: string) =>
        path === '/practice' || path === '/difficultyselection' || path === '/howitworks',
      isPrimary: true,
    },
    {
      name: 'Recordings',
      href: '/recordings',
      icon: CassetteTape,
      match: (path: string) => path.startsWith('/recordings'),
      requiresAuth: true,
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      match: (path: string) => path.startsWith('/profile') || path.startsWith('/u/'),
      requiresAuth: true,
    },
  ]

  const handleTabClick = (e: React.MouseEvent, tab: (typeof tabs)[0]) => {
    bump()

    // Check if this tab requires auth and user is not authenticated
    if (tab.requiresAuth && !isAuthenticated) {
      e.preventDefault()
      setShowLoginPrompt(true)
      return
    }

    // Default navigation handled by Link
  }

  return (
    <>
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 safe-bottom w-full max-w-[400px] px-4">
        {/* iOS-style Glass Dock */}
        <div className="relative grid grid-cols-5 items-center h-20 px-2 rounded-[2.5rem] bg-[#0A0A0A]/80 backdrop-blur-3xl border border-white/5 shadow-2xl shadow-black/80 ring-1 ring-white/5">
          {tabs.map((tab) => {
            const isActive = tab.match ? tab.match(pathname) : pathname === tab.href
            const isPrimary = 'isPrimary' in tab ? tab.isPrimary : false

            return (
              <Link
                key={tab.name}
                href={tab.href}
                onClick={(e) => handleTabClick(e, tab)}
                aria-label={tab.name}
                className={cn(
                  'relative flex flex-col items-center justify-center transition-all duration-300 group',
                  isPrimary ? '-mt-8' : 'h-full'
                )}
              >
                {/* Spotlight Effect for Non-Primary */}
                {!isPrimary && isActive && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-12 bg-accent-purple/30 blur-xl rounded-full pointer-events-none" />
                )}
                {!isPrimary && isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-accent-purple rounded-b-full shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                )}

                {/* Icon Container */}
                <div
                  className={cn(
                    'relative flex items-center justify-center transition-all duration-300',
                    isPrimary
                      ? cn(
                          'w-16 h-16 rounded-full shadow-2xl shadow-purple-900/50',
                          isActive
                            ? 'bg-accent-purple text-white scale-110'
                            : 'bg-accent-purple text-white/90 hover:scale-105'
                        )
                      : cn(
                          'w-12 h-12 rounded-full',
                          isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                        )
                  )}
                >
                  <tab.icon
                    size={isPrimary ? 28 : 24}
                    className={cn(
                      'transition-transform duration-300',
                      isActive && !isPrimary
                        ? 'scale-110 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]'
                        : '',
                      !isActive && !isPrimary ? 'group-hover:scale-110' : ''
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setShowLoginPrompt(false)}
        >
          <div
            className="bg-background-elevated border border-white/10 rounded-2xl p-6 max-w-sm mx-4 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-white text-center">
              Sign in to access your profile
            </h2>
            <p className="text-text-secondary text-center text-sm">
              Create an account to save your sessions, track progress, and unlock all features.
            </p>
            <button
              onClick={() => signIn('google', { callbackUrl: '/difficultyselection' })}
              className="w-full py-3 px-4 bg-white text-black font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="w-full py-2 text-text-secondary text-sm hover:text-white transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
    </>
  )
}
