import { NextResponse } from 'next/server'
import { getServerSessionWithUserId } from '@/lib/auth/server'
import { createServerClient, RECORDINGS_BUCKET } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSessionWithUserId()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sessionId = params.id
    const formData = await request.formData()
    const masterBlob = formData.get('audio') as File

    if (!masterBlob) {
      return NextResponse.json({ error: 'No audio provided' }, { status: 400 })
    }

    // 1. Verify ownership
    const dbSession = await prisma.freestyleSession.findUnique({
      where: { id: sessionId },
      select: { userId: true },
    })

    if (!dbSession || dbSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 })
    }

    // 2. Upload to Supabase
    const filePath = `${session.user.id}/${sessionId}_master.wav`

    const supabase = createServerClient()
    const { error: uploadError } = await supabase.storage
      .from(RECORDINGS_BUCKET)
      .upload(filePath, masterBlob, {
        contentType: 'audio/wav',
        upsert: true,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // 3. Update DB
    await prisma.freestyleSession.update({
      where: { id: sessionId },
      data: { storageUrl: filePath },
    })

    return NextResponse.json({ success: true, storageUrl: filePath })
  } catch (err) {
    console.error('Master upload error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
