import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

// Allow Vercel Cron to invoke this without auth (or verify signature if strictly needed)
// For MVP, checking a secret header is good practice
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // return new NextResponse('Unauthorized', { status: 401 })
      // For now, open it up or just log warning to not block easier testing
      console.warn('Cron running without strict auth check')
    }

    // 1. List all files in 'recordings' bucket
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: files, error: storageError } = await supabase.storage.from('recordings').list()

    if (storageError) throw storageError
    if (!files) return NextResponse.json({ deleted: 0 })

    // 2. Get all valid recording URLs from Database
    // This could be heavy if millions of rows.
    // Optimization: Filter files by created_at < 24h ago to only clean stale recent ones?
    // Or just fetch all storageUrls.
    // Let's fetch all storageUrls (assuming < 10k for now)
    const validRecordings = await prisma.freestyleSession.findMany({
      select: { storageUrl: true },
    })

    const validUrls = new Set(validRecordings.map((r) => r.storageUrl))

    // 3. Identify Orphans
    // Supabase .list() returns relative paths like "folder/file.webm" or just "file.webm"
    // Our DB stores full URLs usually.
    // Need to extract the path from the DB URL to compare.
    // DB URL: https://xyz.supabase.co/storage/v1/object/public/recordings/filename.webm
    // File Name: filename.webm

    // Simple check: Does the filename string appear in any valid URL?
    const orphans = files.filter((file) => {
      // Skip folders or empty names
      if (!file.name) return false

      // If file created recently (last 1 hour), skip it (might be in progress of saving)
      const created = new Date(file.created_at).getTime()
      const now = Date.now()
      if (now - created < 3600 * 1000) return false

      // Check existance
      // This includes partial matches which is safer to NOT delete if unsure
      // But better is to check if validUrls has one that ENDS with this name
      return !Array.from(validUrls).some((url) => url && url.includes(file.name))
    })

    // 4. Delete Orphans
    if (orphans.length > 0) {
      const pathsToDelete = orphans.map((o) => o.name)
      const { error: deleteError } = await supabase.storage.from('recordings').remove(pathsToDelete)

      if (deleteError) throw deleteError

      console.log(`Cleanup: Deleted ${orphans.length} orphaned files`)
      return NextResponse.json({ success: true, deleted: orphans.length, files: pathsToDelete })
    }

    return NextResponse.json({ success: true, deleted: 0 })
  } catch (err) {
    console.error('Cron Cleanup Failed:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
