'use client'

import { XPBar } from './XPBar'
import { CheckCircle2, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DailyGoalWidgetProps {
  currentXP: number
  goalXP?: number
}

export function DailyGoalWidget({
  currentXP,
  goalXP = 100,
}: DailyGoalWidgetProps) {
  const isComplete = currentXP >= goalXP

  return (
    <div
      className={cn(
        'relative rounded-2xl border p-4 transition-all duration-300',
        isComplete
          ? 'bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/20'
          : 'bg-white/5 border-white/10'
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'p-1.5 rounded-lg',
              isComplete
                ? 'bg-green-500/20 text-green-400'
                : 'bg-white/10 text-text-secondary'
            )}
          >
            {isComplete ? <CheckCircle2 size={16} /> : <Target size={16} />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Daily Goal</h3>
            <p className="text-[10px] text-text-tertiary">50 XP Reward</p>
          </div>
        </div>
        <div className="text-right">
          <span
            className={cn(
              'text-lg font-black font-numeral leading-none',
              isComplete ? 'text-green-400' : 'text-white'
            )}
          >
            {Math.min(currentXP, goalXP)}
          </span>
          <span className="text-xs text-text-tertiary">/{goalXP} XP</span>
        </div>
      </div>

      <XPBar
        current={currentXP}
        max={goalXP}
        showLabel={false}
        className="h-2"
      />
    </div>
  )
}
