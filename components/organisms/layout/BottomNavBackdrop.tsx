'use client'

import { usePathname } from 'next/navigation'

function shouldShowBackdrop(pathname: string): boolean {
  return pathname === '/practice'
}

export function BottomNavBackdrop() {
  const pathname = usePathname()

  if (!shouldShowBackdrop(pathname)) {
    return null
  }

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-950/20 to-black" />
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl animate-pulse delay-1000" />
    </div>
  )
}
