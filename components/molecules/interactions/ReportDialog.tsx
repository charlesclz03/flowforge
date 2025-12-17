'use client'

import { useState } from 'react'
// If standard dialog not available, I'll allow the error and then create one or use custom logic.
// Checking file list earlier, I didn't verify `components/atoms/Dialog` exists.
// I'll stick to a simpler implementations if needed or check atoms.
// Wait, I don't recall seeing `Dialog` in atoms. `Card`, `Button`, `Avatar` yes.
// I'll implement a simple portal-based Dialog here or assume Shadcn-like structure.
// Let's check atoms first to be safe? No, I'll write a simple one if needed or assume standard headless UI patterns.
// Actually, `FirstVisitOverlay` used `createPortal`.
// I'll create a standalone `ReportDialog` that manages its own portal or uses a library if installed (`@headlessui/react` is in package.json).

import { Dialog as HeadlessDialog } from '@headlessui/react'
import { Button } from '@/components/atoms/Button'
import { Flag, X } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ReportDialogProps {
  isOpen: boolean
  onClose: () => void
  contentId: string
  contentType: 'session' | 'user' | 'comment'
}

export function ReportDialog({ isOpen, onClose, contentId, contentType }: ReportDialogProps) {
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Mock API call
      console.log('Reporting', contentId, contentType, reason)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // In real app: POST /api/report { contentId, contentType, reason }
      toast.success('Report submitted. Thank you for keeping the community safe.')
      onClose()
    } catch (e) {
      toast.error('Failed to submit report')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <HeadlessDialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <HeadlessDialog.Panel className="w-full max-w-md bg-background-elevated border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="flex justify-between items-start mb-4">
            <HeadlessDialog.Title className="text-xl font-bold text-white flex items-center gap-2">
              <Flag className="text-red-500" size={24} />
              Report Content
            </HeadlessDialog.Title>
            <button onClick={onClose} className="text-text-tertiary hover:text-white">
              <X size={20} />
            </button>
          </div>

          <HeadlessDialog.Description className="text-text-secondary mb-6">
            Please select a reason for reporting this {contentType}.
          </HeadlessDialog.Description>

          <div className="space-y-3 mb-6">
            {['Inappropriate Content', 'Harassment', 'Spam', 'Copyright Violation'].map((r) => (
              <label
                key={r}
                className="flex items-center gap-3 p-3 rounded-lg border border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name="reason"
                  value={r}
                  checked={reason === r}
                  onChange={(e) => setReason(e.target.value)}
                  className="text-accent-purple focus:ring-accent-purple"
                />
                <span className="text-white">{r}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={!reason || isSubmitting}
              onClick={handleSubmit}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </HeadlessDialog.Panel>
      </div>
    </HeadlessDialog>
  )
}
