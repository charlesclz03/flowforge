'use client'

import { Container } from '@/components/atoms/Container'

import { AppHeader } from '@/components/organisms/layout/AppHeader'
import { useRouter } from 'next/navigation'

export default function PrivacyPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-background pb-bottomnav">
      <AppHeader
        showBackButton
        onBack={() => router.back()}
        customTitle="LEGAL"
        customSubtitle="Privacy Policy"
      />
      <Container className="pt-8">
        <div className="mb-8">
          <p className="text-text-secondary text-sm">
            Last Updated: January 10, 2026
          </p>
        </div>

        <div className="mt-8 space-y-8 text-text-secondary prose prose-invert max-w-none text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              1. Introduction
            </h2>
            <p>
              FreeStyla (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;)
              respects your privacy and is committed to protecting the personal
              information you share with us. This Privacy Policy outlines how we
              collect, use, and safeguard your data when you use our
              application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              2. Information We Collect
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Identity Data:</strong> Name, email address, and profile
                image (via Google Authentication).
              </li>
              <li>
                <strong>User Content:</strong> Audio recordings, lyrics, and
                session titles you choose to save to our servers.
              </li>
              <li>
                <strong>Usage Data:</strong> Information about how you use the
                app, including session duration, beats played, features
                accessed, and game progression (XP, Levels).
              </li>
              <li>
                <strong>Device Data:</strong> Internet Protocol (IP) address,
                browser type and version, and operating system.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              3. How We Use Your Information
            </h2>
            <p>We use your data to:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Provide, operate, and maintain the FreeStyla service.</li>
              <li>
                Process transactions and manage your subscription (via Stripe).
              </li>
              <li>Improve user experience and analyze usage trends.</li>
              <li>Detect and prevent fraud, abuse, and security incidents.</li>
              <li>
                Send you administrative updates (e.g., security alerts, policy
                changes).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              4. Data Sharing and Third Parties
            </h2>
            <p>
              We do not sell your personal data. We share data only with trusted
              third-party service providers who assist us in operating our app:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                <strong>Google (Authentication):</strong> To securely manage
                your login credentials.
              </li>
              <li>
                <strong>Stripe (Payments):</strong> To process subscription
                payments securely. We do not store your credit card information.
              </li>
              <li>
                <strong>Supabase (Database & Storage):</strong> To securely host
                your user content and account data.
              </li>
              <li>
                <strong>Sentry (Analytics):</strong> To track application errors
                and performance issues.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              5. Your Rights
            </h2>
            <p>
              Depending on your location (e.g., GDPR in Europe, CCPA in
              California), you may have the following rights:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                <strong>Access:</strong> Request a copy of the personal data we
                hold about you.
              </li>
              <li>
                <strong>Correction:</strong> Request correction of inaccurate
                data.
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your account and
                all associated data. You can perform this action directly in the
                app via the Profile Settings page.
              </li>
              <li>
                <strong>Portability:</strong> Request to receive your data in a
                structured, commonly used format.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              6. Data Security
            </h2>
            <p>
              We implement industry-standard security measures, including
              encryption in transit (HTTPS) and at rest, to protect your data.
              However, no method of transmission over the Internet is 100%
              secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              7. Data Retention
            </h2>
            <p>
              We retain your Personal Data only for as long as is necessary for
              the purposes set out in this Privacy Policy. If you delete your
              account, your data (including recordings) is permanently removed
              from our active databases.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              8. Children&#39;s Privacy
            </h2>
            <p>
              Our Service does not address anyone under the age of 13. We do not
              knowingly collect personally identifiable information from anyone
              under the age of 13. If You are a parent or guardian and You are
              aware that Your child has provided Us with Personal Data, please
              contact Us. If We become aware that We have collected Personal
              Data from anyone under the age of 13 without verification of
              parental consent, We take steps to remove that information from
              Our servers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              9. International Data Transfers
            </h2>
            <p>
              Your information, including Personal Data, is processed at the
              Company&#39;s operating offices and in any other places where the
              parties involved in the processing are located. It means that this
              information may be transferred to — and maintained on — computers
              located outside of Your state, province, country, or other
              governmental jurisdiction where the data protection laws may
              differ from those from Your jurisdiction. Your consent to this
              Privacy Policy followed by Your submission of such information
              represents Your agreement to that transfer.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              10. Cookies and Tracking Technologies
            </h2>
            <p>
              We use Cookies and similar tracking technologies to track the
              activity on Our Service and store certain information. Tracking
              technologies used are beacons, tags, and scripts to collect and
              track information and to improve and analyze Our Service. You can
              instruct Your browser to refuse all Cookies or to indicate when a
              Cookie is being sent. However, if You do not accept Cookies, You
              may not be able to use some parts of our Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              11. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy or our data
              practices, please contact us at:
              <br />
              <a
                href="mailto:privacy@freestyla.com"
                className="text-accent-purple hover:underline"
              >
                privacy@freestyla.com
              </a>
            </p>
          </section>
        </div>
      </Container>
    </div>
  )
}
