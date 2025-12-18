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
      href: '/practice',
      icon: Mic,
      match: (path: string) => path === '/practice' || path === '/difficultyselection',
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
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 safe-bottom">
      {/* iOS-style Glass Dock */}
      <div className="flex items-end gap-2 p-2 rounded-[2rem] bg-black/40 backdrop-blur-3xl border border-white/10 shadow-2xl shadow-black/50 ring-1 ring-white/5">
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
                'relative flex items-center justify-center rounded-full transition-all duration-300 group',
                isPrimary
                  ? cn(
                      'w-16 h-16 mb-2 -mt-4 shadow-xl',
                      isActive
                        ? 'bg-accent-purple text-white shadow-purple-glow'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    )
                  : cn(
                      'w-12 h-12',
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-text-secondary hover:text-white hover:bg-white/5'
                    )
              )}
            >
              <tab.icon
                size={isPrimary ? 28 : 22}
                className={cn(
                  'transition-transform duration-300',
                  isActive ? 'scale-110' : 'scale-100 group-hover:scale-110'
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              {/* Active Indicator Dot (for non-primary) */}
              {!isPrimary && isActive && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-accent-purple" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
