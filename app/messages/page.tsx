'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Container } from '@/components/atoms/Container'
import { PageHeader } from '@/components/organisms/common'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { MessageSquare } from 'lucide-react'
import Image from 'next/image'

// Define types locally for now or import
interface Conversation {
  id: string
  otherUser: {
    id: string
    username: string | null
    image: string | null
  }
  lastMessage: {
    content: string
    createdAt: string
    senderId: string
  } | null
  isUnread: boolean
}

export default function InboxPage() {
  const { status } = useSession()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
      return
    }

    if (status === 'authenticated') {
      fetch('/api/conversations')
        .then((res) => res.json())
        .then((data) => {
          setConversations(data)
          setLoading(false)
        })
        .catch((err) => {
          console.error('Failed to load inbox', err)
          setLoading(false)
        })
    }
  }, [status, router])

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* AppHeader removed for gamified layout */}
      <Container className="pt-8">
        <PageHeader title="Messages" description="Your private conversations." />

        <div className="mt-6 space-y-4">
          {loading ? (
            // Skeleton
            [1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
            ))
          ) : conversations.length === 0 ? (
            <div className="text-center py-12 text-text-tertiary">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No messages yet.</p>
              <p className="text-sm">Start a conversation from someone's profile!</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <Link key={conv.id} href={`/messages/${conv.id}`}>
                <div
                  className={`
                    p-4 rounded-xl border transition-colors flex items-center gap-4
                    ${
                      conv.isUnread
                        ? 'bg-white/10 border-accent-purple/50'
                        : 'bg-background-elevated border-white/5 hover:bg-white/5'
                    }
                `}
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-accent-purple to-accent-cyan flex-shrink-0 overflow-hidden">
                    {conv.otherUser.image ? (
                      <Image
                        src={conv.otherUser.image}
                        alt={conv.otherUser.username || 'User'}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold">
                        {(conv.otherUser.username?.[0] || 'U').toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3
                        className={`truncate ${conv.isUnread ? 'font-bold text-white' : 'font-medium text-text-primary'}`}
                      >
                        {conv.otherUser.username || 'Anonymous'}
                      </h3>
                      {conv.lastMessage && (
                        <span className="text-xs text-text-tertiary whitespace-nowrap ml-2">
                          {formatDistanceToNow(new Date(conv.lastMessage.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-sm truncate ${conv.isUnread ? 'text-white' : 'text-text-secondary'}`}
                    >
                      {conv.lastMessage?.senderId === conv.otherUser.id ? '' : 'You: '}
                      {conv.lastMessage?.content || 'Started a conversation'}
                    </p>
                  </div>

                  {/* Unread Dot */}
                  {conv.isUnread && <div className="w-3 h-3 rounded-full bg-accent-purple" />}
                </div>
              </Link>
            ))
          )}
        </div>
      </Container>
    </div>
  )
}
