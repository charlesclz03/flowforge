'use client'

import { BentoCard } from "@/components/atoms/BentoGrid"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimerCardProps {
  duration: number
  isRecording: boolean
  countdown: number | 'GO' | null
  className?: string
}

export function TimerCard({ duration, isRecording, countdown, className }: TimerCardProps) {
  const minutes = Math.floor(duration / 60)
  const seconds = Math.round(duration % 60)

  return (
    <BentoCard 
      title="Session Time" 
      icon={<Clock size={16} className={cn(isRecording ? "text-accent-red animate-pulse" : "text-text-secondary")} />}
      className={cn("col-span-1 md:col-span-2 lg:col-span-3", className)}
    >
      <div className="flex-1 flex items-center justify-center">
        {countdown ? (
           <div className="text-6xl font-black text-accent-cyan animate-in zoom-in duration-300">
             {countdown}
           </div>
        ) : (
           <div className="flex flex-col items-center">
             <div className={cn(
               "text-4xl font-mono font-bold tracking-wider tabular-nums",
               isRecording ? "text-accent-red" : "text-white"
             )}>
                {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
             </div>
             {isRecording && (
               <div className="flex items-center gap-1.5 mt-2">
                 <div className="w-2 h-2 rounded-full bg-accent-red animate-ping" />
                 <span className="text-xs font-bold text-accent-red uppercase tracking-widest">Recording</span>
               </div>
             )}
           </div>
        )}
      </div>
    </BentoCard>
  )
}
