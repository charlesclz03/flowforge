import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  createServerClient,
  RECORDINGS_BUCKET,
  BEATS_BUCKET,
} from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const maxDuration = 30

const looksLikeMissingBucket = (message?: string) =>
  Boolean(message && /bucket.+(not found|does not exist)/i.test(message))

/**
 * Generates a signed URL for direct-to-Supabase uploads.
 * This bypasses the Vercel serverless function body size limit.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { fileName, contentType, bucket: requestedBucket } = await req.json()

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: 'Missing fileName or contentType' },
        { status: 400 }
      )
    }

    // Pro Check
    const { prisma } = await import('@/lib/prisma')
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionStatus: true, role: true },
    })

    const isPro =
      user?.subscriptionStatus === 'active' ||
      user?.subscriptionStatus === 'trialing' ||
      user?.role === 'SUPERADMIN' ||
      session.user.role === 'SUPERADMIN'

    if (!isPro) {
      return NextResponse.json(
        { error: 'Pro subscription required' },
        { status: 403 }
      )
    }

    // Initialize Supabase with service role key for signed URL generation
    const supabase = createServerClient()

    // Determine bucket (default to recordings, allow 'beats' for admins)
    const effectiveRole = user?.role || session.user.role
    const targetBucket =
      effectiveRole === 'SUPERADMIN' && requestedBucket === 'beats'
        ? BEATS_BUCKET
        : RECORDINGS_BUCKET

    // Generate a unique file path
    const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase()
    const storagePath =
      targetBucket === BEATS_BUCKET
        ? `library/${Date.now()}-${safeName}`
        : `users/${session.user.id}/${Date.now()}-${safeName}`

    // Create a signed URL valid for 5 minutes (300 seconds)
    let { data, error } = await supabase.storage
      .from(targetBucket)
      .createSignedUploadUrl(storagePath)

    // Self-heal: create bucket on demand if missing, then retry once.
    if (error && looksLikeMissingBucket(error.message)) {
      const { error: bucketError } = await supabase.storage.createBucket(
        targetBucket,
        {
          public: true,
        }
      )

      if (
        bucketError &&
        !/already exists|duplicate/i.test(bucketError.message ?? '')
      ) {
        console.error('Bucket create error:', bucketError)
      } else {
        const retry = await supabase.storage
          .from(targetBucket)
          .createSignedUploadUrl(storagePath)
        data = retry.data
        error = retry.error
      }
    }

    if (error) {
      console.error('Signed URL Error:', error)
      return NextResponse.json(
        {
          error: error.message || 'Failed to create upload URL',
          code: 'SIGNED_URL_CREATE_FAILED',
          bucket: targetBucket,
        },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        {
          error: 'Signed URL provider returned an empty response',
          code: 'SIGNED_URL_EMPTY_RESPONSE',
          bucket: targetBucket,
        },
        { status: 500 }
      )
    }

    // Also return the public URL for after the upload completes
    const { data: publicData } = supabase.storage
      .from(targetBucket)
      .getPublicUrl(storagePath)

    return NextResponse.json({
      signedUrl: data.signedUrl,
      token: data.token,
      publicUrl: publicData.publicUrl,
      storagePath,
    })
  } catch (error) {
    console.error('Signed URL Generation Error:', error)

    const message =
      error instanceof Error ? error.message : 'Internal Server Error'

    return NextResponse.json(
      { error: message, code: 'SIGNED_URL_ROUTE_FAILED' },
      { status: 500 }
    )
  }
}
