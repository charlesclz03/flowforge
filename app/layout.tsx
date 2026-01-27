import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout'
import { Toaster } from 'react-hot-toast'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { PracticeSessionProvider } from '@/contexts/SessionContext'
import { BottomNav } from '@/components/organisms/layout/BottomNav'
import { AudioContextUnlock } from '@/components/atoms/utils/AudioContextUnlock'
import { SafeAreaWrapper } from '@/components/layout/SafeAreaWrapper'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'https://freestyla.app'
  ),
  title: {
    default: 'FreeStyla: Freestyle Rap Coach',
    template: '%s | FreeStyla',
  },
  description:
    'The #1 Freestyle Rap Coach. Dominate the cypher with instant beat sync and a smart Rhyme Engine. Practice offline, track XP, and secure your legacy.',
  keywords: [
    'Freestyle Rap Coach',
    'Freestyle Practice',
    'Rhyme Engine',
    'Rap Beats & Flow',
    'Drill Beats',
    'Trap Flow',
    'Offline Rap App',
    'freestyle rap',
    'rap practice',
  ],
  authors: [{ name: 'FreeStyla Team' }],
  creator: 'FreeStyla',
  publisher: 'FreeStyla',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'FreeStyla',
    title: 'Ready to spit bars? Start your session now with FreeStyla.',
    description:
      'The #1 Freestyle Rap Coach. Dominate the cypher with instant beat sync and a smart Rhyme Engine.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FreeStyla - Freestyle Rap Coach',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FreeStyla: Freestyle Rap Coach',
    description:
      'The #1 Freestyle Rap Coach. Dominate the cypher with instant beat sync and a smart Rhyme Engine.',
    images: ['/og-image.png'],
    creator: '@freestyla',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: './',
  },
  category: 'music',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#000000' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

import { Inter, JetBrains_Mono } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
})

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-background text-text-primary antialiased min-h-[100dvh]`}
      >
        <SessionProvider session={session}>
          <PracticeSessionProvider>
            <SafeAreaWrapper>
              <ResponsiveLayout>
                <main
                  id="main-content"
                  className="flex-1 w-full relative overflow-y-auto overflow-x-hidden scrollbar-none"
                >
                  {children}
                </main>
                <div className="flex-none w-full relative z-50 pointer-events-none">
                  <div className="pointer-events-auto">
                    <BottomNav />
                  </div>
                </div>
              </ResponsiveLayout>
            </SafeAreaWrapper>
            {process.env.NEXT_PUBLIC_GA_ID ? (
              <>
                <script
                  async
                  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
                />
                <link
                  rel="preconnect"
                  href="https://www.googletagmanager.com"
                />
                <link
                  rel="dns-prefetch"
                  href="https://www.googletagmanager.com"
                />
                <script
                  dangerouslySetInnerHTML={{
                    __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);} gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `,
                  }}
                />
              </>
            ) : null}
            <AudioContextUnlock />
            <Toaster position="bottom-center" />
          </PracticeSessionProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
