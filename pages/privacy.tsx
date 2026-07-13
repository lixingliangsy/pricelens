import React from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'
import { PRODUCT } from '../lib/product'

// Contact email for privacy requests. Replace with your real, monitored inbox.
const PRIVACY_EMAIL = 'privacy@pricelens.app'
const EFFECTIVE_DATE = 'July 12, 2026'

export default function PrivacyPolicy() {
  return (
    <Layout>
      <Head>
        <title>Privacy Policy — {PRODUCT.name}</title>
        <meta name="description" content={`Privacy Policy for ${PRODUCT.name}`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <article className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow prose-privacy">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Effective date: {EFFECTIVE_DATE}</p>

        <p className="text-gray-700 mb-6">
          This Privacy Policy explains how {PRODUCT.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;)
          collects, uses, and protects information when you use our website and pricing-analysis tool
          (the &ldquo;Service&rdquo;). By using the Service, you agree to the practices described here.
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>
              <strong>Content you submit.</strong> When you use the tool, you may paste a pricing-page URL,
              plan copy, or select a market. This input is processed to generate your analysis and is
              retained only as needed to deliver and improve the Service.
            </li>
            <li>
              <strong>Account &amp; subscription data.</strong> If you subscribe to a paid plan (Pro or Studio),
              our payment processor (Waffo) collects billing details. We receive a customer identifier and
              subscription status, but we do <strong>not</strong> store full card numbers or CVV on our servers.
            </li>
            <li>
              <strong>Usage data.</strong> We collect basic technical logs (IP address, browser type, pages
              visited) to operate, secure, and improve the Service. This is aggregated and not used to identify you individually.
            </li>
            <li>
              <strong>Cookies.</strong> We use a minimal set of cookies to keep you signed in and remember
              preferences. We do not use third-party advertising or tracking cookies.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>To generate your pricing teardown and return results to you.</li>
            <li>To manage your subscription, process payments, and provide support.</li>
            <li>To secure the Service, prevent abuse, and comply with legal obligations.</li>
            <li>To communicate product updates you have opted into.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. AI Processing</h2>
          <p className="text-gray-700 mb-2">
            To produce your analysis, the text you submit (pricing URL, plan copy, market) is sent to a
            third-party AI provider (OpenAI) for processing. We send only the minimum content required to
            generate the result. We do not send your payment information to the AI provider.
          </p>
          <p className="text-gray-700">
            You should avoid pasting confidential, personal, or regulated data you are not authorized to share,
            as it may be processed by the AI provider under its own terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data Sharing</h2>
          <p className="text-gray-700 mb-2">We share data only with the service providers needed to run the Service:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Waffo</strong> — payment processing and subscription management.</li>
            <li><strong>OpenAI</strong> — AI analysis of submitted text (see Section 3).</li>
            <li><strong>Hosting / infrastructure providers</strong> — to operate the website.</li>
          </ul>
          <p className="text-gray-700 mt-2">
            We do not sell your personal information. We may disclose data when required by law or to protect
            our rights and users.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Your Rights</h2>
          <p className="text-gray-700 mb-2">
            Depending on your location (e.g., EEA under GDPR, California under CCPA), you may have the right to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Access the personal data we hold about you.</li>
            <li>Request correction or deletion of your data.</li>
            <li>Object to or restrict certain processing.</li>
            <li>Withdraw consent where processing is based on consent.</li>
          </ul>
          <p className="text-gray-700 mt-2">
            To exercise these rights, email <a className="text-brand underline" href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>.
            We will respond within 30 days. You may also request deletion of your account and associated data at any time.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Data Retention</h2>
          <p className="text-gray-700">
            We keep account and subscription records for as long as your account is active and for a reasonable
            period afterward to meet legal and accounting obligations. Analysis inputs are retained only as long
            as necessary to provide the Service and are removed on request.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Security</h2>
          <p className="text-gray-700">
            We use industry-standard measures to protect your data in transit (HTTPS) and at rest. No method of
            transmission or storage is 100% secure, but we work to protect your information and limit access to
            authorized systems only.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Children</h2>
          <p className="text-gray-700">
            The Service is not directed to individuals under 16. We do not knowingly collect personal data from children.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Changes to This Policy</h2>
          <p className="text-gray-700">
            We may update this Policy from time to time. Material changes will be posted here with a revised
            effective date. Continued use after changes means you accept the updated Policy.
          </p>
        </section>

        <section className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Contact</h2>
          <p className="text-gray-700">
            Questions about this Privacy Policy? Contact us at{' '}
            <a className="text-brand underline" href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>.
          </p>
        </section>
      </article>
    </Layout>
  )
}
