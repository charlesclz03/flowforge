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
  // "Practice" is effectively Home/Create for this app.
  const tabs = [
    {
      name: 'Feed',
      href: '/feed',
      icon: Home,
      match: (path: string) => path === '/feed',
    },
    {
      name: 'Practice',
      href: '/practice',
      icon: Mic,
      match: (path: string) => path === '/practice' || path === '/difficultyselection',
    },
    {
      name: 'Rankings',
      href: '/leaderboard',
      icon: Trophy,
      match: (path: string) => path.startsWith('/leaderboard'),
    },
    {
      name: 'Messages',
      href: '/messages',
      icon: MessageCircle,
      match: (path: string) => path.startsWith('/messages'),
    },
    {
      name: 'Profile',
      href: '/profile', // Profile redirects or handled by middleware? App usually has /u/[me] or similar.
      // Assuming /profile exists or redirects.
      icon: User,
      match: (path: string) => path.startsWith('/profile') || path.startsWith('/u/'),
    },
  ]

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 safe-bottom">
      <div className="flex items-center gap-1 p-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl">
        {tabs.map((tab) => {
          const isActive = tab.match ? tab.match(pathname) : pathname === tab.href

          return (
            <Link
              key={tab.name}
              href={tab.href}
              onClick={bump}
              aria-label={tab.name}
              className={cn(
                'relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300',
                isActive
                  ? 'bg-accent-purple text-white shadow-purple-glow'
                  : 'text-text-secondary hover:text-white hover:bg-white/5'
              )}
            >
              <tab.icon
                size={24}
                className={cn(
                  'transition-transform duration-300',
                  isActive ? 'scale-110' : 'scale-100'
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
