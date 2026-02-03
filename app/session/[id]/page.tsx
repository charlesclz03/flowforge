import { prisma } from '@/lib/prisma'
import { Container } from '@/components/atoms/Container'
import { Card } from '@/components/atoms/Card'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mic } from 'lucide-react'

async function getSession(id: string) {
  return prisma.freestyleSession.findUnique({
    where: { id },
    include: {
      user: true,
      beat: true,
    },
  })
}

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const sessionData = await getSession(id)

  if (!sessionData) return notFound()

  // Sign URLs
  const { createServerClient, RECORDINGS_BUCKET } =
    await import('@/lib/supabase/server')
  const supabase = createServerClient()
  const SIGNED_URL_TTL_SECONDS = 60 * 60

  let storageUrl = sessionData.storageUrl
  if (storageUrl && !storageUrl.startsWith('http')) {
    const { data } = await supabase.storage
      .from(RECORDINGS_BUCKET)
      .createSignedUrl(storageUrl, SIGNED_URL_TTL_SECONDS)
    if (data?.signedUrl) storageUrl = data.signedUrl
  }

  return (
    <Container className="py-8 max-w-xl">
      <Link
        href="/tracks"
        className="inline-flex items-center gap-2 text-text-tertiary hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Beat Vault
      </Link>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-accent-purple/20 flex items-center justify-center text-accent-purple">
            <Mic size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white max-w-[300px] truncate">
              {sessionData.title}
            </h1>
            <p className="text-sm text-text-secondary">
              by {sessionData.user.name || 'Anonymous'} •{' '}
              {sessionData.beat.title}
            </p>
          </div>
        </div>

        {storageUrl && (
          <audio controls className="w-full mt-2" src={storageUrl} />
        )}

        <div className="mt-4 text-xs text-text-tertiary flex items-center gap-4">
          <span>{new Date(sessionData.createdAt).toLocaleDateString()}</span>
          {sessionData.durationSeconds && (
            <span>{Math.round(sessionData.durationSeconds)}s duration</span>
          )}
        </div>
      </Card>
    </Container>
  )
}
