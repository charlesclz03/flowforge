import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Container } from '@/components/atoms/Container'
import { Card } from '@/components/atoms/Card'
import { Button } from '@/components/atoms/Button'
import Link from 'next/link'
import { Mic } from 'lucide-react'

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
        <Card
          padding="sm"
          className="overflow-hidden shadow-2xl border-white/10 p-6"
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-20 h-20 rounded-full bg-accent-purple/20 flex items-center justify-center text-accent-purple shadow-inner">
              <Mic size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white max-w-[300px] truncate">
                {session.user.name || 'Anonymous'}
              </h2>
              <p className="text-text-secondary text-sm">
                {session.beat.title}
              </p>
            </div>

            {/* Audio */}
            {session.storageUrl && (
              <audio
                controls
                className="w-full mt-2"
                src={session.storageUrl}
              />
            )}
          </div>
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
