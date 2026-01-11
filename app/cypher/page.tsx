'use client'

import { useState } from 'react'
import { Users, Mic, Globe } from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { useRouter } from 'next/navigation'
import { AppHeader } from '@/components/organisms/layout/AppHeader'

export default function CypherPage() {
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()

  const handleCreateRoom = async () => {
    setIsCreating(true)
    try {
      const res = await fetch('/api/cypher/create', { method: 'POST' })
      const data = await res.json()
      if (data.success && data.roomId) {
        router.push(`/cypher/${data.roomId}`)
      } else {
        alert('Failed to create room')
        setIsCreating(false)
      }
    } catch (e) {
      console.error(e)
      setIsCreating(false)
      alert('Error creating room')
    }
  }

  return (
    <main className="min-h-[100dvh] bg-black text-white relative overflow-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-accent-purple/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-accent-cyan/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <AppHeader
        showBackButton
        customTitle="CYPHER MODE"
        customSubtitle="Live Beta"
      />

      <div className="max-w-4xl mx-auto relative z-10 font-sans p-4 md:p-8">
        {/* Content */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Create Room */}
          <div className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col items-center text-center hover:border-accent-purple/50 transition-all duration-300 group">
            <div className="w-20 h-20 bg-accent-purple/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Mic className="w-10 h-10 text-accent-purple" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Start a Cypher</h2>
            <p className="text-gray-400 mb-8">
              Create a private room and invite up to 4 friends to pass the mic.
            </p>
            <Button
              className="w-full h-12 text-lg"
              variant="primary"
              onClick={handleCreateRoom}
              disabled={isCreating}
            >
              {isCreating ? 'Creating Room...' : 'Create Room'}
            </Button>
          </div>

          {/* Join Room */}
          <div className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col items-center text-center hover:border-white/20 transition-all duration-300">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Join Room</h2>
            <p className="text-gray-400 mb-8">
              Got a code? Enter the lobby ID to jump into an active session.
            </p>
            <div className="w-full flex gap-2">
              <input
                type="text"
                placeholder="Enter Code (e.g. A4F9)"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-center tracking-widest uppercase placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:border-accent-purple/50 transition-colors"
                maxLength={4}
              />
              <Button variant="outline" className="px-6">
                Join
              </Button>
            </div>
          </div>
        </div>

        {/* Public Lobbies (Coming Soon) */}
        <div className="mt-12 opacity-50 pointer-events-none grayscale">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-300">
              Public Lobbies
            </h3>
            <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-400">
              Coming Soon
            </span>
          </div>

          <div className="border border-white/5 rounded-2xl p-4 bg-white/[0.02]">
            <div className="text-center text-sm text-gray-500 py-8">
              No public lobbies found. Start a private Cypher!
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
