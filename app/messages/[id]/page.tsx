'use client'

import { useEffect, useState, useRef } from 'react'
import { ChevronLeft, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

interface Message {
  id: string
  content: string
  senderId: string
  createdAt: string
}

export default function ChatPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  // Poll for messages (MVP primitive real-time)
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
      return
    }

    if (status !== 'authenticated') return

    const fetchMessages = () => {
      fetch(`/api/conversations/${params.id}/messages`)
        .then((res) => {
          if (res.ok) return res.json()
          throw new Error('Failed to load')
        })
        .then((data) => {
          // Only update if different count to avoid jitter?
          // Or usage of SWR would be better.
          // For MVP simple set is fine.
          setMessages(data)
        })
        .catch(console.error)
    }

    fetchMessages()
    const interval = setInterval(fetchMessages, 3000) // Poll every 3s
    return () => clearInterval(interval)
  }, [params.id, status, router])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || sending) return

    const tempContent = input
    setInput('')
    setSending(true)

    try {
      const res = await fetch(`/api/conversations/${params.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: tempContent }),
      })

      if (res.ok) {
        const newMsg = await res.json()
        setMessages((prev) => [...prev, newMsg])
      } else {
        // Restore input on fail
        setInput(tempContent)
      }
    } catch (err) {
      console.error(err)
      setInput(tempContent)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center gap-4 bg-background z-10">
        <Link href="/messages" className="p-2 -ml-2 text-text-secondary hover:text-white">
          <ChevronLeft />
        </Link>
        <div className="font-bold text-lg">Chat</div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.senderId === session?.user?.id
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`
                        max-w-[80%] rounded-2xl px-4 py-2 text-sm
                        ${
                          isMe
                            ? 'bg-accent-purple text-white rounded-tr-sm'
                            : 'bg-white/10 text-white rounded-tl-sm'
                        }
                    `}
              >
                {msg.content}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10 bg-background pb-8 safe-bottom">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white focus:outline-none focus:border-accent-purple transition-colors"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="p-2 rounded-full bg-accent-purple text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  )
}
