'use client'

import { Home, Mic, Trophy, User, MessageCircle } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import { useHaptics } from '@/hooks/useHaptics'

export function BottomNav() {
  const pathname = usePathname()
  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const { bump } = useHaptics()

  // Only show if authenticated
  if (!isAuthenticated) return null

  // Define tabs
  // Order: Feed, Rankings, PRACTICE (Center), Messages, Profile
  const tabs = [
    {
      name: 'Feed',
      href: '/feed',
      icon: Home,
      match: (path: string) => path === '/feed',
    },
    {
      name: 'Rankings',
      href: '/leaderboard',
      icon: Trophy,
      match: (path: string) => path.startsWith('/leaderboard'),
    },
    {
      name: 'Practice',
      href: '/howitworks',
      icon: Mic,
      match: (path: string) =>
        path === '/practice' || path === '/difficultyselection' || path === '/howitworks',
      isPrimary: true, // Special flag for center button
    },
    {
      name: 'Messages',
      href: '/messages',
      icon: MessageCircle,
      match: (path: string) => path.startsWith('/messages'),
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      match: (path: string) => path.startsWith('/profile') || path.startsWith('/u/'),
    },
  ]

  return (
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
              onClick={bump}
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
                        isActive
                          ? 'text-white'
                          : 'text-zinc-500 hover:text-zinc-300'
                      )
                )}
              >
                <tab.icon
                  size={isPrimary ? 28 : 24}
                  className={cn(
                    'transition-transform duration-300',
                    isActive && !isPrimary ? 'scale-110 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : '',
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
  )
}
