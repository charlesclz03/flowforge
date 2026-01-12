'use client'

import { useEffect, useState } from 'react'
import { AppHeader } from '@/components/organisms/layout/AppHeader'
import { Card } from '@/components/atoms/Card'
import { formatDistanceToNow } from 'date-fns'
import { User } from 'lucide-react'
import Image from 'next/image'

interface Feedback {
  id: string
  content: string
  createdAt: string
  user?: {
    name: string | null
    email: string | null
    image: string | null
  }
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchFeedback() {
      try {
        const res = await fetch('/api/feedback')
        if (res.ok) {
          const data = await res.json()
          setFeedbacks(data.feedbacks)
        }
      } catch (error) {
        console.error('Failed to fetch feedback', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeedback()
  }, [])

  return (
    <div className="space-y-6">
      <AppHeader
        customTitle="USER FEEDBACK"
        customSubtitle="Bug reports and suggestions"
        showBackButton
        onBack={() => window.history.back()}
      />

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-zinc-500 text-center py-10">Loading...</div>
        ) : feedbacks.length === 0 ? (
          <div className="text-zinc-500 text-center py-10">
            No feedback found.
          </div>
        ) : (
          feedbacks.map((item) => (
            <Card key={item.id} className="p-6 border-white/5">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {item.user?.image ? (
                    <Image
                      src={item.user.image}
                      alt={item.user.name || 'User'}
                      width={40}
                      height={40}
                      className="rounded-full border border-white/10"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10">
                      <User size={18} className="text-zinc-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-zinc-200">
                        {item.user?.name || 'Anonymous User'}
                      </h4>
                      <p className="text-xs text-zinc-500">
                        {item.user?.email || 'No email provided'}
                      </p>
                    </div>
                    <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded-full border border-white/5">
                      {formatDistanceToNow(new Date(item.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  <div className="bg-zinc-950/50 rounded-lg p-4 border border-white/5 text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {item.content}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
