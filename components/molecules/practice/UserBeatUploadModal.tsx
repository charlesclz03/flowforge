'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/atoms/Dialog'
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
        <DialogHeader>
          <DialogTitle>Upload Your Beat</DialogTitle>
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
