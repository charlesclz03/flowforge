import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

// Mock dictionary for 'sentiment' analysis until we have a real LLM
const POSITIVE_WORDS = [
  'flow',
  'glow',
  'shine',
  'rise',
  'best',
  'win',
  'yeah',
  'yo',
  'love',
  'peace',
  'hype',
  'energy',
]
const AGGRESSIVE_WORDS = [
  'battle',
  'kill',
  'crush',
  'fight',
  'war',
  'hard',
  'beast',
  'monster',
  'attack',
]
const REFLECTIVE_WORDS = [
  'think',
  'mind',
  'soul',
  'world',
  'life',
  'time',
  'past',
  'future',
  'dream',
]

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { words, bpm } = await req.json()

    // Simple Heuristic Analysis
    let vibe = 'Neutral Flow'
    let score = 50
    let description = 'Just vibing.'

    let positiveCount = 0
    let aggressiveCount = 0
    let reflectiveCount = 0

    const wordList = (words || []).map((w: string) => w.toLowerCase())

    wordList.forEach((word: string) => {
      if (POSITIVE_WORDS.some((p) => word.includes(p))) positiveCount++
      if (AGGRESSIVE_WORDS.some((a) => word.includes(a))) aggressiveCount++
      if (REFLECTIVE_WORDS.some((r) => word.includes(r))) reflectiveCount++
    })

    // Determine Vibe
    if (aggressiveCount > positiveCount && aggressiveCount > reflectiveCount) {
      vibe = 'Aggressive Spitfire'
      score = 80 + Math.min(aggressiveCount * 2, 20)
      description =
        'You came with the heat! High energy and battle-ready bars detected.'
    } else if (
      reflectiveCount > positiveCount &&
      reflectiveCount > aggressiveCount
    ) {
      vibe = 'Conscious Lyrical'
      score = 85 + Math.min(reflectiveCount * 2, 15)
      description =
        'Deep thoughts detected. You are telling a story and painting a picture.'
    } else if (positiveCount > 0) {
      vibe = 'Feel-Good Flow'
      score = 90
      description = 'Positive energy! You are having fun with it.'
    } else if (bpm > 120) {
      vibe = 'High Speed Chase'
      score = 75
      description = 'Fast tempo, trying to keep up!'
    } else {
      vibe = 'Chill Freestyle'
      score = 70
      description = 'Laid back session. Smooth sailing.'
    }

    return NextResponse.json({
      vibe,
      score,
      description,
      analysis: {
        positive: positiveCount,
        aggressive: aggressiveCount,
        reflective: reflectiveCount,
      },
    })
  } catch (error) {
    console.error('Vibe Check Error:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
