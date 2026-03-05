import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { applyRateLimit } from '@/lib/api-rate-limit'
import { validateJsonRequest, supportRequestSchema } from '@/lib/api-validation'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit: mutation tier (20 req/min)
    const blocked = applyRateLimit(req, 'mutation')
    if (blocked) return blocked

    const session = await getServerSession(authOptions)

    // Zod validation
    const parsedBody = await validateJsonRequest(req, supportRequestSchema)
    if (parsedBody instanceof NextResponse) return parsedBody

    const { subject: subjectRaw, message: messageRaw } = parsedBody

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
    const escapedSubject = escapeHtml(subjectRaw)
    const escapedMessage = escapeHtml(messageRaw)
    const escapedUserName = escapeHtml(userName)
    const escapedUserEmail = escapeHtml(userEmail)
    const escapedUserId = escapeHtml(userId)
    const replyTo = isValidEmail(userEmail) ? userEmail : undefined

    // Construct the email body
    const emailHtml = `
      <h2>New Support Request: ${escapedSubject}</h2>
      <p><strong>From:</strong> ${escapedUserName} (${escapedUserEmail})</p>
      <p><strong>User ID:</strong> ${escapedUserId}</p>
      <hr />
      <h3>Message:</h3>
      <p style="white-space: pre-wrap;">${escapedMessage}</p>
      <hr />
      <p><em>Reply to this email to respond directly to the user.</em></p>
    `

    // Send email via Resend
    const data = await resend.emails.send({
      from: 'FreeStyla Support <support@freestyla.app>', // Must be a verified sender domain
      to: ['contact@freestyla.app'],
      ...(replyTo ? { replyTo } : {}),
      subject: `[${subjectRaw}] ${userName}`.slice(0, 200),
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
