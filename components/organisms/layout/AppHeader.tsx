'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft } from 'lucide-react'
import { Container } from '@/components/atoms/Container'
import { SettingsDropdown } from '@/components/organisms/settings/SettingsDropdown'

interface AppHeaderProps {
  showBackButton?: boolean
  showSettings?: boolean
  showTitle?: boolean
  onBack?: () => void
  hide?: boolean
}

export function AppHeader({
  showBackButton = false,
  showSettings = true,
  showTitle = true,
  onBack,
  hide = false,
}: AppHeaderProps) {
  const router = useRouter()
  const { status } = useSession()
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
        <div className="relative flex h-16 items-center justify-center">
          {/* Back button - top left */}
          {showBackButton && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-2 sm:pl-4">
              <button
                type="button"
                onClick={handleBack}
                className="mb-0 flex items-center gap-2 text-text-secondary transition-colors hover:text-text-primary"
                aria-label="Go back"
              >
                <ArrowLeft size={18} />
                <span className="hidden text-sm sm:inline">Back</span>
              </button>
            </div>
          )}

          {/* Account section - top right */}
          {showSettings && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-4 gap-2">
              <SettingsDropdown />
            </div>
          )}

          {/* Centered FlowForge title - navigates to howitworks when logged in */}
          {showTitle && (
            <Link
              href={homeLink}
              className="flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-full px-3 py-1"
              aria-label="Go to Freestyla home"
            >
              <div className="relative h-8 w-8">
                <img
                  src="/logo.png"
                  alt="Freestyla Logo"
                  className="object-contain w-full h-full drop-shadow-[0_0_15px_rgba(125,122,255,0.5)]"
                />
              </div>
              <h1 className="text-base sm:text-lg font-semibold tracking-[0.35em] uppercase text-text-secondary text-center">
                <span className="text-text-primary">Free</span>
                <span className="text-accent-purple">Styla</span>
              </h1>
            </Link>
          )}
        </div>
      </Container>
    </header>
  )
}
