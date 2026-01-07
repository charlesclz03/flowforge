'use client'

import { useState } from 'react'
import { Button } from '@/components/atoms/Button'
import { motion, AnimatePresence } from 'framer-motion'

export function FeedbackForm() {
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<
    'idle' | 'submitting' | 'success' | 'error'
  >('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setStatus('submitting')

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (!res.ok) throw new Error('Failed to submit')

      setStatus('success')
      setContent('')

      // Reset success message after 3 seconds
      setTimeout(() => setStatus('idle'), 3000)
    } catch (error) {
      console.error(error)
      setStatus('error')
    }
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mt-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />

      <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
        <span>📜</span> From the Quill to the Code
      </h3>
      <p className="text-zinc-400 mb-4 text-sm">
        Have a scroll of wisdom to share? Found a glitch in the matrix? The
        developers are listening. Your words help shape the future of FlowForge.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your feedback here..."
            className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all resize-none"
            disabled={status === 'submitting' || status === 'success'}
          />
          <AnimatePresence>
            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-zinc-950/90 backdrop-blur-sm rounded-lg border border-green-500/30"
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">✅</div>
                  <p className="text-green-400 font-medium">
                    Message Inscribed!
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={
              status === 'submitting' || status === 'success' || !content.trim()
            }
            isLoading={status === 'submitting'}
          >
            {status === 'error' ? 'Retry Submission' : 'Send Feedback'}
          </Button>
        </div>
      </form>
    </div>
  )
}
