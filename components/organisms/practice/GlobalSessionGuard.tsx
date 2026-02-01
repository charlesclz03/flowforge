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
      title="End Session?"
      showCloseButton={false}
    >
      <div className="space-y-4">
        <p className="text-text-secondary">
          You are currently in an active session. Leaving now will end the
          session.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={cancelNavigation}>
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmNavigation}>
            End Session
          </Button>
        </div>
      </div>
    </Modal>
  )
}
