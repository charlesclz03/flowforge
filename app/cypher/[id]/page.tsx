'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mic, Users, Copy } from 'lucide-react'
import { Button } from '@/components/atoms/Button'

export default function CypherRoomPage() {
  const params = useParams()
  const roomId = params?.id as string

  return (
    <main className="min-h-[100dvh] bg-black text-white p-4 md:p-8 relative overflow-hidden flex flex-col items-center">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-accent-purple/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-accent-cyan/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="max-w-2xl w-full relative z-10 font-sans flex flex-col h-full">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8">
          <Link
            href="/cypher"
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold">Cypher Lobby</h1>
          <div className="ml-auto px-3 py-1 bg-white/10 rounded-full text-xs font-mono">
            ID: {roomId}
          </div>
        </header>

        {/* Room Info */}
        <div className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col items-center text-center mb-8">
          <div className="w-24 h-24 bg-accent-purple/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <Mic className="w-10 h-10 text-accent-purple" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Waiting for MCs...</h2>
          <p className="text-gray-400 mb-6">
            Share the code below to invite others.
          </p>

          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 mb-6">
            <span className="text-2xl font-mono tracking-widest text-accent-cyan">
              {roomId}
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(roomId)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Copy Code"
            >
              <Copy size={20} />
            </button>
          </div>

          <div className="flex gap-2">
            <div className="flex -space-x-2">
              <div className="w-10 h-10 rounded-full bg-gray-700 border-2 border-black flex items-center justify-center text-xs">
                You
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 border-2 border-black border-dashed flex items-center justify-center text-xs opacity-50">
                <Users size={14} />
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 border-2 border-black border-dashed flex items-center justify-center text-xs opacity-50">
                <Users size={14} />
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 border-2 border-black border-dashed flex items-center justify-center text-xs opacity-50">
                <Users size={14} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <Button
            className="w-full py-4 text-lg font-bold"
            variant="primary"
            disabled
          >
            Waiting for Players...
          </Button>
        </div>
      </div>
    </main>
  )
}
