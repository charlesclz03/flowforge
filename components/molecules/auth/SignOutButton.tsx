'use client'

import { signOut } from 'next-auth/react'

interface SignOutButtonProps {
  className?: string
  children?: React.ReactNode
}

export function SignOutButton({ className = '', children }: SignOutButtonProps) {
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <button
      onClick={handleSignOut}
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors ${className}`}
    >
      {children || 'Sign out'}
    </button>
  )
}
