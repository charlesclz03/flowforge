'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

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
    <main className="flex h-[100dvh] items-center justify-center bg-black">
      <div className="animate-pulse">
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
