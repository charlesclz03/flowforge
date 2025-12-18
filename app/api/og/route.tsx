import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    // Dynamic params for the Stat Card
    const username = searchParams.get('username') || 'Hip-Hop Head'
    const score = searchParams.get('score') || '0'
    const rank = searchParams.get('rank') || 'SoundCloud Rapper'
    const beat = searchParams.get('beat') || 'None'

    return new ImageResponse(
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000',
          backgroundImage: 'radial-gradient(circle at center, #1a1a1a 0%, #000 100%)',
          color: '#fff',
          fontFamily: 'sans-serif',
          padding: '40px',
          border: '2px solid #5b21b6',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            fontSize: 32,
            fontWeight: 'bold',
            color: '#9333ea',
            marginBottom: 20,
          }}
        >
          FLOWFORGE
        </div>

        {/* User Info */}
        <div style={{ display: 'flex', fontSize: 48, marginBottom: 10 }}>{username}</div>
        <div
          style={{
            display: 'flex',
            fontSize: 24,
            color: '#a1a1aa',
            marginBottom: 40,
          }}
        >
          {rank}
        </div>

        {/* Stats Box */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '20px',
            padding: '30px 60px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginRight: 60,
            }}
          >
            <div style={{ fontSize: 18, color: '#a1a1aa', textTransform: 'uppercase' }}>
              Flow Points
            </div>
            <div style={{ fontSize: 64, fontWeight: 'bold', color: '#f97316' }}>{score}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 18, color: '#a1a1aa', textTransform: 'uppercase' }}>
              Mastered Beat
            </div>
            <div style={{ fontSize: 32, fontWeight: 'bold' }}>{beat}</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', marginTop: 40, fontSize: 18, color: '#71717a' }}>
          Unleash your flow at flowforge.app
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e) {
    const error = e as Error
    console.log(`${error.message}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}
