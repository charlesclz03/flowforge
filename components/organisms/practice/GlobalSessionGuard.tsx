'use client'

import { Modal } from '@/components/atoms/Modal'
import { Button } from '@/components/atoms/Button'
import { usePracticeSession } from '@/contexts/SessionContext'

export function GlobalSessionGuard() {
  const { showExitPrompt, cancelNavigation, confirmNavigation } =
    usePracticeSession()

  return (
    <Modal
      isOpen={showExitPrompt}
      onClose={cancelNavigation}
      title="Cancel Session?"
      showCloseButton={false}
    >
      <div className="space-y-4">
        <p className="text-text-secondary">
          You have an active session. Are you sure you want to cancel it?
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={cancelNavigation}>
            Keep Practicing
          </Button>
          <Button variant="primary" onClick={confirmNavigation}>
            Cancel Session
          </Button>
        </div>
      </div>
    </Modal>
  )
}
