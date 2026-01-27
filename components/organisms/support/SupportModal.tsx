'use client'

import { useState } from 'react'
import { Modal } from '@/components/atoms/Modal'
import { Button } from '@/components/atoms/Button'
import { CheckCircle, MessageSquare, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'

interface SupportModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const [subject, setSubject] = useState('General Inquiry')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<
    'idle' | 'submitting' | 'success' | 'error'
  >('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setStatus('submitting')

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          message,
        }),
      })

      if (!res.ok) throw new Error('Failed to send message')

      setStatus('success')
      setMessage('')

      // Close after success
      setTimeout(() => {
        setStatus('idle')
        onClose()
        toast.success('Message sent! Check your email for our reply.')
      }, 2000)
    } catch (error) {
      console.error(error)
      setStatus('error')
      toast.error('Failed to send message. Please try again.')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Contact Support">
      <div className="space-y-6">
        {/* Header Visual */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-accent-blue/10 border border-accent-blue/20">
          <div className="p-3 rounded-full bg-accent-blue/20">
            <MessageSquare size={24} className="text-accent-blue" />
          </div>
          <div>
            <h4 className="font-bold text-white">Start a conversation</h4>
            <p className="text-xs text-zinc-400">
              We'll reply directly to your email address.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Subject Select */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Topic
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue transition-all"
              disabled={status === 'submitting'}
            >
              <option>General Inquiry</option>
              <option>Report a Bug</option>
              <option>Billing Issue</option>
              <option>Feature Request</option>
              <option>Account Help</option>
            </select>
          </div>

          {/* Message Input */}
          <div className="space-y-2 relative">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Message
            </label>
            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help you today?"
                className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue transition-all resize-none"
                disabled={status === 'submitting' || status === 'success'}
              />

              {/* Success Overlay */}
              <AnimatePresence>
                {status === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-sm rounded-xl border border-green-500/30"
                  >
                    <CheckCircle className="w-12 h-12 text-green-400 mb-2" />
                    <p className="text-green-400 font-bold">
                      Sent Successfully!
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full bg-accent-blue hover:bg-blue-600 text-white shadow-lg shadow-blue-900/20"
              disabled={
                status === 'submitting' ||
                status === 'success' ||
                !message.trim()
              }
              isLoading={status === 'submitting'}
              leftIcon={<Send size={16} />}
            >
              Send Message
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
