import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FlowForge - AI-Powered Freestyle Rap Practice',
  description:
    'Your AI-powered freestyle rap practice partner. Master your flow, sharpen your skills, and unleash your creativity.',
  keywords: ['freestyle rap', 'practice', 'beats', 'hip hop', 'AI', 'music'],
  authors: [{ name: 'FlowForge Team' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="bg-background text-text-primary antialiased">{children}</body>
    </html>
  )
}

