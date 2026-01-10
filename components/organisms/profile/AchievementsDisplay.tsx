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

import { motion } from 'framer-motion'

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
        const contentType = res.headers.get('content-type')

        if (res.ok && contentType?.includes('application/json')) {
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
        } else {
          console.warn('Achievements fetch failed or returned non-JSON', {
            status: res.status,
            contentType,
          })
        }
      } catch (e) {
        console.error('Achievements fetch error:', e)
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
              <motion.div
                key={ach.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center gap-2 group cursor-pointer relative"
              >
                <div className="relative w-24 h-24 flex items-center justify-center">
                  {/* Ring SVG */}
                  <svg
                    className="absolute inset-0 w-full h-full rotate-[-90deg]"
                    viewBox="0 0 100 100"
                  >
                    {/* Track */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#1A1A1A"
                      strokeWidth="6"
                    />
                    {/* Progress */}
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="6"
                      strokeDasharray="283" // 2 * PI * 45
                      initial={{ strokeDashoffset: 283 }}
                      animate={{ strokeDashoffset: ach.isUnlocked ? 0 : 283 }}
                      transition={{
                        duration: 1.5,
                        ease: 'easeOut',
                        delay: 0.2,
                      }}
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* Icon */}
                  <div
                    className={cn(
                      'w-14 h-14 rounded-full flex items-center justify-center z-10 transition-colors bg-[#121212] border-4 border-background',
                      ach.isUnlocked ? 'text-white' : 'text-white/20 grayscale'
                    )}
                  >
                    {ach.isUnlocked ? (
                      <Trophy
                        size={24}
                        color={tierColor}
                        className="drop-shadow-glow"
                      />
                    ) : (
                      <Lock size={20} />
                    )}
                  </div>

                  {/* Glow effect for unlocked */}
                  {ach.isUnlocked && (
                    <div className="absolute inset-0 rounded-full bg-accent-purple/20 blur-xl -z-10" />
                  )}
                </div>

                <div className="text-center z-20 max-w-[100px]">
                  <div
                    className={cn(
                      'text-xs font-bold leading-tight',
                      ach.isUnlocked ? 'text-white' : 'text-text-tertiary'
                    )}
                  >
                    {ach.name}
                  </div>
                  <div className="text-[10px] text-text-tertiary mt-0.5 font-mono">
                    {ach.points} pts
                  </div>
                  {/* Description always visible */}
                  <div className={cn(
                    'text-[9px] mt-1 leading-tight line-clamp-2',
                    ach.isUnlocked ? 'text-text-secondary' : 'text-text-tertiary/70'
                  )}>
                    {ach.description}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
