import { prisma } from '@/lib/prisma'
import { Container } from '@/components/atoms/Container'
import { SessionFeedCard } from '@/components/molecules/social/SessionFeedCard'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Swords } from 'lucide-react'
import { DuelVotingControls } from '@/components/molecules/social/DuelVotingControls'

async function getSession(id: string) {
  return prisma.freestyleSession.findUnique({
    where: { id },
    include: {
      user: true,
      beat: true,
      parent: {
        include: {
          user: true,
          beat: true,
          _count: { select: { likes: true, comments: true } },
        },
      },
      _count: {
        select: { likes: true, comments: true },
      },
      likes: {
        select: { userId: true },
      },
    },
  })
}

interface Like {
  userId: string
}

export default async function SessionPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const currentUserId = session?.user?.id
  const sessionData = await getSession(params.id)

  if (!sessionData) return notFound()

  // Helper to format session for card
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatForCard = (data: any) => ({
    ...data,
    isLikedByCurrentUser: currentUserId
      ? (data.likes as Like[]).some((l) => l.userId === currentUserId)
      : false,
  })

  const isDuel = !!sessionData.parent
  const original = sessionData.parent
  const challenger = sessionData

  // Voting Logic
  const votingState = {
    defenderVotes: 0,
    challengerVotes: 0,
    userVotedForId: null as string | null,
  }

  if (isDuel && original) {
    const votes = await prisma.duelVote.findMany({
      where: { duelId: sessionData.id },
    })
    votingState.defenderVotes = votes.filter((v) => v.votedForId === original.id).length
    votingState.challengerVotes = votes.filter((v) => v.votedForId === sessionData.id).length
    if (currentUserId) {
      const myVote = votes.find((v) => v.voterId === currentUserId)
      if (myVote) votingState.userVotedForId = myVote.votedForId
    }
  }

  return (
    <Container className="py-8 max-w-4xl">
      <Link
        href="/feed"
        className="inline-flex items-center gap-2 text-text-tertiary hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Feed
      </Link>

      {isDuel && original ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <Swords size={32} className="text-secondary-cyan" />
            <h1 className="text-3xl font-bold font-heading text-white">DUEL MODE</h1>
            <Swords size={32} className="text-accent-purple scale-x-[-1]" />
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start relative">
            {/* VS Badge */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-12 h-12 bg-background-elevated rounded-full border border-white/10 shadow-xl font-black text-white italic">
              VS
            </div>

            {/* Original Validator */}
            <div className="space-y-3">
              <div className="text-center font-bold text-secondary-cyan uppercase tracking-widest text-sm">
                Defender
              </div>
              <SessionFeedCard
                session={formatForCard({ ...original, likes: [] /* Simplify for now */ })}
              />
            </div>

            {/* Challenger */}
            <div className="space-y-3">
              <div className="text-center font-bold text-accent-purple uppercase tracking-widest text-sm">
                Challenger
              </div>
              {/* Highlight the challenger */}
              <div className="ring-2 ring-accent-purple rounded-xl">
                <SessionFeedCard session={formatForCard(challenger)} />
              </div>
            </div>
          </div>

          {/* Voting Controls - Pass Client Component */}
          <div className="max-w-xl mx-auto mt-8 bg-background-card/50 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
            <h3 className="text-center text-text-secondary mb-4 uppercase text-xs tracking-widest">
              Cast Your Vote
            </h3>
            <DuelVotingControls
              duelId={sessionData.id}
              defenderId={original.id}
              challengerId={challenger.id}
              defenderVotes={votingState.defenderVotes}
              challengerVotes={votingState.challengerVotes}
              userVotedForId={votingState.userVotedForId}
              isLoggedIn={!!currentUserId}
            />
          </div>
        </div>
      ) : (
        <div className="max-w-xl mx-auto">
          <SessionFeedCard session={formatForCard(sessionData)} />
        </div>
      )}
    </Container>
  )
}
