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
  // Fetch raw data
  const sessionData = await getSession(params.id)

  if (!sessionData) return notFound()

  // Sign URLs (Logic duplicated from Feed for now, but essential)
  const { createServerClient, RECORDINGS_BUCKET } = await import('@/lib/supabase/server')
  const supabase = createServerClient()
  const SIGNED_URL_TTL_SECONDS = 60 * 60

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const signSession = async (s: any) => {
    if (!s || !s.storageUrl || s.storageUrl.startsWith('http')) return s
    const { data } = await supabase.storage
      .from(RECORDINGS_BUCKET)
      .createSignedUrl(s.storageUrl, SIGNED_URL_TTL_SECONDS)
    return { ...s, storageUrl: data?.signedUrl || s.storageUrl }
  }

  // Sign both main session and parent if exists
  const signedSession = await signSession(sessionData)
  if (signedSession.parent) {
    signedSession.parent = await signSession(signedSession.parent)
  }

  // Use signed data onwards
  const finalSession = signedSession

  // Helper to format session for card
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatForCard = (data: any) => ({
    ...data,
    isLikedByCurrentUser: currentUserId
      ? (data.likes as Like[]).some((l) => l.userId === currentUserId)
      : false,
  })

  const isDuel = !!finalSession.parent
  const original = finalSession.parent
  const challenger = finalSession

  // Check if user voted in this duel context
  const userVote =
    isDuel && currentUserId && original
      ? await prisma.duelVote.findUnique({
          where: {
            voterId_duelId: {
              voterId: currentUserId,
              duelId: original.id,
            },
          },
        })
      : null

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
              <SessionFeedCard session={formatForCard({ ...original, likes: [] })} />
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

          <div className="mt-8 max-w-md mx-auto">
            <DuelVotingControls
              duelId={original.id}
              initialVotedFor={userVote?.votedForId}
              contestants={[
                {
                  id: original.id,
                  username: original.user?.username || 'Defender',
                  role: 'defender',
                },
                {
                  id: challenger.id,
                  username: challenger.user?.username || 'Challenger',
                  role: 'challenger',
                },
              ]}
            />
          </div>
        </div>
      ) : (
        <div className="max-w-xl mx-auto">
          <SessionFeedCard session={formatForCard(finalSession)} />
        </div>
      )}
    </Container>
  )
}
