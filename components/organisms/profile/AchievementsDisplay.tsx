'use client'

import { useEffect, useState } from 'react'
import { Achievement, UserAchievement } from '@prisma/client'
import { cn } from '@/lib/utils'
import { Trophy, Lock } from 'lucide-react'

// Extended type for client usage
type EnrichedAchievement = Achievement & {
    unlockedAt?: Date | string
    isUnlocked: boolean
}

export function AchievementsDisplay() {
  const [achievements, setAchievements] = useState<EnrichedAchievement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({ totalPoints: 0, unlockedCount: 0, totalCount: 0 })

  useEffect(() => {
    async function fetchAchievements() {
      try {
        const res = await fetch('/api/user/achievements')
        if (res.ok) {
           const data = await res.json()
           const userAch = data.userAchievements as (UserAchievement & { achievement: Achievement })[]
           const allAch = data.allAchievements as Achievement[]
           
           const unlockedMap = new Map(userAch.map(ua => [ua.achievementId, ua.unlockedAt]))
           
           let points = 0
           const enriched = allAch.map(ach => {
               const unlockedAt = unlockedMap.get(ach.id)
               if (unlockedAt) points += ach.points
               return {
                   ...ach,
                   unlockedAt: unlockedAt as (Date | string | undefined),
                   isUnlocked: !!unlockedAt
               }
           })

           // Sort: Unlocked first, then by points
           enriched.sort((a, b) => {
               if (a.isUnlocked && !b.isUnlocked) return -1
               if (!a.isUnlocked && b.isUnlocked) return 1
               return a.points - b.points // Lower points (easier?) first
           })

           setAchievements(enriched)
           setStats({
               totalPoints: points,
               unlockedCount: userAch.length,
               totalCount: allAch.length
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
    <div className="space-y-4">
       <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Achievements</h3>
          <div className="text-sm text-text-secondary">
             <span className="text-accent-purple font-bold">{stats.unlockedCount}</span>/{stats.totalCount} ({stats.totalPoints} PTS)
          </div>
       </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {achievements.map(ach => (
              <div 
                key={ach.id}
                className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border transition-all",
                    ach.isUnlocked 
                      ? "bg-accent-purple/10 border-accent-purple/30"
                      : "bg-white/5 border-white/5 opacity-60"
                )}
              >
                 <div className={cn(
                     "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                     ach.isUnlocked ? "bg-accent-purple text-white" : "bg-white/10 text-white/30"
                 )}>
                     {ach.isUnlocked ? <Trophy size={18} /> : <Lock size={18} />}
                 </div>
                 <div className="min-w-0 flex-1">
                     <div className={cn("font-medium text-sm truncate", ach.isUnlocked ? "text-white" : "text-text-secondary")}>
                         {ach.name}
                     </div>
                     <div className="text-xs text-text-tertiary truncate">
                         {ach.description}
                     </div>
                 </div>
                 <div className="text-xs font-mono font-medium text-text-tertiary whitespace-nowrap">
                    {ach.points} pts
                 </div>
              </div>
          ))}
       </div>
    </div>
  )

}
