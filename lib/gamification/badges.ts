import { prisma } from '@/lib/prisma'
import { FreestyleSession } from '@prisma/client'

export type BadgeType =
  | 'Founder'
  | 'Night Shift'
  | 'Beat Mastery'
  | 'Dedication'
  | 'Machine Gun'
  | 'Perfectionist'
  | 'The Listener'

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

  const currentSession = user.freestyleSessions.find((s: FreestyleSession) => s.id === newSessionId)

  // 5. Machine Gun: Hard Mode + 4 Bar Frequency
  if (!currentBadges.has('Machine Gun') && currentSession) {
    if (currentSession.difficulty >= 3 && currentSession.frequency <= 4) {
      earnedBadges.push('Machine Gun')
    }
  }

  // 6. Perfectionist: 5 Restarts in a session
  if (!currentBadges.has('Perfectionist') && currentSession) {
    // Assuming 'restarts' is stored in metadata OR we check session record
    const meta = (currentSession as any).metadata || {}
    if ((currentSession as any).restarts >= 5 || meta.restarts >= 5) {
      earnedBadges.push('Perfectionist')
    }
  }

  // 7. The Listener: 10 Playbacks in a session
  if (!currentBadges.has('The Listener') && currentSession) {
    const meta = (currentSession as any).metadata || {}
    if ((currentSession as any).playbacks >= 10 || meta.playbacks >= 10) {
      earnedBadges.push('The Listener')
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
