'use client'

import { useState } from 'react'
import { Disc3, Trophy, User, CassetteTape } from 'lucide-react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useSession, signIn } from 'next-auth/react'
import { useHaptics } from '@/hooks/useHaptics'
import { usePracticeSession } from '@/contexts/SessionContext'
import {
  buildAuthContinuePath,
  buildCompleteProfilePath,
  isProfileSetupComplete,
} from '@/lib/auth/paths'

export function BottomNav() {
  const pathname = usePathname()
  const isPracticeRoute = pathname === '/practice'
  const isPublicEntryRoute =
    pathname === '/' ||
    pathname === '/pricing' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/complete-profile' ||
    pathname === '/auth/continue'
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const { bump } = useHaptics()
  const [loginPrompt, setLoginPrompt] = useState<{
    name: string
    href: string
  } | null>(null)
  // Navigation guard logic is now handled by SessionContext via attemptNavigation

  // Use the session context to check if a session is currently active
  const { isActive, attemptNavigation } = usePracticeSession()

  // Define tabs
  // Order: Beats (Home), Rankings, PRACTICE (Center), Recordings, Profile
  const tabs = [
    {
      name: 'Beats',
      label: 'Beats',
      href: '/tracks',
      icon: Disc3,
      match: (path: string) => path === '/tracks',
    },
    {
      name: 'Trophy',
      label: 'Trophy',
      href: '/achievements',
      icon: Trophy,
      match: (path: string) =>
        path.startsWith('/achievements') || path.startsWith('/leaderboard'),
    },
    {
      name: 'Record',
      label: 'Record',
      href: '/difficultyselection',
      icon: null, // Custom logo used instead
      match: (path: string) =>
        path === '/practice' ||
        path === '/difficultyselection' ||
        path === '/howitworks',
      isPrimary: true,
    },
    {
      name: 'Recordings',
      label: 'Recents',
      href: '/recordings',
      icon: CassetteTape,
      match: (path: string) => path.startsWith('/recordings'),
      requiresAuth: true,
    },
    {
      name: 'Profile',
      label: 'Profile',
      // If we have a username, go direct. Otherwise fallback to the redirector.
      href:
        isAuthenticated && !isProfileSetupComplete(session?.user)
          ? buildCompleteProfilePath('/profile')
          : isAuthenticated && session?.user?.username
            ? `/u/${session.user.username}`
            : '/profile',
      icon: User,
      match: (path: string) =>
        path.startsWith('/profile') || path.startsWith('/u/'),
      requiresAuth: true,
    },
  ]

  const handleTabClick = (e: React.MouseEvent, tab: (typeof tabs)[0]) => {
    bump()

    const isCurrentTab = tab.match ? tab.match(pathname) : pathname === tab.href
    if (isCurrentTab) {
      e.preventDefault()
      return
    }

    // 1. Check for Active Session Interruption
    // Use centralized navigation guard
    if (isActive) {
      e.preventDefault()
      attemptNavigation(tab.href)
      return
    }

    // 2. Check Authentication
    if (tab.requiresAuth && !isAuthenticated) {
      e.preventDefault()
      setLoginPrompt({ name: tab.name, href: tab.href })
      return
    }

    // Default navigation handled by Link
  }

  // confirmExit Logic moved to SessionContext/GlobalSessionGuard

  if (isPublicEntryRoute) {
    return null
  }

  return (
    <>
      <nav
        className={cn(
          'w-full flex flex-none justify-center pt-2 bg-transparent pointer-events-auto px-4 z-50',
          isPracticeRoute && '-translate-y-px'
        )}
        style={{
          paddingBottom:
            'calc(var(--app-safe-bottom) + var(--app-bottom-nav-offset))',
        }}
      >
        {/* iOS-style Glass Dock */}
        <div className="relative grid h-[var(--app-bottom-nav-height)] w-full max-w-[400px] grid-cols-5 items-center rounded-[2.5rem] border border-white/10 bg-[#0A0A0A]/80 px-2 shadow-surface-2 ring-1 ring-white/5 backdrop-blur-3xl">
          {tabs.map((tab) => {
            const isActive = tab.match
              ? tab.match(pathname)
              : pathname === tab.href
            const isPrimary = 'isPrimary' in tab ? tab.isPrimary : false

            return (
              <Link
                key={tab.name}
                href={tab.href}
                onClick={(e) => handleTabClick(e, tab)}
                aria-label={tab.name}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'group relative flex h-full min-w-0 flex-col items-center justify-center gap-0.5 rounded-3xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple/80'
                )}
              >
                {/* Spotlight Effect for Active Tab */}
                {isActive && (
                  <>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-12 bg-accent-purple/20 blur-xl rounded-full pointer-events-none" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-accent-purple rounded-b-full shadow-purple-glow" />
                  </>
                )}

                {/* Icon Container */}
                <div
                  className={cn(
                    'relative flex items-center justify-center transition-all duration-300',
                    isPrimary
                      ? cn(
                          'w-14 h-14 rounded-full border-2',
                          isActive
                            ? 'border-accent-purple bg-accent-purple/10 shadow-purple-glow'
                            : 'border-white/10 bg-white/[0.03] opacity-80 group-hover:border-white/20 group-hover:opacity-100'
                        )
                      : cn(
                          'h-11 w-11 rounded-full sm:h-12 sm:w-12',
                          isActive
                            ? 'text-white'
                            : 'text-zinc-500 hover:text-zinc-300'
                        )
                  )}
                >
                  {isPrimary ? (
                    <div className="relative w-8 h-8">
                      <Image
                        src="/logo.png"
                        alt="Logo"
                        fill
                        priority
                        sizes="32px"
                        className={cn(
                          'object-contain transition-transform duration-300',
                          isActive ? 'scale-110' : 'group-hover:scale-110'
                        )}
                      />
                    </div>
                  ) : (
                    tab.icon && (
                      <tab.icon
                        size={24}
                        className={cn(
                          'transition-transform duration-300',
                          isActive
                            ? 'scale-110 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]'
                            : 'group-hover:scale-110'
                        )}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                    )
                  )}
                </div>
                <span
                  className={cn(
                    'max-w-full truncate px-1 text-[9px] font-semibold uppercase leading-none tracking-wide transition-colors sm:text-[10px]',
                    isActive ? 'text-white' : 'text-text-tertiary'
                  )}
                >
                  {tab.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Login Prompt Modal */}
      {loginPrompt && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setLoginPrompt(null)}
        >
          <div
            className="bg-background-elevated border border-white/10 rounded-2xl p-6 max-w-sm mx-4 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-white text-center">
              Sign in to open {loginPrompt.name}
            </h2>
            <p className="text-text-secondary text-center text-sm">
              Create an account to save your sessions, track progress, and
              unlock all features.
            </p>
            <button
              type="button"
              onClick={() =>
                signIn('google', {
                  callbackUrl: buildAuthContinuePath(loginPrompt.href),
                })
              }
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
              type="button"
              onClick={() => setLoginPrompt(null)}
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
