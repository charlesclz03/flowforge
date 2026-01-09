import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Container } from '@/components/atoms/Container'
import { Trophy } from 'lucide-react'
import Link from 'next/link'
import { AchievementsDisplay } from '@/components/organisms/profile/AchievementsDisplay'
import { OnboardingLayout } from '@/components/organisms/layout/OnboardingLayout'
import { XPBar } from '@/components/molecules/gamification/XPBar'

// Cache for 60 seconds
export const revalidate = 60

export default async function AchievementsPage() {
  const session = await getServerSession(authOptions)
  // Suppress unused variable warning
  void session

  return (
    <OnboardingLayout
      showBackButton={false}
      showSettings={true}
      className="bg-background"
    >
      <Container className="pt-8 pb-32">
        <div className="mb-4">
          <XPBar current={1200} max={2000} level={5} />
          <Link href="/cypher">
            <div className="mt-4 w-full p-4 rounded-xl bg-gradient-to-r from-accent-purple/20 to-accent-cyan/20 border border-white/10 flex items-center justify-between hover:border-accent-purple/50 transition-all group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-accent-purple/20 text-accent-purple group-hover:scale-110 transition-transform">
                  <Trophy size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white">Enter the Cypher</h3>
                  <p className="text-xs text-text-secondary">
                    Join live multiplayer sessions
                  </p>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-white group-hover:bg-white/20 transition-colors">
                Play Now
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-8 space-y-4 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-white">Achievements</h2>
          <AchievementsDisplay />
        </div>
      </Container>
    </OnboardingLayout>
  )
}
