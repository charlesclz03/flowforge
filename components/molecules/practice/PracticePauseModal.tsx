import { Play, RefreshCcw } from 'lucide-react'
import { Modal } from '@/components/atoms/Modal'
import { Button } from '@/components/atoms/Button'

interface PracticePauseModalProps {
  showPauseModal: boolean
  isPaused: boolean
  setShowPauseModal: (show: boolean) => void
  onTogglePause?: () => void
  handleRestart?: () => void
}

export function PracticePauseModal({
  showPauseModal,
  isPaused,
  setShowPauseModal,
  onTogglePause,
  handleRestart,
}: PracticePauseModalProps) {
  return (
    <Modal
      isOpen={showPauseModal && isPaused}
      onClose={() => setShowPauseModal(false)}
      title="Practice paused"
      className="max-w-sm"
    >
      <div className="space-y-5">
        <p className="text-sm text-text-secondary">
          Resume from the current bar or restart the practice session.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button
            onClick={() => {
              setShowPauseModal(false)
              onTogglePause?.()
            }}
            leftIcon={<Play size={20} />}
            className="min-h-[52px]"
            aria-label="Resume practice session"
          >
            Resume
          </Button>
          {handleRestart && (
            <Button
              variant="secondary"
              onClick={() => {
                setShowPauseModal(false)
                handleRestart()
              }}
              leftIcon={<RefreshCcw size={20} />}
              className="min-h-[52px]"
              aria-label="Restart practice session"
            >
              Restart
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
