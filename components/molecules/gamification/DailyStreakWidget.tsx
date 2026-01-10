'use client'

import { StreakFlame } from './StreakFlame'

interface DailyStreakWidgetProps {
  currentStreak: number
  hasPracticedToday: boolean
}

export function DailyStreakWidget({
  currentStreak,
  hasPracticedToday,
}: DailyStreakWidgetProps) {
  return (
    <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-600/10 border border-orange-500/20 p-4">
      {/* Background glow */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-orange-500/20 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center gap-4 relative z-10">
        <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
          <StreakFlame streak={currentStreak} isActive={hasPracticedToday} />
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-bold text-white uppercase tracking-wide">
            {hasPracticedToday ? 'Streak Active!' : 'Keep the streak!'}
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            {hasPracticedToday
              ? "You're on fire today."
              : 'Complete at least one session every day to build your streak.'}
          </p>
        </div>
      </div>
    </div>
  )
}
