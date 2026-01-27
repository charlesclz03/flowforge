'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Flame, HelpCircle } from 'lucide-react'
import { Container } from '@/components/atoms/Container'
import { SettingsDropdown } from '@/components/organisms/settings/SettingsDropdown'
import { DailyStreakWidget } from '@/components/molecules/gamification/DailyStreakWidget'

// Interface for the global app header
interface AppHeaderProps {
  showBackButton?: boolean
  showSettings?: boolean
  showTitle?: boolean
  onBack?: () => void
  customTitle?: string
  customSubtitle?: string
  hide?: boolean
}

export function AppHeader({
  showBackButton = false,
  showSettings = true,
  showTitle = true,
  customTitle,
  customSubtitle,
  onBack,
  hide = false,
}: AppHeaderProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'

  // Link to howitworks for logged-in users, landing for guests
  const homeLink = isAuthenticated ? '/howitworks' : '/'

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  if (hide) return null

  return (
    <header className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-xl border-b border-stroke-subtle/40 safe-top">
      <Container size="full">
        <div className="relative flex h-14 sm:h-20 items-center justify-center">
          {/* Back button - top left */}
          {showBackButton && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-2 sm:pl-4">
              <button
                type="button"
                onClick={handleBack}
                className="mb-0 flex items-center gap-2 text-text-secondary transition-colors hover:text-text-primary min-h-[44px] min-w-[44px] justify-center"
                aria-label="Go back"
              >
                <ArrowLeft size={18} className="sm:w-6 sm:h-6" />
                <span className="hidden text-sm sm:inline">Back</span>
              </button>
            </div>
          )}

          {/* Account section - top right */}
          {showSettings && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-4 gap-2 sm:gap-3">
              {/* Help Button - Redirects to How It Works */}
              <Link
                href="/howitworks"
                className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-accent-purple/30 bg-accent-purple/10 text-accent-purple hover:bg-accent-purple/20 transition-all active:scale-95"
                aria-label="How it works"
              >
                <HelpCircle
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  strokeWidth={2.5}
                />
              </Link>

              {/* Streak Counter */}
              {isAuthenticated && (session?.user?.currentStreak || 0) > 0 && (
                <div className="group relative">
                  <div className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 bg-accent-orange/10 rounded-full border border-accent-orange/20 cursor-help">
                    <Flame className="w-3 h-3 sm:w-4 sm:h-4 text-accent-orange fill-accent-orange animate-pulse" />
                    <span className="text-[10px] sm:text-sm font-bold text-accent-orange tabular-nums">
                      {session?.user?.currentStreak}
                    </span>
                  </div>

                  {/* Hover Widget */}
                  <div className="absolute top-full right-0 mt-4 w-72 z-50 invisible opacity-0 translate-y-2 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out">
                    <DailyStreakWidget
                      currentStreak={session?.user?.currentStreak || 0}
                      hasPracticedToday={false}
                    />
                  </div>
                </div>
              )}
              <SettingsDropdown />
            </div>
          )}

          {/* Centered Title - navigates to howitworks when logged in */}
          {/* max-width constraint prevents title from overlapping with absolutely positioned controls */}
          {showTitle && (
            <div className="flex flex-col items-center justify-center pt-1 max-w-[calc(100%-200px)] sm:max-w-[calc(100%-340px)]">
              <Link
                href={homeLink}
                className="flex items-center justify-center gap-2 rounded-full px-3 py-1"
                aria-label="Go to FreeStyla home"
              >
                {!customTitle && (
                  <div className="relative h-6 w-6 sm:h-8 sm:w-8">
                    <Image
                      src="/logo.png"
                      alt="FreeStyla Logo"
                      width={32}
                      height={32}
                      priority
                      className="object-contain drop-shadow-[0_0_15px_rgba(125,122,255,0.5)]"
                    />
                  </div>
                )}
                <h1 className="text-xs sm:text-base md:text-lg font-semibold tracking-[0.2em] sm:tracking-[0.35em] uppercase text-text-secondary text-center whitespace-nowrap overflow-hidden text-ellipsis px-1">
                  {customTitle ? (
                    <span className="text-text-primary">{customTitle}</span>
                  ) : (
                    <>
                      <span className="text-text-primary">Free</span>
                      <span className="text-accent-purple">Styla</span>
                    </>
                  )}
                </h1>
              </Link>
              {customSubtitle && (
                <p className="block text-[8px] sm:text-[10px] sm:text-xs text-text-tertiary font-medium tracking-wide -mt-0.5">
                  {customSubtitle}
                </p>
              )}
            </div>
          )}
        </div>
      </Container>
    </header>
  )
}
