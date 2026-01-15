'use client'

import { Container } from '@/components/atoms/Container'
import { AppHeader } from '@/components/organisms/layout/AppHeader'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, FileText, Lock } from 'lucide-react'

export default function LegalPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader
        showBackButton
        onBack={() => router.back()}
        customTitle="LEGAL"
        customSubtitle="Documents & Compliance"
      />
      <Container className="pt-8 space-y-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-elevation-2 mb-4">
            <Shield className="w-8 h-8 text-accent-purple" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Legal Center</h1>
          <p className="text-text-secondary text-sm">
            Review our terms, policies, and licenses.
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/legal/terms">
            <div className="bg-surface-elevation-1 rounded-xl p-4 flex items-center gap-4 hover:bg-surface-elevation-2 transition-colors border border-white/5">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold">Terms of Service</h3>
                <p className="text-xs text-text-secondary">
                  Rules, usage licenses, and user agreements.
                </p>
              </div>
            </div>
          </Link>

          <Link href="/legal/privacy">
            <div className="bg-surface-elevation-1 rounded-xl p-4 flex items-center gap-4 hover:bg-surface-elevation-2 transition-colors border border-white/5">
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <Lock className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold">Privacy Policy</h3>
                <p className="text-xs text-text-secondary">
                  How we collect, use, and protect your data.
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs text-text-tertiary">
            FreeStyla © 2026. All rights reserved.
          </p>
        </div>
      </Container>
    </div>
  )
}
