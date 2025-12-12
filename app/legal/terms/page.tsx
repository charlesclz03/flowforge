import { Container } from '@/components/atoms/Container'
import { PageHeader } from '@/components/organisms/common'
import { AppHeader } from '@/components/organisms/layout/AppHeader'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader />
      <Container className="pt-8">
        <PageHeader title="Terms of Service" description="Last Updated: December 10, 2025" />

        <div className="mt-8 space-y-8 text-text-secondary prose prose-invert max-w-none">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using FlowForge ("the App"), you agree to be bound by these Terms of
              Service. If you do not agree to these terms, please do not use the App.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">2. User Content & Ownership</h2>
            <p>
              <strong>You own your flows.</strong> FlowForge claims no ownership rights over the
              lyrics, audio recordings, or freestyle sessions you create using the App. You retain
              full copyright and intellectual property rights to your generated content.
            </p>
            <p className="mt-2">
              By using the App, you grant FlowForge a limited license to store and process your
              content solely for the purpose of providing the service (e.g., saving your recordings
              to the cloud).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">3. Premium Subscriptions</h2>
            <p>
              FlowForge offers a Pro subscription (€4.99/mo or €49.99/yr). Subscriptions auto-renew
              unless canceled at least 24 hours before the end of the current period. You can manage
              your subscription in your Profile settings via the Stripe Customer Portal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. Acceptable Use</h2>
            <p>
              You agree not to use the App to create content that is illegal, hateful, or violates
              the rights of others. FlowForge reserves the right to terminate accounts that violate
              these guidelines.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">5. Disclaimer</h2>
            <p>
              The App is provided "as is" without warranties of any kind. FlowForge is not
              responsible for data loss or technical issues, though we strive for 99.99% uptime.
            </p>
          </section>
        </div>
      </Container>
    </div>
  )
}
