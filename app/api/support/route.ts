import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { subject, message } = await req.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      )
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is missing')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    // Prepare email metadata
    const userEmail = session?.user?.email || 'guest@freestyla.app'
    const userName = session?.user?.name || 'Guest User'
    const userId = session?.user?.id || 'guest'

    // Construct the email body
    const emailHtml = `
      <h2>New Support Request: ${subject}</h2>
      <p><strong>From:</strong> ${userName} (${userEmail})</p>
      <p><strong>User ID:</strong> ${userId}</p>
      <hr />
      <h3>Message:</h3>
      <p style="white-space: pre-wrap;">${message}</p>
      <hr />
      <p><em>Reply to this email to respond directly to the user.</em></p>
    `

    // Send email via Resend
    const data = await resend.emails.send({
      from: 'FreeStyla Support <support@freestyla.app>', // Must be a verified sender domain
      to: ['contact@freestyla.app'],
      replyTo: userEmail,
      subject: `[${subject}] ${userName}`,
      html: emailHtml,
    })

    if (data.error) {
      console.error('Resend error:', data.error)
      throw new Error(data.error.message)
    }

    return NextResponse.json(
      { success: true, id: data.data?.id },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error sending support email:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
