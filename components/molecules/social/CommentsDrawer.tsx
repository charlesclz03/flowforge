'use client'

import { useState, useEffect, useTransition } from 'react'
import { X, Send } from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { Avatar } from '@/components/atoms/Avatar'
import { cn } from '@/lib/utils'
import { getComments, addComment } from '@/app/actions/social'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'react-hot-toast'
import { useSession } from 'next-auth/react'

interface Comment {
  id: string
  content: string
  createdAt: Date
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

interface CommentsDrawerProps {
  sessionId: string
  isOpen: boolean
  onClose: () => void
  onCommentAdded?: () => void
}

export function CommentsDrawer({
  sessionId,
  isOpen,
  onClose,
  onCommentAdded,
}: CommentsDrawerProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, startTransition] = useTransition()
  const { data: session } = useSession()

  useEffect(() => {
    if (isOpen) {
      loadComments()
    }
  }, [isOpen, sessionId])

  const loadComments = async () => {
    setIsLoading(true)
    try {
      const data = await getComments(sessionId)
      setComments(data)
    } catch (error) {
      toast.error('Failed to load comments')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    startTransition(async () => {
      try {
        const comment = await addComment(sessionId, newComment)
        setComments((prev) => [comment, ...prev])
        setNewComment('')
        if (onCommentAdded) onCommentAdded()
      } catch (error) {
        toast.error('Failed to post comment')
      }
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div
        className={cn(
          'relative w-full max-w-md bg-background-elevated rounded-t-2xl sm:rounded-2xl border-t sm:border border-white/10 shadow-2xl transition-transform duration-300 transform flex flex-col max-h-[85vh]',
          isOpen ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">Comments ({comments.length})</h2>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-white rounded-full hover:bg-white/5"
          >
            <X size={20} />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-text-tertiary">
              No comments yet. Be the first!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar
                  src={comment.user.image}
                  fallback={comment.user.name?.[0] || '?'}
                  size="sm"
                />
                <div className="flex-1">
                  <div className="bg-surface-elevated border border-white/5 rounded-2xl rounded-tl-none p-3">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="font-semibold text-sm text-white">
                        {comment.user.name || 'User'}
                      </span>
                      <span className="text-xs text-text-tertiary">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary break-words">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/5 bg-background-elevated pb-8 sm:pb-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={session ? 'Add a comment...' : 'Sign in to comment'}
              disabled={!session || isSubmitting}
              className="flex-1 bg-surface-elevated border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-accent-purple placeholder:text-text-tertiary disabled:opacity-50"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!newComment.trim() || isSubmitting || !session}
              isLoading={isSubmitting}
              className="rounded-full px-3"
            >
              <Send size={16} />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
