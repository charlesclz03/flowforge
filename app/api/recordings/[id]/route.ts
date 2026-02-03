import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createServerClient, RECORDINGS_BUCKET } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    // Allow public access - we check permissions later based on isPublic flag
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Recording ID is required' },
        { status: 400 }
      )
    }

    const recording = await prisma.freestyleSession.findUnique({
      where: {
        id,
      },
      include: {
        beat: true,
        user: true,
      },
    })

    if (!recording) {
      return NextResponse.json(
        { error: 'Recording not found' },
        { status: 404 }
      )
    }

    // specific check: Does this recording belong to the user?
    // OR is it public?
    // We get the user ID from the database using email to be safe, or assume session.user.id is correct if populated

    // If public, allow access (skip ownership check)
    // IMPORTANT: The `isPublic` field defaults to true for now
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isPublic = (recording as any).isPublic ?? true

    if (!isPublic) {
      if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      })

      if (!user || recording.userId !== user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    // 3. Generate Signed URL if needed
    let signedUrl = recording.storageUrl
    if (recording.storageUrl && !recording.storageUrl.startsWith('http')) {
      const supabase = createServerClient()
      const { data } = await supabase.storage
        .from(RECORDINGS_BUCKET)
        .createSignedUrl(recording.storageUrl, 60 * 60) // 1 hour

      if (data?.signedUrl) {
        signedUrl = data.signedUrl
      }
    }

    return NextResponse.json({
      recording: {
        ...recording,
        storageUrl: signedUrl,
      },
    })
  } catch (error) {
    console.error('Error fetching recording:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { fxConfig } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Recording ID is required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    const recording = await prisma.freestyleSession.findUnique({
      where: { id },
    })

    if (!recording || !user || recording.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update
    const updated = await prisma.freestyleSession.update({
      where: { id },
      data: {
        fxConfig: (fxConfig as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      },
    })

    return NextResponse.json({ success: true, recording: updated })
  } catch (error) {
    console.error('Error updating recording:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // 1. Verify ownership and get storage URL
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const recording = await prisma.freestyleSession.findUnique({
      where: { id },
    })

    if (!recording) {
      return NextResponse.json(
        { error: 'Recording not found' },
        { status: 404 }
      )
    }

    if (recording.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // 2. Delete from Supabase Storage
    if (recording.storageUrl) {
      // Extract file path from URL
      // storageUrl format: https://[project].supabase.co/storage/v1/object/public/recordings/[userId]/[filename]
      // We need: [userId]/[filename]

      const parts = recording.storageUrl.split('/recordings/')
      if (parts.length === 2) {
        const filePath = parts[1]
        const supabase = createServerClient()
        const { error: storageError } = await supabase.storage
          .from(RECORDINGS_BUCKET)
          .remove([filePath])

        if (storageError) {
          console.error('Error deleting file from Supabase:', storageError)
          // Continue to delete from DB even if storage fails, to keep DB clean?
          // Usually yes, or warn. Let's log it but proceed.
        }
      }
    }

    // 3. Delete from Database
    await prisma.freestyleSession.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting recording:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
