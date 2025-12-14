import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { DuelView } from '@/components/organisms/social/DuelView'
import { Metadata } from 'next'

interface DuelPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: DuelPageProps): Promise<Metadata> {
  const session = await prisma.freestyleSession.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      parent: {
        include: { user: true },
      },
    },
  })

  if (!session || !session.parent) {
    return {
      title: 'Duel Not Found - FlowForge',
    }
  }

  return {
    title: `${session.user.username || 'Challenger'} vs ${session.parent.user.username || 'Original'} - FlowForge Duel`,
    description: 'Vote for the best freestyle flow!',
  }
}

export const dynamic = 'force-dynamic'

export default async function DuelPage({ params }: DuelPageProps) {
  const session = await prisma.freestyleSession.findUnique({
    where: { id: params.id },
    include: {
      beat: true,
      user: true,
      parent: {
        include: { user: true },
      },
      _count: {
        select: {
          duelVotesWon: true,
        },
      },
    },
  })

  if (!session) {
    return notFound()
  }

  // If this session has no parent, it's not a duel response.
  // Ideally, we redirect to a "Listen" or "Profile" page, but for now we can't duel without a parent.
  // OR: If it's a parent, maybe we show a list of challengers?
  // Let's assume [id] MUST be a response for this specific view.
  if (!session.parent) {
    // If it's a "Seed" session, maybe redirect to practice to challenge it?
    // redirect(`/practice?challengeId=${session.id}`)
    // Let's just show 404 for "Not a Duel" for now to keep scope tight.
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">This session is not a duel response.</h1>
        <a
          href={`/practice?challengeId=${session.id}`}
          className="px-4 py-2 bg-accent-primary rounded-full text-black font-bold"
        >
          Challenge this Beat!
        </a>
      </div>
    )
  }

  // Fetch parent's vote count too?

  // Actually, wait.
  // DuelVote Logic:
  // duelId = The "Context" ID.
  // Which ID is the context?
  // If I Challenge Session A (ID: A) to create Session B (ID: B).
  // Parent = A. Child = B.
  // Ideally, the "Duel Context" is A? Or do we create a separate "Duel" record?
  // Schema: `model DuelVote { duelId ... }` and `duel FreestyleSession @relation("DuelContext" ...)`
  // So the "Duel Context" IS a session.
  // Logic: The "Parent" Session ID is used as the `duelId` (Context).
  // Matches "One Challenge, Many Responses".

  // So for this specific 1v1 (A vs B):
  // We want votes where `duelId` = A AND (`votedForId` = A OR `votedForId` = B).

  const challengerVotes = session._count.duelVotesWon
  // Parent votes in THIS specific context (vs this specific challenger)??
  // The current schema puts all votes for A in one bucket if we use `duelId` = A.
  // If 10 people challenge A...
  // Vote 1: User X votes for A (in context A).
  // Vote 2: User Y votes for B (in context A).
  // Vote 3: User Z votes for C (in context A).
  // If we just count `votedForId`, we see A has 1 vote, B has 1, C has 1.
  // This works for a "free for all" on that beat.
  // Correct.

  const parentVotes = await prisma.duelVote.count({
    where: {
      duelId: session.parentId!,
      votedForId: session.parentId!,
    },
  })

  return (
    <div className="min-h-screen bg-background pt-20 px-4 pb-10">
      <DuelView
        parentSession={session.parent}
        challengerSession={session}
        parentVotes={parentVotes}
        challengerVotes={challengerVotes}
      />
    </div>
  )
}
