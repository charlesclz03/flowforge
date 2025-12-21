'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function XPBar() {
  const [progress, setProgress] = useState(0)
  const [level, setLevel] = useState(1)
  const [totalPoints, setTotalPoints] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchXP() {
      try {
        const res = await fetch('/api/user/achievements')
        if (res.ok) {
          const data = await res.json()
          // Calculate XP for level
          // Simple logic: 100 XP per level for now, or just show total points?
          // Request said "Battle pass design of achievements point XP bar"

          let points = 0
          if (data.userAchievements && data.allAchievements) {
            const unlockedMap = new Set(data.userAchievements.map((ua: any) => ua.achievementId))
            data.allAchievements.forEach((ach: any) => {
              if (unlockedMap.has(ach.id)) points += ach.points
            })
          }

          setTotalPoints(points)

          const pointsPerLevel = 500
          const currentLevel = Math.floor(points / pointsPerLevel) + 1
          const levelProgress = ((points % pointsPerLevel) / pointsPerLevel) * 100

          setLevel(currentLevel)
          setProgress(levelProgress)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchXP()
  }, [])

  if (isLoading) return <div className="h-16 w-full animate-pulse bg-white/5 rounded-xl" />

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent-purple text-white uppercase tracking-wider">
            Season 1
          </span>
          <span className="text-xs font-bold text-white uppercase tracking-widest">Origins</span>
        </div>
        <div className="text-xs font-mono text-accent-cyan">
          {totalPoints} / {level * 500} XP
        </div>
      </div>

      <div className="relative h-16 w-full bg-black/40 border border-white/10 rounded-xl overflow-hidden flex items-center px-4">
        {/* Progress Track */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/10 -translate-y-1/2" />

        {/* Progress Fill */}
        <motion.div
          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-accent-purple to-accent-cyan -translate-y-1/2"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
        />

        {/* Nodes */}
        <div className="relative z-10 w-full flex justify-between items-center">
          {/* Previous Level Node */}
          <div className="flex flex-col items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-accent-purple border-2 border-black shadow-[0_0_10px_rgba(125,122,255,0.5)]" />
            <div className="text-[10px] font-bold text-text-secondary">Lvl {level}</div>
          </div>

          {/* Mid-way Ticks */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                'h-2 w-2 rounded-full',
                progress > i * 25 ? 'bg-accent-cyan' : 'bg-white/10'
              )}
            />
          ))}

          {/* Next Points Reward Node */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={cn(
                'h-8 w-8 rounded-lg flex items-center justify-center border-2 transition-colors',
                progress >= 100
                  ? 'bg-accent-orange border-accent-orange animate-pulse'
                  : 'bg-white/5 border-white/20'
              )}
            >
              <span className="text-xs">🎁</span>
            </div>
            <div className="text-[10px] font-bold text-text-secondary">Lvl {level + 1}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
