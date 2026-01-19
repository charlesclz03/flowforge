'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { AppHeader } from '@/components/organisms/layout/AppHeader'

function HomePageContent() {
  const { status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (status === 'loading') return

    // If we have a callbackUrl (just signed in), go there
    const callbackUrl = searchParams?.get('callbackUrl')
    if (status === 'authenticated' && callbackUrl) {
      router.push(decodeURIComponent(callbackUrl))
      return
    }

    // Default: Redirect everyone to /howitworks
    router.push('/howitworks')
  }, [status, router, searchParams])

  return (
    <main className="flex flex-col h-[100dvh] bg-black">
      <div className="absolute top-0 w-full z-10">
        {/* Header specifically for Home - Standard Logo */}
        <AppHeader showBackButton={false} showSettings={false} />
      </div>
      <div className="flex-1 flex items-center justify-center animate-pulse">
        <Image
          src="/logo.png"
          alt="Loading FreeStyla..."
          width={64}
          height={64}
          priority
          className="h-16 w-16 object-contain drop-shadow-neon"
        />
      </div>
    </main>
  )
}

export default function HomePage() {
  return <HomePageContent />
}
