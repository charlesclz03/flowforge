'use client'

import { useState } from 'react'
import { Swords, Globe, Zap } from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { AppHeader } from '@/components/organisms/layout/AppHeader'

export default function DuelPage() {
  const [isCreating, setIsCreating] = useState(false)

  return (
    <main className="min-h-[100dvh] bg-black text-white relative overflow-hidden">
      {/* Background Gradients - Red/Orange for Duel Aggression */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-accent-orange/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-red-600/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <AppHeader
        showBackButton
        customTitle="DUEL MODE"
        customSubtitle="Live Beta"
      />

      <div className="max-w-4xl mx-auto relative z-10 font-sans p-4 md:p-8">
        {/* Content */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Create Challenge */}
          <div className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col items-center text-center hover:border-accent-orange/50 transition-all duration-300 group">
            <div className="w-20 h-20 bg-accent-orange/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Swords className="w-10 h-10 text-accent-orange" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Create Challenge</h2>
            <p className="text-gray-400 mb-8">
              Start a 1v1 battle. Generate a code and challenge your rival.
            </p>
            <Button
              className="w-full h-12 text-lg bg-gradient-to-r from-accent-orange to-red-600 hover:from-accent-orange/80 hover:to-red-600/80 border-none"
              variant="primary"
              onClick={() => setIsCreating(true)}
              disabled={isCreating}
            >
              {isCreating ? 'Setting up Arena...' : 'Create Duel'}
            </Button>
          </div>

          {/* Join Duel */}
          <div className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col items-center text-center hover:border-white/20 transition-all duration-300">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Zap className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Accept Challenge</h2>
            <p className="text-gray-400 mb-8">
              Enter the battle code to join an existing duel.
            </p>
            <div className="w-full flex gap-2">
              <input
                type="text"
                placeholder="Enter Code"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-center tracking-widest uppercase placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:border-accent-orange/50 transition-colors"
                maxLength={4}
              />
              <Button
                variant="outline"
                className="px-6 hover:text-accent-orange hover:border-accent-orange"
              >
                Fight
              </Button>
            </div>
          </div>
        </div>

        {/* Ranked (Coming Soon) */}
        <div className="mt-12 opacity-50 pointer-events-none grayscale">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-300">
              Ranked Matchmaking
            </h3>
            <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-400">
              Coming Soon
            </span>
          </div>

          <div className="border border-white/5 rounded-2xl p-4 bg-white/[0.02]">
            <div className="text-center text-sm text-gray-500 py-8">
              Ranked ladders are under construction.
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
