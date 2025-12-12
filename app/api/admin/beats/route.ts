import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/constants/auth'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase Admin Client for Storage Upload (Bypass RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    // 1. Check Auth using NextAuth
    const session = await getServerSession(authOptions)
    if (!session || !isAdmin(session.user?.email)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // 2. Parse Form Data
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    // const coverFile = formData.get('cover') as File // Unused
    const title = formData.get('title') as string
    const producer = formData.get('producer') as string
    const bpm = parseInt(formData.get('bpm') as string)
    const genre = formData.get('genre') as string
    const difficulty = formData.get('difficulty') as string
    // const mood = formData.get('mood') as string // Unused

    if (!audioFile) {
      return new NextResponse('Audio file required', { status: 400 })
    }

    // 3. Upload Audio to Supabase Storage (beats bucket)
    const audioPath = `${Date.now()}-${audioFile.name}`.replace(/\s/g, '_')

    // Validating file type briefly
    if (!audioFile.type.startsWith('audio/')) {
      return new NextResponse('Invalid file type. Please upload audio.', { status: 400 })
    }

    // Buffer conversion for Node environment upload if needed,
    // but supabase-js works with File/Blob usually.
    // However, in Next.js App Router route handlers, 'File' from formData is standard.
    // supabase-js v2 supports passing the File object directly.

    const { error: audioError } = await supabaseAdmin.storage
      .from('beats')
      .upload(audioPath, audioFile, {
        contentType: audioFile.type,
        upsert: false,
      })

    if (audioError) throw new Error(`Storage Error: ${audioError.message}`)

    // 4. Upload Cover (Optional) - Skipped per schema constraints
    // const coverUrl = null
    // Ignoring cover upload logic for MVP simplicity/robustness unless needed,
    // but schema has no 'cover_image' field?
    // Wait, checking schema...
    // Model Beat: id, title, bpm, storageUrl, isPremium, genre, duration, artistName, difficulty ...
    // There is NO 'coverImage' field in the Prisma schema!
    // I will skip cover upload to avoid DB errors.

    // Get Public URL
    const {
      data: { publicUrl: audioUrl },
    } = supabaseAdmin.storage.from('beats').getPublicUrl(audioPath)

    // 5. Insert into Database via Prisma
    const beat = await prisma.beat.create({
      data: {
        title,
        artistName: producer, // Mapping producer -> artistName
        bpm,
        genre,
        difficulty, // "Easy", "Medium", "Hard"
        storageUrl: audioUrl,
        isPremium: true, // Auto-mark admin uploads as premium for now
        // mood is not in schema directly?
        // Schema has: title, bpm, storageUrl, isPremium, genre, duration, artistName, difficulty.
        // It does NOT have 'mood'.
        // I will omit mood.
      },
    })

    return NextResponse.json({ success: true, beat })
  } catch (err: any) {
    console.error('Upload Error:', err)
    return new NextResponse(err.message || 'Internal Server Error', { status: 500 })
  }
}
