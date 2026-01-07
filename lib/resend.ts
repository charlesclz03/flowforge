import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

/**
 * Syncs a new user to the Resend audience.
 * This is called automatically after successful Google OAuth sign-up.
 */
export async function syncUserToAudience(email: string, name?: string) {
  if (!resend) {
    console.warn('RESEND_API_KEY is not set. Skipping audience sync.')
    return
  }

  const audienceId = process.env.RESEND_AUDIENCE_ID

  if (!audienceId) {
    console.warn('RESEND_AUDIENCE_ID is not set. Skipping audience sync.')
    return
  }

  try {
    const [firstName, ...lastNameParts] = (name || '').split(' ')
    const lastName = lastNameParts.join(' ')

    const { data, error } = await resend.contacts.create({
      email,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      unsubscribed: false,
      audienceId,
    })

    if (error) {
      console.error('Failed to sync user to Resend:', error)
    } else {
      console.log('Successfully synced user to Resend:', data)
    }
  } catch (error) {
    console.error('Error in syncUserToAudience:', error)
  }
}
