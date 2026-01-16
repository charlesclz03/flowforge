'use client'

import { Container } from '@/components/atoms/Container'

import { AppHeader } from '@/components/organisms/layout/AppHeader'
import { useRouter } from 'next/navigation'

export default function TermsPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-background pb-bottomnav">
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
              &quot;FreeStyla&quot; code, design, interface, graphics, and ALL
              instrumental beats (&quot;System Beats&quot;), is the exclusive
              property of FreeStyla or its licensors. You acknowledge that you
              have no ownership rights in the System Beats.
            </p>

            <h3 className="text-lg font-semibold text-white mt-4 mb-2">
              4.3 Beat Usage License
            </h3>
            <p className="mb-2">
              We grant you a limited, non-sublicensable license to use System
              Beats solely as follows:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                <strong>[PERMITTED]</strong> You may use System Beats to create,
                record, and practice freestyle sessions within the FreeStyla
                application.
              </li>
              <li>
                <strong>[PERMITTED]</strong> You may share video or audio
                recordings exported directly from FreeStyla (which contain the
                System Beat) on personal social media platforms (e.g.,
                Instagram, TikTok, YouTube) for non-commercial, promotional
                purposes.
              </li>
              <li>
                <strong>[PROHIBITED]</strong> You may NOT distribute, sell, or
                upload any track containing a System Beat to digital service
                providers (DSPs) such as Spotify, Apple Music, SoundCloud
                (monetized), or any other streaming service.
              </li>
              <li>
                <strong>[PROHIBITED]</strong> You may NOT extract, download, or
                use the System Beat files separately from the FreeStyla
                application for any purpose.
              </li>
              <li>
                <strong>[PROHIBITED]</strong> You may NOT use System Beats for
                commercial advertisements (TV, Radio, Online Ads) or third-party
                commercial projects without a separate written license from
                FreeStyla.
              </li>
            </ul>
            <p className="mt-4 text-accent-red font-bold">
              Violation of this license may result in immediate account
              termination and legal action for copyright infringement.
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
                rapping over copyrighted beats you do not have rights to) or
                violate the <strong>Beat Usage License</strong> (Section 4.3).
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
              10. Indemnification
            </h2>
            <p>
              You agree to defend, indemnify, and hold harmless FreeStyla and
              its licensee and licensors, and their employees, contractors,
              agents, officers, and directors, from and against any and all
              claims, damages, obligations, losses, liabilities, costs or debt,
              and expenses (including but not limited to attorney&#39;s fees),
              resulting from or arising out of a) your use and access of the
              Service, by you or any person using your account and password; b)
              a breach of these Terms, or c) Content posted on the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              11. Dispute Resolution (Arbitration)
            </h2>
            <p>
              For any dispute with FreeStyla, you agree to first contact us at
              legal@freestyla.com and attempt to resolve the dispute with us
              informally. In the unlikely event that FreeStyla has not been able
              to resolve a dispute it has with you after sixty (60) days, we
              each agree to resolve any claim, dispute, or controversy
              (excluding any claims for injunctive or other equitable relief)
              arising out of or in connection with or relating to these Terms,
              or the breach or alleged breach thereof, by binding arbitration.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              12. Class Action Waiver
            </h2>
            <p>
              You agree that any arbitration or proceeding shall be limited to
              the Dispute between us and you individually. To the full extent
              permitted by law, (i) no arbitration or proceeding shall be joined
              with any other; (ii) there is no right or authority for any
              Dispute to be arbitrated or resolved on a class action-basis or to
              utilize class action procedures; and (iii) there is no right or
              authority for any Dispute to be brought in a purported
              representative capacity on behalf of the general public or any
              other persons.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              13. Entire Agreement
            </h2>
            <p>
              These Terms constitute the entire agreement between you and
              FreeStyla regarding our Service, and supersede and replace any
              prior agreements we might have had between us regarding the
              Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              14. Contact Us
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
