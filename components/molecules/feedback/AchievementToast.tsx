'use client'

import { toast, Toast } from 'react-hot-toast'
import { Trophy, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AchievementToastProps {
  t: Toast
  title: string
  description: string
  points?: number
  icon?: React.ReactNode
}

export function AchievementToast({ t, title, description, points, icon }: AchievementToastProps) {
  return (
    <div
      className={cn(
        'max-w-md w-full bg-black/80 backdrop-blur-xl border border-accent-purple/30 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 overflow-hidden',
        t.visible ? 'animate-enter' : 'animate-leave'
      )}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            {icon || <Trophy className="h-10 w-10 text-accent-purple" />}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-white">{title}</p>
            <p className="mt-1 text-sm text-text-secondary">{description}</p>
            {points && <p className="mt-1 text-xs font-bold text-accent-purple">+{points} XP</p>}
          </div>
        </div>
      </div>
      <div className="flex border-l border-white/10">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-text-secondary hover:text-white focus:outline-none"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}

// Helper to trigger the toast
export const showAchievement = (title: string, description: string, points?: number) => {
  toast.custom(
    (t) => <AchievementToast t={t} title={title} description={description} points={points} />,
    {
      duration: 4000,
      position: 'top-center',
    }
  )
}
