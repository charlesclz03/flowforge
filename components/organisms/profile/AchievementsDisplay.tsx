'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Trophy, Lock } from 'lucide-react'

// Types matching the API response
interface Achievement {
  id: string
  code: string
  name: string
  description: string
  points: number
  icon: string | null
}

interface UserAchievementWithAchievement {
  id: string
  achievementId: string
  userId: string
  unlockedAt: Date | string
  achievement: Achievement
}

type EnrichedAchievement = Achievement & {
  unlockedAt?: Date | string
  isUnlocked: boolean
}

export function AchievementsDisplay() {
  const [achievements, setAchievements] = useState<EnrichedAchievement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPoints: 0,
    unlockedCount: 0,
    totalCount: 0,
  })
  const [filter, setFilter] = useState<
    'all' | 'owned' | 'in_progress' | 'not_achieved'
  >('all')

  const filteredAchievements = achievements.filter((ach) => {
    if (filter === 'all') return true
    if (filter === 'owned') return ach.isUnlocked
    if (filter === 'not_achieved') return !ach.isUnlocked
    if (filter === 'in_progress') return false // No progress tracking yet
    return true
  })

  useEffect(() => {
    async function fetchAchievements() {
      try {
        const res = await fetch('/api/user/achievements')
        if (res.ok) {
          const data = await res.json()
          const userAch =
            data.userAchievements as UserAchievementWithAchievement[]
          const allAch = data.allAchievements as Achievement[]

          const unlockedMap = new Map(
            userAch.map((ua) => [ua.achievementId, ua.unlockedAt])
          )

          let points = 0
          const enriched = allAch.map((ach) => {
            const unlockedAt = unlockedMap.get(ach.id)
            if (unlockedAt) points += ach.points
            return {
              ...ach,
              unlockedAt: unlockedAt as Date | string | undefined,
              isUnlocked: !!unlockedAt,
            }
          })

          enriched.sort((a, b) => {
            if (a.isUnlocked && !b.isUnlocked) return -1
            if (!a.isUnlocked && b.isUnlocked) return 1
            return a.points - b.points
          })

          setAchievements(enriched)
          setStats({
            totalPoints: points,
            unlockedCount: userAch.length,
            totalCount: allAch.length,
          })
        }
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAchievements()
  }, [])

  if (isLoading) {
    return <div className="animate-pulse h-24 bg-white/5 rounded-xl" />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-white">Achievements</h3>

        {/* Filter Controls */}
        <div className="flex gap-2 p-1 overflow-x-auto bg-black/40 rounded-lg border border-white/5 scrollbar-hide">
          {(['all', 'owned', 'in_progress', 'not_achieved'] as const).map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap',
                  filter === f
                    ? 'bg-accent-purple text-white shadow-sm'
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                )}
              >
                {f === 'all' && 'All'}
                {f === 'owned' && 'Owned'}
                {f === 'in_progress' && 'In Progress'}
                {f === 'not_achieved' && 'Not Achieved'}
              </button>
            )
          )}
        </div>
      </div>

      <div className="text-sm text-text-secondary">
        <span className="text-accent-purple font-bold">
          {stats.unlockedCount}
        </span>
        /{stats.totalCount} ({stats.totalPoints} PTS)
      </div>

      {filteredAchievements.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10 border-dashed">
          <p className="text-text-secondary">
            {filter === 'in_progress'
              ? 'No achievements currently in progress.'
              : 'No achievements found.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {filteredAchievements.map((ach) => {
            // Ring Color based on points/tier (Mock logic)
            const tierColor =
              ach.points >= 50
                ? '#FF9500'
                : ach.points >= 20
                  ? '#E0E0E0'
                  : '#CD7F32' // Gold, Silver, Bronze
            const strokeColor = ach.isUnlocked ? tierColor : '#333'

            return (
              <div
                key={ach.id}
                className="flex flex-col items-center gap-2 group cursor-default"
              >
                <div className="relative w-20 h-20 flex items-center justify-center">
                  {/* Ring SVG */}
                  <svg
                    className="absolute inset-0 w-full h-full rotate-[-90deg]"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#1A1A1A"
                      strokeWidth="6"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="6"
                      strokeDasharray="283"
                      strokeDashoffset={ach.isUnlocked ? 0 : 283}
                      strokeLinecap="round"
                      className={cn(
                        'transition-all duration-1000',
                        ach.isUnlocked &&
                          'drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]'
                      )}
                    />
                  </svg>

                  {/* Icon */}
                  <div
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center z-10 transition-colors bg-[#121212]',
                      ach.isUnlocked ? 'text-white' : 'text-white/20 grayscale'
                    )}
                  >
                    {ach.isUnlocked ? (
                      <Trophy size={24} color={tierColor} />
                    ) : (
                      <Lock size={20} />
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <div
                    className={cn(
                      'text-xs font-bold leading-tight',
                      ach.isUnlocked ? 'text-white' : 'text-text-tertiary'
                    )}
                  >
                    {ach.name}
                  </div>
                  <div className="text-[10px] text-text-tertiary mt-0.5">
                    {ach.points} pts
                  </div>
                </div>

                {/* Tooltip (Simple Hover) */}
                <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bottom-full mb-2 w-32 bg-black/90 text-white text-xs p-2 rounded pointer-events-none z-20 border border-white/10 text-center">
                  {ach.description}
                  <div className="text-[9px] text-text-tertiary mt-1">
                    {ach.isUnlocked ? 'Unlocked' : 'Locked'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
