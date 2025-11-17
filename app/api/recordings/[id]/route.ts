import { NextResponse } from 'next/server'
import { getServerSessionWithUserId } from '@/lib/auth/server'
import { createServerClient, RECORDINGS_BUCKET } from '@/lib/supabase/server'
import { deleteSession, getSessionById } from '@/lib/db/sessions'

export const dynamic = 'force-dynamic'
const SIGNED_URL_TTL_SECONDS = 60 * 60

/**
 * DELETE /api/recordings/[id]
 * Delete a recording and its session
 */
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSessionWithUserId()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const recordingId = params.id

    // Get session to verify ownership and get storage path
    const sessionResult = await getSessionById(recordingId)
    if (!sessionResult.success || !sessionResult.data) {
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 })
    }

    const recordingSession = sessionResult.data

    // Verify ownership
    if (recordingSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Determine file path stored in DB (may already be a path or a URL from legacy data)
    let filePath: string | null = null
    if (recordingSession.storageUrl) {
      if (recordingSession.storageUrl.startsWith('http')) {
        const url = new URL(recordingSession.storageUrl)
        const pathMatch = url.pathname.match(/\/recordings\/(.+)$/)
        if (pathMatch) {
          filePath = pathMatch[1]
        }
      } else {
        filePath = recordingSession.storageUrl
      }
    }

    // Delete from database first
    const deleteResult = await deleteSession(recordingId)
    if (!deleteResult.success) {
      return NextResponse.json(
        { error: deleteResult.error || 'Failed to delete session' },
        { status: 500 }
      )
    }

    // Delete from storage if path exists
    if (filePath) {
      const supabase = createServerClient()
      const { error: storageError } = await supabase.storage
        .from(RECORDINGS_BUCKET)
        .remove([filePath])

      if (storageError) {
        console.error('Storage delete error (non-critical):', storageError)
        // Don't fail the request if storage delete fails (file might not exist)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/recordings/[id]
 * Get a single recording by ID
 */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSessionWithUserId()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const recordingId = params.id

    // Get session
    const sessionResult = await getSessionById(recordingId)
    if (!sessionResult.success || !sessionResult.data) {
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 })
    }

    const recordingSession = sessionResult.data

    // Verify ownership
    if (recordingSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = createServerClient()
    let signedUrl = recordingSession.storageUrl

    if (recordingSession.storageUrl && !recordingSession.storageUrl.startsWith('http')) {
      const { data: signedUrlData } = await supabase.storage
        .from(RECORDINGS_BUCKET)
        .createSignedUrl(recordingSession.storageUrl, SIGNED_URL_TTL_SECONDS)
      signedUrl = signedUrlData?.signedUrl ?? recordingSession.storageUrl
    }

    return NextResponse.json({
      recording: {
        ...recordingSession,
        storageUrl: signedUrl,
      },
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
