import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout'
import { Toaster } from 'react-hot-toast'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { PracticeSessionProvider } from '@/contexts/SessionContext'
import { BottomNav } from '@/components/organisms/layout/BottomNav'
import { BottomNavBackdrop } from '@/components/organisms/layout/BottomNavBackdrop'
import { AudioContextUnlock } from '@/components/atoms/utils/AudioContextUnlock'
import { SafeAreaWrapper } from '@/components/layout/SafeAreaWrapper'
import { GlobalSessionGuard } from '@/components/organisms/practice/GlobalSessionGuard'
import { JsonLd } from '@/components/JsonLd'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Script from 'next/script'

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'https://www.freestyla.app'
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
  maximumScale: 1, // Prevent zoom for app-like feel
  userScalable: false, // Disabling zoom for "Native App" feel (Accessibility trade-off accepted for Game/Tool apps)
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
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
    <html lang="en" className="notranslate" translate="no">
      <head>
        <meta name="google" content="notranslate" />
        {/* Google Tag Manager */}
        <Script
          id="gtm-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KT67Z2C8');`,
          }}
        />
        {/* End Google Tag Manager */}
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-background text-text-primary antialiased min-h-[100dvh]`}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KT67Z2C8"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <SessionProvider session={session}>
          <PracticeSessionProvider>
            <SafeAreaWrapper top={false} bottom={false}>
              <ResponsiveLayout>
                <BottomNavBackdrop />
                <main
                  id="main-content"
                  className="flex-1 min-h-0 w-full relative overflow-y-auto overflow-x-hidden scrollbar-none"
                >
                  <JsonLd />
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
                <Script
                  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
                  strategy="afterInteractive"
                />
                <link
                  rel="preconnect"
                  href="https://www.googletagmanager.com"
                />
                <link
                  rel="dns-prefetch"
                  href="https://www.googletagmanager.com"
                />
                <Script
                  id="ga-init"
                  strategy="afterInteractive"
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
            <GlobalSessionGuard />
          </PracticeSessionProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
