'use client'

import { MessageCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface MessageButtonProps {
  targetUserId: string
  currentUserId?: string
}

export function MessageButton({ targetUserId, currentUserId }: MessageButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (!currentUserId || currentUserId === targetUserId) return null

  const handleMessage = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId }),
      })
      const data = await res.json()
      if (data.id) {
        router.push(`/messages/${data.id}`)
      }
    } catch (err) {
      console.error('Failed to start chat', err)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleMessage}
      disabled={loading}
      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-colors disabled:opacity-50"
      aria-label="Message User"
    >
      <MessageCircle size={18} />
      <span>{loading ? '...' : 'Message'}</span>
    </button>
  )
}
