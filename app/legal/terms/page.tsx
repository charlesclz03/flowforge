'use client'

import { Container } from '@/components/atoms/Container'

import { AppHeader } from '@/components/organisms/layout/AppHeader'
import { useRouter } from 'next/navigation'

export default function TermsPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader
        showBackButton
        onBack={() => router.back()}
        customTitle="LEGAL"
        customSubtitle="Terms of Service"
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
              1. Acceptance of Terms
            </h2>
            <p>
              Welcome to FreeStyla (&quot;Company&quot;, &quot;we&quot;,
              &quot;our&quot;, &quot;us&quot;). By creating an account,
              accessing, or using the FreeStyla mobile application and website
              (collectively, the &quot;Service&quot;), you agree to be bound by
              these Terms of Service (&quot;Terms&quot;). If you do not agree to
              these Terms, including the mandatory arbitration provision and
              class action waiver in Section 13, you may not access or use the
              Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              2. Eligibility
            </h2>
            <p>
              You must be at least 13 years of age to access or use the Service.
              If you are under 18 years of age (or the age of legal majority
              where you live), you may only use the Service with the permission
              of a parent or legal guardian who agrees to be bound by these
              Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              3. User Accounts
            </h2>
            <p>
              To access certain features, you must register for an account using
              a valid Google authentication credential. You are responsible for
              maintaining the confidentiality of your login credentials and for
              all activities that occur under your account. You agree to
              immediately notify us of any unauthorized use or security breach.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              4. Intellectual Property Rights
            </h2>
            <h3 className="text-lg font-semibold text-white mt-4 mb-2">
              4.1 Your Content (&quot;User Flows&quot;)
            </h3>
            <p>
              <strong>
                You retain 100% ownership of your lyrics, vocal performances,
                and freestyle sessions (&quot;User Content&quot;).
              </strong>{' '}
              FreeStyla claims no ownership rights over the creative content you
              generate using the Service.
            </p>
            <p className="mt-2">
              By using the Service, you grant FreeStyla a worldwide,
              non-exclusive, royalty-free license to host, store, reproduce, and
              display your User Content solely for the purpose of operating,
              developing, providing, and improving the Service (e.g., saving
              your tracks to the cloud or displaying them on your profile).
            </p>

            <h3 className="text-lg font-semibold text-white mt-4 mb-2">
              4.2 Company Content
            </h3>
            <p>
              The Service, including but not limited to its
              &quot;FreeStyla&quot; code, design, interface, graphics, and
              pre-loaded instrumental beats (&quot;System Beats&quot;), is the
              exclusive property of FreeStyla or its licensors. You may not
              copy, modify, distribute, sell, or lease any part of our Service
              or included software.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              5. Subscriptions and Payments
            </h2>
            <p>
              Certain features of the Service may require a paid subscription
              (&quot;Pro Account&quot;).
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                <strong>Billing:</strong> Subscription fees are billed in
                advance on a recurring monthly or annual basis via our payment
                processor, Stripe.
              </li>
              <li>
                <strong>Cancellation:</strong> You may cancel your subscription
                at any time through your Profile Settings. Cancellation takes
                effect at the end of the current billing period.
              </li>
              <li>
                <strong>Refunds:</strong> Payments are non-refundable, except
                where required by law.
              </li>
              <li>
                <strong>Changes:</strong> We reserve the right to change our
                pricing terms at any time with reasonable notice to you.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              6. Acceptable Use Policy
            </h2>
            <p>You agree NOT to use the Service to:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                Upload or create content that is illegal, defamatory, hateful,
                harassing, or obscene.
              </li>
              <li>
                Infringe upon the intellectual property rights of others (e.g.,
                rapping over copyrighted beats you do not have rights to).
              </li>
              <li>
                Attempt to reverse engineer, decompile, or extract source code
                from the Service.
              </li>
              <li>
                Use the Service for any unauthorized commercial purpose without
                our express written consent.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              7. Termination
            </h2>
            <p>
              We may terminate or suspend your access to the Service
              immediately, without prior notice or liability, for any reason
              whatsoever, including without limitation if you breach the Terms.
              Upon termination, your right to use the Service will immediately
              cease.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              8. Disclaimers and Limitation of Liability
            </h2>
            <p>
              THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS
              AVAILABLE&quot; BASIS. TO THE MAXIMUM EXTENT PERMITTED BY LAW,
              FREESTYLA DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED.
            </p>
            <p className="mt-4">
              IN NO EVENT SHALL FREESTYLA BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING
              LOSS OF PROFITS, DATA, OR USE, WHETHER INCURRED DIRECTLY OR
              INDIRECTLY.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              9. Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with
              the laws of the State of Delaware, United States, without regard
              to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              10. Contact Us
            </h2>
            <p>
              If you have any questions about these Terms, please contact us at:
              <br />
              <a
                href="mailto:legal@freestyla.com"
                className="text-accent-purple hover:underline"
              >
                legal@freestyla.com
              </a>
            </p>
          </section>
        </div>
      </Container>
    </div>
  )
}
