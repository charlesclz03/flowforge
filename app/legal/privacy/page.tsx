import { Container } from '@/components/atoms/Container'
import { PageHeader } from '@/components/organisms/common'
import { AppHeader } from '@/components/organisms/layout/AppHeader'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader />
      <Container className="pt-8">
        <PageHeader
          title="Privacy Policy"
          description="Last Updated: December 10, 2025"
        />

        <div className="mt-8 space-y-8 text-text-secondary prose prose-invert max-w-none">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              1. Data We Collect
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Account Info:</strong> Email address and name (via
                Google/NextAuth).
              </li>
              <li>
                <strong>Usage Data:</strong> Session duration, beats used, and
                feature interaction stats.
              </li>
              <li>
                <strong>User Content:</strong> Audio recordings you choose to
                save.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              2. How We Use Data & Privacy Assurance
            </h2>
            <p>We use your data to:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Provide and improve the FreeStyla service.</li>
              <li>Process payments (via Stripe).</li>
              <li>
                Analyze app performance (e.g., crash reporting via Sentry).
              </li>
            </ul>
            <p className="mt-4">
              <strong>You own your flows.</strong>
              <br />
              FreeStyla guarantees that your lyrics and recordings remain 100%
              your intellectual property. We do not use your voice data to train
              public models without consent.
            </p>
            <p className="mt-2">
              We <strong>never</strong> sell your personal data to third
              parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              3. Data Storage
            </h2>
            <p>
              Your data is stored securely using Supabase (Database) and Stripe
              (Payments). Guest sessions are stored locally on your device
              (IndexedDB) until you sign in.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              4. Your Rights
            </h2>
            <p>
              You have the right to request access to or deletion of your data.
              You can delete your account and all associated data directly from
              the Profile Settings page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">5. Contact</h2>
            <p>
              For privacy concerns, please contact us at support@freestyla.com.
            </p>
          </section>
        </div>
      </Container>
    </div>
  )
}
