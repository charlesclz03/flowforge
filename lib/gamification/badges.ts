import { prisma } from '@/lib/prisma'
import { FreestyleSession } from '@prisma/client'

export type BadgeType = 'Founder' | 'Night Shift' | 'Beat Mastery' | 'Dedication'

export async function checkBadgeConditions(userId: string, newSessionId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      freestyleSessions: true,
    },
  })

  if (!user) return

  const earnedBadges: BadgeType[] = []
  const currentBadges = new Set(user.badges)

  // 1. Founder: Record in first 7 days of account creation
  if (!currentBadges.has('Founder')) {
    const accountAgeDays = (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    if (accountAgeDays <= 7) {
      earnedBadges.push('Founder')
    }
  }

  // 2. Night Shift: Session between 2 AM and 5 AM
  if (!currentBadges.has('Night Shift')) {
    const currentHour = new Date().getHours() // Server time
    if (currentHour >= 2 && currentHour <= 5) {
      earnedBadges.push('Night Shift')
    }
  }

  // 3. Beat Mastery: 5 Sessions on one Beat
  if (!currentBadges.has('Beat Mastery')) {
    // Check the beat of the NEW session
    const currentSession = user.freestyleSessions.find(
      (s: FreestyleSession) => s.id === newSessionId
    )
    if (currentSession) {
      const beatId = currentSession.beatId
      const sessionsOnBeat = user.freestyleSessions.filter(
        (s: FreestyleSession) => s.beatId === beatId
      ).length
      if (sessionsOnBeat >= 5) {
        earnedBadges.push('Beat Mastery')
      }
    }
  }

  // 4. Dedication: 10 Total Sessions
  if (!currentBadges.has('Dedication')) {
    if (user.freestyleSessions.length >= 10) {
      earnedBadges.push('Dedication')
    }
  }

  if (earnedBadges.length > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        badges: {
          push: earnedBadges,
        },
      },
    })
    return earnedBadges
  }

  return []
}
