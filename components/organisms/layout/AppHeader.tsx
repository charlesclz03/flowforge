'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Crown, Flame, HelpCircle } from 'lucide-react'
import { Container } from '@/components/atoms/Container'
import { SettingsDropdown } from '@/components/organisms/settings/SettingsDropdown'
import { DailyStreakWidget } from '@/components/molecules/gamification/DailyStreakWidget'
import { ProtectedLink } from '@/components/atoms/ProtectedLink'
import { IconFrame } from '@/components/atoms/IconFrame'
import { usePracticeSession } from '@/contexts/SessionContext'
import { isProUser } from '@/lib/subscription/isPro'
import { cn } from '@/lib/utils'

// Interface for the global app header
interface AppHeaderProps {
  showBackButton?: boolean
  showSettings?: boolean
  showTitle?: boolean
  onBack?: () => void
  customTitle?: string
  customSubtitle?: string
  hide?: boolean
  backPath?: string
  action?: React.ReactNode // [SHARE] Optional right-side action
}

export function AppHeader({
  showBackButton = false,
  showSettings = true,
  showTitle = true,
  customTitle,
  customSubtitle,
  onBack,
  hide = false,
  backPath,
  action,
}: AppHeaderProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const isPro = isProUser(session?.user)
  const showTierCta = status !== 'loading'
  const tierLabel = session?.user?.role === 'SUPERADMIN' ? 'Admin' : 'Pro'

  // Link to howitworks for logged-in users, landing for guests
  const homeLink = isAuthenticated ? '/howitworks' : '/'
  const { attemptNavigation } = usePracticeSession()

  const handleBack = () => {
    attemptNavigation(() => {
      if (onBack) {
        onBack()
      } else if (backPath) {
        router.push(backPath)
      } else {
        router.back()
      }
    })
  }

  if (hide) return null

  return (
    <header className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-xl border-b border-stroke-subtle/40 safe-top">
      <Container size="full">
        <div className="grid grid-cols-[1fr_auto_1fr] h-14 sm:h-20 items-center justify-center">
          {/* Left Zone: Back Button + Help Button */}
          <div className="flex items-center justify-start pl-2 sm:pl-4 gap-2">
            {showBackButton && (
              <button
                type="button"
                onClick={handleBack}
                className="mb-0 flex items-center gap-2 text-text-secondary transition-colors hover:text-text-primary min-h-[44px] min-w-[44px] justify-center"
                aria-label="Go back"
              >
                <ArrowLeft size={18} className="sm:w-6 sm:h-6" />
                <span className="hidden text-sm sm:inline">Back</span>
              </button>
            )}
            {/* Help Button - Now on the left */}
            {!action && showSettings && (
              <ProtectedLink
                href="/howitworks"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl transition-all active:scale-95 hover:brightness-125"
                aria-label="How it works"
              >
                <IconFrame
                  icon={HelpCircle}
                  variant="action"
                  tone="purple"
                  decorative
                  strokeWidth={2.5}
                />
              </ProtectedLink>
            )}
          </div>

          {/* Centered Title - navigates to howitworks when logged in */}
          {/* Grid centering automatically handles spacing without magic numbers */}
          {showTitle && (
            <div className="flex flex-col items-center justify-center pt-1 min-w-0">
              <ProtectedLink
                href={homeLink}
                className="flex items-center justify-center gap-2 rounded-full px-3 py-1 max-w-full"
                aria-label="Go to FreeStyla home"
              >
                {!customTitle && (
                  <div className="relative h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
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
              </ProtectedLink>
              {customSubtitle && (
                <p className="block text-[8px] sm:text-[10px] sm:text-xs text-text-tertiary font-medium tracking-wide -mt-0.5 truncate max-w-full px-2">
                  {customSubtitle}
                </p>
              )}
            </div>
          )}

          {/* Account section - top right */}
          <div className="flex items-center justify-end pr-2 sm:pr-4 gap-2 sm:gap-3">
            {(showSettings || action) && (
              <>
                {action ? (
                  action
                ) : (
                  <>
                    {/* Streak Counter */}
                    {isAuthenticated &&
                      (session?.user?.currentStreak || 0) > 0 && (
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
                    {showTierCta && (
                      <ProtectedLink
                        href={isPro ? '/profile' : '/pricing'}
                        aria-label={
                          isPro
                            ? `Current tier: ${tierLabel}. Open account.`
                            : 'Get Pro pricing'
                        }
                        className={cn(
                          'inline-flex h-10 min-w-[72px] items-center justify-center gap-1.5 rounded-full border px-3 text-[11px] font-bold uppercase tracking-wide transition-all active:scale-95 sm:h-11 sm:min-w-[88px] sm:px-4 sm:text-xs',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                          isPro
                            ? 'border-accent-gold/30 bg-accent-gold/10 text-accent-gold hover:bg-accent-gold/15'
                            : 'border-accent-purple/40 bg-accent-purple text-white shadow-[0_0_18px_rgba(125,122,255,0.25)] hover:bg-accent-purple/90 hover:shadow-[0_0_24px_rgba(125,122,255,0.35)]'
                        )}
                      >
                        <IconFrame
                          icon={Crown}
                          variant="inline"
                          tone={isPro ? 'gold' : 'white'}
                          decorative
                        />
                        <span>{isPro ? tierLabel : 'Get Pro'}</span>
                      </ProtectedLink>
                    )}
                    <SettingsDropdown />
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </Container>
    </header>
  )
}
