import { NextResponse } from 'next/server'
import { getServerSessionWithUserId } from '@/lib/auth/server'
import {
  isUsernameAvailable,
  validateUsernameCandidate,
} from '@/lib/auth/username'

export async function GET(request: Request) {
  const session = await getServerSessionWithUserId()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username') || ''
  const validation = validateUsernameCandidate(username)

  if (validation.error) {
    return NextResponse.json(
      {
        available: false,
        normalized: validation.normalized,
        error: validation.error,
      },
      { status: 400 }
    )
  }

  const available = await isUsernameAvailable(
    validation.normalized,
    session.user.id
  )

  return NextResponse.json({
    available,
    normalized: validation.normalized,
    error: available ? null : 'That username is already taken.',
  })
}
