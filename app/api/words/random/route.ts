import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { getRandomWords } from '@/lib/db/words'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const count = parseInt(searchParams.get('count') || '10')
    const category = searchParams.get('category') || undefined
    const difficulty = searchParams.get('difficulty')
      ? parseInt(searchParams.get('difficulty')!)
      : undefined

    const result = await getRandomWords(count, {
      difficultyLevel: difficulty,
      category: category,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to fetch words' }, { status: 500 })
    }

    return NextResponse.json({
      words: result.data,
      count: result.data?.length || 0,
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
