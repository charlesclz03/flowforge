'use client'

import Link, { LinkProps } from 'next/link'
import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'
import { usePracticeSession } from '@/contexts/SessionContext'

interface ProtectedLinkProps extends LinkProps {
  children: ReactNode
  className?: string
  onClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void
}

/**
 * A wrapper around Next.js Link that checks for active sessions
 * before allowing navigation.
 */
export function ProtectedLink({
  children,
  onClick,
  href,
  ...props
}: ProtectedLinkProps) {
  const router = useRouter()

  const { attemptNavigation } = usePracticeSession()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    // If user provided an onClick, run it first
    if (onClick) {
      onClick(e)
      if (e.defaultPrevented) return
    }

    // Capture the click
    e.preventDefault()

    // Determine target
    // LinkProps.href can be a UrlObject, we simplify for this guard or handle string only for now?
    // standard href is string | UrlObject.
    // attemptNavigation takes string | () => void.

    // We'll wrap the navigation in a thunk
    const performNavigation = () => {
      // If it's a simple string, we can pass it directly or push it here
      if (typeof href === 'string') {
        router.push(href)
      } else {
        // Handle UrlObject if needed, but for now mostly strings are used.
        // If complex, we might need to rely on router.push(href)
        // @ts-expect-error - router.push supports UrlObject
        router.push(href)
      }
    }

    attemptNavigation(performNavigation)
  }

  return (
    <Link {...props} href={href} onClick={handleClick}>
      {children}
    </Link>
  )
}
