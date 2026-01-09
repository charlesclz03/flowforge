import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'

export async function POST() {
  // Mock room creation
  // In a real app, this would create a DB entry or Liveblocks room
  const roomId = nanoid(6).toUpperCase()

  return NextResponse.json({
    roomId,
    success: true,
  })
}
