'use client'

import { ScreenPage } from '@/components/layout/ScreenPage'
import { AppHeader } from '@/components/organisms/layout/AppHeader'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// P2 Hardening: Dynamically load the heavy Audio Context + Latency computation payload
const DynamicLatencyStudio = dynamic(
  () => import('@/components/organisms/settings/LatencyCalibrationStudio'),
  {
    ssr: false, // Strict browser-only (AudioContext)
    loading: () => (
      <div className="flex flex-col items-center justify-center p-24 text-white/50 space-y-4 animate-pulse">
        <Loader2 className="w-8 h-8 animate-spin text-accent-purple" />
        <p className="text-xs font-bold tracking-widest uppercase text-accent-purple/80">
          Loading Studio Logic
        </p>
      </div>
    ),
  }
)

export default function LatencyPage() {
  const router = useRouter()

  return (
    <ScreenPage
      header={
        <AppHeader
          showBackButton
          onBack={() => router.back()}
          customTitle="LATENCY WIZARD"
          customSubtitle="Audio calibration"
        />
      }
    >
      <DynamicLatencyStudio />
    </ScreenPage>
  )
}
