import { NextResponse } from 'next/server'
import { verifySuperAdmin } from '@/lib/auth/admin'

export async function POST() {
  try {
    await verifySuperAdmin()
    return NextResponse.json(
      {
        error: 'Deprecated endpoint',
        message:
          'Use signed direct upload flow: POST /api/upload/signed-url then POST /api/admin/beats/upload.',
        migration: {
          signedUploadUrlEndpoint: '/api/upload/signed-url',
          metadataEndpoint: '/api/admin/beats/upload',
        },
      },
      { status: 410 }
    )
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      if (error.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
