import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // 1. Fetch Beat to verify ownership
    const beat = await prisma.beat.findUnique({
      where: { id },
    })

    if (!beat) {
      return NextResponse.json({ error: 'Beat not found' }, { status: 404 })
    }

    // 2. Check Ownership (or Admin)
    const isOwner = beat.uploaderId === session.user.id
    const isAdmin = session.user.role === 'SUPERADMIN' // or whatever role check

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 3. Delete from Storage (if it's a supabase-hosted file)
    if (beat.storageUrl.includes(supabaseUrl)) {
      // Extract path from URL
      // URL format: https://[project].supabase.co/storage/v1/object/public/audio/users/[userId]/[filename]
      const path = beat.storageUrl.split('/audio/')[1]
      if (path) {
        const { error: storageError } = await supabase.storage.from('audio').remove([path])
        if (storageError) {
          console.error('Storage Delete Error:', storageError)
          // We continue to delete from DB even if storage fails, to avoid orphaned DB records (better to have orphaned files than broken DB links)
        }
      }
    }

    // 4. Delete from DB
    await prisma.beat.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete Beat Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
