import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Container } from '@/components/atoms/Container'
import { Card } from '@/components/atoms/Card'
import { Button } from '@/components/atoms/Button'
import { SharedSessionPlayer } from '@/components/organisms/social/SharedSessionPlayer'
import Link from 'next/link'

interface ListenPageProps {
  params: {
    id: string
  }
}

async function getSession(id: string) {
  const session = await prisma.freestyleSession.findUnique({
    where: { id },
    include: {
      user: true,
      beat: true,
      _count: {
        select: { likes: true, comments: true },
      },
    },
  })
  return session
}

export async function generateMetadata({ params }: ListenPageProps) {
  const session = await getSession(params.id)

  if (!session) {
    return {
      title: 'Flow Not Found | FlowForge',
    }
  }

  const title = `Freestyle by ${session.user.name || 'Anonymous'} | FlowForge`
  const description = `Listen to this freestyle over "${session.beat.title}" recorded on FlowForge. Create your own today!`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: session.user.image ? [{ url: session.user.image }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: session.user.image ? [session.user.image] : [],
    },
  }
}

export default async function ListenPage({ params }: ListenPageProps) {
  const session = await getSession(params.id)

  if (!session) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-background-elevated">
      <Container className="max-w-md w-full space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-accent-purple to-accent-cyan">
              FLOWFORGE
            </h1>
          </Link>
          <p className="text-text-secondary">Listen to this flow</p>
        </div>

        {/* Player Card */}
        <Card padding="sm" className="overflow-hidden shadow-2xl border-white/10">
          <SharedSessionPlayer
            title={session.beat.title}
            artist={session.user.name || 'Anonymous'}
            audioUrl={session.storageUrl || ''}
            avatarUrl={session.user.image}
            duration={session.durationSeconds}
            likes={session._count.likes}
          />
        </Card>

        {/* CTA */}
        <div className="text-center space-y-4">
          <p className="text-sm text-text-tertiary">
            Want to record your own freestyle over this beat?
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/" className="w-full">
              <Button
                size="lg"
                className="w-full bg-accent-cyan hover:bg-accent-cyan-bright text-black font-bold"
              >
                Start Rapping Now
              </Button>
            </Link>
            <Link href="/" className="w-full">
              <Button variant="ghost" className="w-full text-text-secondary">
                Download App
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  )
}
