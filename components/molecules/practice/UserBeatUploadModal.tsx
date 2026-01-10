'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/Dialog'
import { X } from 'lucide-react'
import { UserBeatUpload } from '@/components/organisms/upload/UserBeatUpload'

interface UserBeatUploadModalProps {
  isOpen: boolean
  onClose: () => void
  isPro: boolean
  onSuccess: () => void
}

export function UserBeatUploadModal({
  isOpen,
  onClose,
  isPro,
  onSuccess,
}: UserBeatUploadModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-background-elevated border border-white/10">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Upload Your Beat</DialogTitle>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-text-secondary hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
          <span className="sr-only">Upload and calibrate your custom beat</span>
        </DialogHeader>

        <UserBeatUpload
          isPro={isPro}
          onSuccess={() => {
            onSuccess()
            onClose() // Passed as prop, ensuring serializability context is client-side
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
