'use client'

import { useEffect, useRef, useState } from 'react'
import { useDevice } from '@/hooks/useDevice'
import { Button } from '@/components/atoms/Button'
import { IconFrame } from '@/components/atoms/IconFrame'
import { Modal } from '@/components/atoms/Modal'
import { AppHeader } from '@/components/organisms/layout/AppHeader'
import { Download, Zap, WifiOff, Smartphone, Laptop } from 'lucide-react'
import Link from 'next/link'
import { trackEvent } from '@/lib/analytics/track'

export default function DownloadPage() {
  const { isAndroid, isIOS, isDesktop } = useDevice()
  const [showIOSInstallGuide, setShowIOSInstallGuide] = useState(false)
  const hasTrackedViewRef = useRef(false)
  const platformTitle = isAndroid
    ? 'Get FreeStyla on Android'
    : isIOS
      ? 'Install FreeStyla on iPhone'
      : 'Practice in your browser'
  const platformDescription = isAndroid
    ? 'Install the Android app from Google Play for the best mobile practice experience.'
    : isIOS
      ? 'FreeStyla installs as a Safari home-screen app. No App Store download is required.'
      : 'Launch the web app instantly on desktop. There is no desktop binary to download.'

  useEffect(() => {
    if (hasTrackedViewRef.current) return
    if (!isAndroid && !isIOS && !isDesktop) return

    hasTrackedViewRef.current = true
    trackEvent('download_page_view', {
      platform: isAndroid ? 'android' : isIOS ? 'ios' : 'desktop',
    })
  }, [isAndroid, isDesktop, isIOS])

  return (
    <main className="flex min-h-screen flex-col bg-black text-white">
      <AppHeader showBackButton={true} backPath="/howitworks" />

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center md:px-8">
        <div className="relative mb-8">
          <div className="absolute -inset-4 rounded-full bg-accent-purple/20 blur-2xl filter" />
          <IconFrame
            icon={Download}
            variant="hero"
            tone="purple"
            decorative
            className="relative"
          />
        </div>

        <h1 className="mb-4 text-4xl font-black uppercase tracking-tighter sm:text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
          {platformTitle}
        </h1>

        <p className="mb-12 max-w-lg text-lg text-text-secondary">
          {platformDescription}
        </p>

        <div className="mb-16 w-full max-w-sm space-y-4">
          {/* Android CTA */}
          {isAndroid && (
            <div className="space-y-4">
              <Link
                href="https://play.google.com/store/apps/details?id=app.freestyla.twa"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackEvent('download_cta_click', {
                    platform: 'android',
                    cta: 'google_play',
                  })
                }
              >
                <Button
                  variant="primary"
                  size="xl"
                  className="w-full bg-gradient-to-r from-[#3DDC84] to-[#3DDC84]/80 text-black font-bold shadow-lg shadow-[#3DDC84]/20 hover:scale-105"
                >
                  <IconFrame
                    icon={Smartphone}
                    variant="inline"
                    tone="zinc"
                    decorative
                    className="text-black"
                  />
                  Get it on Google Play
                </Button>
              </Link>
              <p className="text-xs text-text-tertiary">
                Recommended for your Android device
              </p>
            </div>
          )}

          {/* iOS CTA */}
          {isIOS && (
            <div className="space-y-4">
              <Button
                variant="primary"
                size="xl"
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold shadow-lg shadow-blue-500/20 hover:scale-105"
                onClick={() => {
                  trackEvent('download_cta_click', {
                    platform: 'ios',
                    cta: 'show_install_guide',
                  })
                  setShowIOSInstallGuide(true)
                }}
              >
                <IconFrame
                  icon={Smartphone}
                  variant="inline"
                  tone="white"
                  decorative
                />
                Launch App
              </Button>
              <p className="text-xs text-text-tertiary">
                Install via 'Add to Home Screen'
              </p>
            </div>
          )}

          {/* Desktop/Fallback CTA */}
          {!isAndroid && !isIOS && (
            <div className="space-y-4">
              <Link
                href="/difficultyselection"
                onClick={() =>
                  trackEvent('download_cta_click', {
                    platform: isDesktop ? 'desktop' : 'browser',
                    cta: 'launch_web_app',
                  })
                }
              >
                <Button
                  variant="primary"
                  size="xl"
                  className="w-full bg-white text-black font-bold shadow-lg shadow-purple-500/20 hover:scale-105 hover:bg-white/90"
                >
                  <IconFrame
                    icon={Laptop}
                    variant="inline"
                    tone="zinc"
                    decorative
                    className="text-black"
                  />
                  Launch Web App
                </Button>
              </Link>
              <p className="text-xs text-text-tertiary">
                {isDesktop
                  ? 'Optimized for Chrome & Edge'
                  : 'Launch directly in your browser'}
              </p>
            </div>
          )}
        </div>

        {/* Feature Grid */}
        <div className="grid gap-6 md:grid-cols-3 md:gap-8 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm">
            <IconFrame
              icon={WifiOff}
              variant="feature"
              tone="blue"
              decorative
              className="mx-auto mb-4"
            />
            <h3 className="mb-2 font-bold text-lg">Offline Mode</h3>
            <p className="text-sm text-text-secondary">
              Practice anywhere, even without an internet connection.
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm">
            <IconFrame
              icon={Zap}
              variant="feature"
              tone="gold"
              decorative
              className="mx-auto mb-4"
            />
            <h3 className="mb-2 font-bold text-lg">Zero Latency</h3>
            <p className="text-sm text-text-secondary">
              Optimized performance for perfect beat synchronization.
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm">
            <IconFrame
              icon={Smartphone}
              variant="feature"
              tone="green"
              decorative
              className="mx-auto mb-4"
            />
            <h3 className="mb-2 font-bold text-lg">Native Feel</h3>
            <p className="text-sm text-text-secondary">
              Full-screen immersion with focused practice tools.
            </p>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showIOSInstallGuide}
        onClose={() => setShowIOSInstallGuide(false)}
        title="Install on iPhone"
      >
        <div className="space-y-4 text-left">
          <p className="text-text-secondary">
            FreeStyla installs through Safari&apos;s share sheet.
          </p>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-text-secondary">
            <li>Tap the Share button in Safari.</li>
            <li>
              Select <span className="text-white">Add to Home Screen</span>.
            </li>
            <li>Confirm the install to launch FreeStyla like an app.</li>
          </ol>
          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={() => setShowIOSInstallGuide(false)}
            >
              Got it
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  )
}
