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

interface Progress {
  sessions: number
  recordings: number
  beats: number
  streak: number
  words: number
}

// Progress type mapping from data.ts codes
const PROGRESS_MAP: Record<string, { type: keyof Progress; target: number }> = {
  FIRST_FLOW: { type: 'sessions', target: 1 },
  SESSION_5: { type: 'sessions', target: 5 },
  SESSION_20: { type: 'sessions', target: 20 },
  SESSION_50: { type: 'sessions', target: 50 },
  SESSION_100: { type: 'sessions', target: 100 },
  FIRST_RECORDING: { type: 'recordings', target: 1 },
  RECORDING_10: { type: 'recordings', target: 10 },
  RECORDING_50: { type: 'recordings', target: 50 },
  BEAT_EXPLORER_5: { type: 'beats', target: 5 },
  BEAT_MASTER_20: { type: 'beats', target: 20 },
  STREAK_3: { type: 'streak', target: 3 },
  STREAK_7: { type: 'streak', target: 7 },
  STREAK_30: { type: 'streak', target: 30 },
  WORDS_50: { type: 'words', target: 50 },
  WORDS_200: { type: 'words', target: 200 },
  WORDS_1000: { type: 'words', target: 1000 },
}

type EnrichedAchievement = Achievement & {
  unlockedAt?: Date | string
  isUnlocked: boolean
  progressCurrent?: number
  progressTarget?: number
  progressPercent?: number
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
    if (filter === 'in_progress')
      return !ach.isUnlocked && (ach.progressPercent || 0) > 0
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
          const progressData = (data.progress as Progress) || {
            sessions: 0,
            recordings: 0,
            beats: 0,
            streak: 0,
            words: 0,
          }

          const unlockedMap = new Map(
            userAch.map((ua) => [ua.achievementId, ua.unlockedAt])
          )

          let points = 0
          const enriched = allAch.map((ach) => {
            const unlockedAt = unlockedMap.get(ach.id)
            if (unlockedAt) points += ach.points

            // Calculate progress for locked achievements
            const progressInfo = PROGRESS_MAP[ach.code]
            let progressCurrent: number | undefined
            let progressTarget: number | undefined
            let progressPercent: number | undefined

            if (!unlockedAt && progressInfo) {
              progressTarget = progressInfo.target
              progressCurrent = progressData[progressInfo.type]
              progressPercent = Math.min(
                100,
                (progressCurrent / progressTarget) * 100
              )
            }

            return {
              ...ach,
              unlockedAt: unlockedAt as Date | string | undefined,
              isUnlocked: !!unlockedAt,
              progressCurrent,
              progressTarget,
              progressPercent,
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
            // Ring Color based on points/tier
            const tierColor =
              ach.points >= 50
                ? '#FF9500'
                : ach.points >= 20
                  ? '#E0E0E0'
                  : '#CD7F32' // Gold, Silver, Bronze

            // For locked achievements with progress, use accent purple
            const progressColor = '#7D7AFF' // accent-purple
            const strokeColor = ach.isUnlocked
              ? tierColor
              : ach.progressPercent && ach.progressPercent > 0
                ? progressColor
                : '#333'

            // Calculate stroke offset (283 = full circle, 0 = empty)
            const circumference = 283
            const targetOffset = ach.isUnlocked
              ? 0
              : circumference -
                (circumference * (ach.progressPercent || 0)) / 100

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
                      animate={{ strokeDashoffset: targetOffset }}
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
                  <div
                    className={cn(
                      'text-[9px] mt-1 leading-tight line-clamp-2',
                      ach.isUnlocked
                        ? 'text-text-secondary'
                        : 'text-text-tertiary/70'
                    )}
                  >
                    {ach.description}
                  </div>
                  {/* Progress indicator for locked achievements */}
                  {!ach.isUnlocked && ach.progressTarget && (
                    <div className="text-[10px] mt-1 font-mono font-bold text-accent-purple">
                      {ach.progressCurrent}/{ach.progressTarget}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
