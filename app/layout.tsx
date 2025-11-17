import type { Metadata, Viewport } from 'next'
import './globals.css'
import { SessionProvider } from '@/components/auth/SessionProvider'
import { PracticeSessionProvider } from '@/contexts/SessionContext'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'FlowForge - AI-Powered Freestyle Rap Practice',
    template: '%s | FlowForge',
  },
  description:
    'Your AI-powered freestyle rap practice partner. Master your flow, sharpen your skills, and unleash your creativity anytime, anywhere.',
  keywords: [
    'freestyle rap',
    'rap practice',
    'hip hop practice',
    'beats',
    'freestyle beats',
    'AI music',
    'rap generator',
    'freestyle partner',
    'rap training',
    'music practice',
  ],
  authors: [{ name: 'FlowForge Team' }],
  creator: 'FlowForge',
  publisher: 'FlowForge',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'FlowForge',
    title: 'FlowForge - AI-Powered Freestyle Rap Practice',
    description:
      'Your AI-powered freestyle rap practice partner. Master your flow, sharpen your skills, and unleash your creativity.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FlowForge - AI-Powered Freestyle Rap Practice',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FlowForge - AI-Powered Freestyle Rap Practice',
    description:
      'Your AI-powered freestyle rap practice partner. Master your flow, sharpen your skills, and unleash your creativity.',
    images: ['/og-image.png'],
    creator: '@flowforge',
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
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
  },
  category: 'music',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#000000' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="bg-background text-text-primary antialiased">
        <SessionProvider>
          <PracticeSessionProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-accent-orange text-black px-4 py-2 rounded"
            >
              Skip to main content
            </a>
            {children}
            {process.env.NEXT_PUBLIC_GA_ID ? (
              <>
                <script
                  async
                  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
                />
                <link rel="preconnect" href="https://www.googletagmanager.com" />
                <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
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
          </PracticeSessionProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
