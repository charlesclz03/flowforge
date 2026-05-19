import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

const BRAND = {
  ink: '#05060b',
  panel: 'rgba(9, 12, 24, 0.86)',
  line: 'rgba(255, 255, 255, 0.16)',
  text: '#f8fbff',
  muted: '#aab4c5',
  purple: '#8b7cff',
  cyan: '#38d9ff',
  orange: '#ff9f43',
  pink: '#ff4fa3',
}

function Badge({ children }: { children: string }) {
  return (
    <div
      style={{
        display: 'flex',
        borderRadius: 999,
        border: `1px solid ${BRAND.line}`,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        color: BRAND.text,
        fontSize: 22,
        fontWeight: 700,
        letterSpacing: 1.2,
        padding: '12px 20px',
        textTransform: 'uppercase',
      }}
    >
      {children}
    </div>
  )
}

function BrandPreview({ isFeature }: { isFeature: boolean }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: BRAND.ink,
        backgroundImage: `radial-gradient(circle at 18% 20%, ${BRAND.purple}44 0, transparent 28%), radial-gradient(circle at 82% 18%, ${BRAND.cyan}3d 0, transparent 24%), linear-gradient(135deg, #05060b 0%, #101729 48%, #070812 100%)`,
        color: BRAND.text,
        fontFamily: 'Inter, Arial, sans-serif',
        padding: isFeature ? '42px 56px' : '58px 70px',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: 64,
          right: 64,
          top: isFeature ? 34 : 46,
          height: 2,
          backgroundImage: `linear-gradient(90deg, ${BRAND.purple}, ${BRAND.cyan}, ${BRAND.orange})`,
          opacity: 0.9,
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              width: 58,
              height: 58,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundImage: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.cyan})`,
              color: '#05060b',
              fontSize: 30,
              fontWeight: 950,
            }}
          >
            F
          </div>
          <div
            style={{
              display: 'flex',
              marginLeft: 18,
              fontSize: isFeature ? 34 : 38,
              fontWeight: 900,
              letterSpacing: 0,
            }}
          >
            FreeStyla
          </div>
        </div>
        <Badge>Practice Tool</Badge>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: isFeature ? 620 : 720,
          }}
        >
          <div
            style={{
              display: 'flex',
              color: BRAND.cyan,
              fontSize: isFeature ? 22 : 24,
              fontWeight: 800,
              letterSpacing: 2.6,
              marginBottom: 18,
              textTransform: 'uppercase',
            }}
          >
            Beats. Prompts. Flow.
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: isFeature ? 62 : 76,
              fontWeight: 950,
              letterSpacing: 0,
              lineHeight: 0.92,
            }}
          >
            Freestyle practice that keeps up.
          </div>
          <div
            style={{
              display: 'flex',
              color: BRAND.muted,
              fontSize: isFeature ? 25 : 28,
              lineHeight: 1.28,
              marginTop: 24,
              maxWidth: 650,
            }}
          >
            Instant beat sync, multilingual prompt drills, XP tracking, and
            recording review in one focused rap practice tool.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            width: isFeature ? 270 : 320,
            height: isFeature ? 270 : 320,
            borderRadius: 999,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.cyan} 45%, ${BRAND.orange})`,
            boxShadow: `0 0 80px ${BRAND.cyan}40`,
          }}
        >
          <div
            style={{
              display: 'flex',
              width: isFeature ? 210 : 250,
              height: isFeature ? 210 : 250,
              borderRadius: 999,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: BRAND.ink,
              border: `2px solid ${BRAND.line}`,
              fontSize: isFeature ? 48 : 56,
              fontWeight: 950,
            }}
          >
            FLOW
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          color: BRAND.muted,
          fontSize: isFeature ? 20 : 22,
          fontWeight: 700,
        }}
      >
        <div style={{ display: 'flex' }}>freestyla.app</div>
        <div style={{ display: 'flex', color: BRAND.orange }}>
          Start a session in seconds
        </div>
      </div>
    </div>
  )
}

function SessionCard({
  username,
  score,
  rank,
  beat,
}: {
  username: string
  score: string
  rank: string
  beat: string
}) {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: BRAND.ink,
        backgroundImage: `radial-gradient(circle at 50% 20%, ${BRAND.purple}3f 0, transparent 32%), linear-gradient(135deg, #05060b 0%, #101729 100%)`,
        color: BRAND.text,
        fontFamily: 'Inter, Arial, sans-serif',
        padding: 48,
      }}
    >
      <div
        style={{
          display: 'flex',
          fontSize: 34,
          fontWeight: 900,
          color: BRAND.cyan,
          marginBottom: 20,
        }}
      >
        FREESTYLA
      </div>
      <div style={{ display: 'flex', fontSize: 54, fontWeight: 900 }}>
        {username}
      </div>
      <div
        style={{
          display: 'flex',
          fontSize: 26,
          color: BRAND.muted,
          marginBottom: 38,
        }}
      >
        {rank}
      </div>
      <div
        style={{
          display: 'flex',
          backgroundColor: BRAND.panel,
          borderRadius: 28,
          padding: '34px 64px',
          border: `1px solid ${BRAND.line}`,
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginRight: 64,
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 18,
              color: BRAND.muted,
              textTransform: 'uppercase',
            }}
          >
            Flow Points
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 66,
              fontWeight: 950,
              color: BRAND.orange,
            }}
          >
            {score}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 18,
              color: BRAND.muted,
              textTransform: 'uppercase',
            }}
          >
            Beat
          </div>
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 900 }}>
            {beat}
          </div>
        </div>
      </div>
    </div>
  )
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const variant = searchParams.get('variant')
    const width = variant === 'feature' ? 1024 : 1200
    const height = variant === 'feature' ? 500 : 630

    const hasSessionParams =
      searchParams.has('username') ||
      searchParams.has('score') ||
      searchParams.has('rank') ||
      searchParams.has('beat')

    const image = hasSessionParams ? (
      <SessionCard
        username={searchParams.get('username') || 'Hip-Hop Head'}
        score={searchParams.get('score') || '0'}
        rank={searchParams.get('rank') || 'SoundCloud Rapper'}
        beat={searchParams.get('beat') || 'None'}
      />
    ) : (
      <BrandPreview isFeature={variant === 'feature'} />
    )

    return new ImageResponse(image, { width, height })
  } catch (error) {
    console.log(error instanceof Error ? error.message : String(error))
    return new Response('Failed to generate the image', {
      status: 500,
    })
  }
}
