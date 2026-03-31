import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import LegalPageShell from '@/components/LegalPageShell';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Predelivery.ai',
  description:
    'Terms and Conditions governing use of the Predelivery.ai platform and services.',
};

export default function TermsPage() {
  return (
    <LegalPageShell active="terms" pageTitle="Terms & Conditions">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        Terms &amp; Conditions – Predelivery.ai
      </h1>
      <p className="mt-2 text-sm font-medium text-[#0033FF]">
        Effective Date: 30th March 2026
      </p>

      <p className="mt-6 text-[15px] leading-relaxed text-gray-700">
        These Terms and Conditions (&quot;Terms&quot;) govern your access to and use of the Predelivery.ai platform, website and
        services (&quot;Platform&quot;), operated by <strong>PreDelivery Global Pty Ltd</strong> (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;,
        &quot;our&quot;).
      </p>
      <p className="mt-4 text-[15px] leading-relaxed text-gray-700">
        By accessing or using the Platform, you agree to be bound by these Terms.
      </p>

      <Section n={1} title="Services" isFirst>
        <p className="mb-3 text-[15px] leading-relaxed text-gray-700">Predelivery.ai provides:</p>
        <ul className="ml-4 list-disc space-y-1 text-[15px] text-gray-700">
          <li>Digital vehicle inspection tools</li>
          <li>AI-assisted damage detection and condition scoring</li>
          <li>Reporting, analytics and data insights</li>
        </ul>
        <p className="mt-4 text-[15px] leading-relaxed text-gray-700">
          The Platform is provided as a technology and data service, and does not constitute mechanical, engineering, valuation or
          legal advice.
        </p>
      </Section>

      <Section n={2} title="Eligibility and Accounts">
        <p className="mb-3 text-[15px] leading-relaxed text-gray-700">To use the Platform, you must:</p>
        <ul className="ml-4 list-disc space-y-1 text-[15px] text-gray-700">
          <li>Be at least 18 years old</li>
          <li>Provide accurate and complete information</li>
          <li>Maintain the security of your login credentials</li>
        </ul>
        <p className="mt-4 text-[15px] leading-relaxed text-gray-700">
          You are responsible for all activity conducted under your account.
        </p>
      </Section>

      <Section n={3} title="Use of the Platform">
        <p className="mb-3 text-[15px] leading-relaxed text-gray-700">You agree to:</p>
        <ul className="ml-4 list-disc space-y-1 text-[15px] text-gray-700">
          <li>Use the Platform lawfully and for legitimate business purposes</li>
          <li>Provide accurate and complete inspection data</li>
          <li>Follow all applicable vehicle inspection standards and regulations</li>
        </ul>
        <p className="mt-4 text-[15px] font-semibold text-gray-900">You must not:</p>
        <ul className="ml-4 mt-2 list-disc space-y-1 text-[15px] text-gray-700">
          <li>Misuse or manipulate inspection data</li>
          <li>Reverse engineer or attempt to extract source code</li>
          <li>Interfere with platform functionality or security</li>
        </ul>
      </Section>

      <Section n={4} title="AI and Data Disclaimer">
        <p className="text-[15px] leading-relaxed text-gray-700">
          Predelivery.ai uses artificial intelligence and automated systems.
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-gray-700">You acknowledge that:</p>
        <ul className="ml-4 list-disc space-y-1 text-[15px] text-gray-700">
          <li>AI outputs are probabilistic and indicative only</li>
          <li>Results may contain inaccuracies or omissions</li>
          <li>Outputs should not be relied upon as sole decision-making tools</li>
        </ul>
        <p className="mt-4 text-[15px] leading-relaxed text-gray-700">
          The Platform is intended to assist, not replace, human judgment.
        </p>
      </Section>

      <Section n={5} title="Inspection Responsibility">
        <p className="mb-3 text-[15px] leading-relaxed text-gray-700">You acknowledge that:</p>
        <ul className="ml-4 list-disc space-y-1 text-[15px] text-gray-700">
          <li>Inspections are performed by users, not by the Company</li>
          <li>The Company does not physically inspect vehicles</li>
        </ul>
        <p className="mt-4 text-[15px] leading-relaxed text-gray-700">Responsibility for inspection accuracy, compliance, and decisions based on inspection results rests solely with the user and/or their organisation.</p>
      </Section>

      <Section n={6} title="Fees and Payment">
        <p className="mb-3 text-[15px] leading-relaxed text-gray-700">Where applicable:</p>
        <ul className="ml-4 list-disc space-y-1 text-[15px] text-gray-700">
          <li>Fees will be set out in your subscription or agreement</li>
          <li>All fees are exclusive of GST unless stated otherwise</li>
          <li>Payments must be made in accordance with agreed terms</li>
        </ul>
        <p className="mt-4 text-[15px] leading-relaxed text-gray-700">
          We may suspend access for non-payment.
        </p>
      </Section>

      <Section n={7} title="Intellectual Property">
        <p className="mb-3 text-[15px] leading-relaxed text-gray-700">
          All intellectual property in the Platform, including software, AI models, algorithms and scoring systems, remains the
          property of the Company.
        </p>
        <p className="text-[15px] leading-relaxed text-gray-700">
          Users retain ownership of their raw data, but grant the Company a licence to use, analyse, aggregate and de-identify
          data to improve the Platform and AI systems.
        </p>
      </Section>

      <Section n={8} title="Data and Privacy">
        <p className="text-[15px] leading-relaxed text-gray-700">
          Your use of the Platform is subject to our{' '}
          <a href="/privacy" className="font-medium text-[#0033FF] hover:underline">
            Privacy Policy
          </a>
          .
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-gray-700">By using the Platform, you consent to:</p>
        <ul className="ml-4 list-disc space-y-1 text-[15px] text-gray-700">
          <li>Collection and processing of personal and inspection data</li>
          <li>Use of de-identified data for analytics and AI training</li>
        </ul>
      </Section>

      <Section n={9} title="Third-Party Services">
        <p className="text-[15px] leading-relaxed text-gray-700">
          The Platform may integrate with third-party services. We are not responsible for third-party systems, data accuracy from
          third parties, or external service disruptions.
        </p>
      </Section>

      <Section n={10} title="Service Availability">
        <p className="mb-3 text-[15px] leading-relaxed text-gray-700">
          We aim to provide reliable access but do not guarantee continuous availability or error-free operation.
        </p>
        <p className="text-[15px] leading-relaxed text-gray-700">
          We may modify, suspend or discontinue services at any time.
        </p>
      </Section>

      <Section n={11} title="Limitation of Liability">
        <p className="mb-3 text-[15px] leading-relaxed text-gray-700">To the maximum extent permitted by law:</p>
        <p className="text-[15px] leading-relaxed text-gray-700">We are not liable for:</p>
        <ul className="ml-4 list-disc space-y-1 text-[15px] text-gray-700">
          <li>Indirect or consequential loss</li>
          <li>Loss of profits, revenue or business</li>
          <li>Decisions made based on Platform outputs</li>
        </ul>
        <p className="mt-4 text-[15px] leading-relaxed text-gray-700">
          Our total liability is limited to the fees paid by you in the 12 months prior to the claim.
        </p>
      </Section>

      <Section n={12} title="Australian Consumer Law">
        <p className="text-[15px] leading-relaxed text-gray-700">
          Nothing in these Terms excludes or limits your rights under the Competition and Consumer Act 2010 (Cth).
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-gray-700">
          Where liability cannot be excluded, it is limited to re-supply of services, or payment of the cost of re-supply.
        </p>
      </Section>

      <Section n={13} title="Indemnity">
        <p className="text-[15px] leading-relaxed text-gray-700">
          You agree to indemnify the Company against any claims, loss or damage arising from misuse of the Platform, inaccurate
          inspection data, or breach of these Terms.
        </p>
      </Section>

      <Section n={14} title="Termination">
        <p className="mb-3 text-[15px] leading-relaxed text-gray-700">We may suspend or terminate your access if:</p>
        <ul className="ml-4 list-disc space-y-1 text-[15px] text-gray-700">
          <li>You breach these Terms</li>
          <li>You misuse the Platform</li>
          <li>Payment obligations are not met</li>
        </ul>
        <p className="mt-4 text-[15px] leading-relaxed text-gray-700">
          You may terminate your account at any time.
        </p>
      </Section>

      <Section n={15} title="Suspension and Enforcement">
        <p className="text-[15px] leading-relaxed text-gray-700">
          We may monitor usage, investigate breaches, and take action to protect the Platform and users.
        </p>
      </Section>

      <Section n={16} title="Changes to Terms">
        <p className="text-[15px] leading-relaxed text-gray-700">
          We may update these Terms from time to time. Updated Terms will be posted on the Platform and take effect upon
          publication.
        </p>
      </Section>

      <Section n={17} title="Governing Law">
        <p className="text-[15px] leading-relaxed text-gray-700">
          These Terms are governed by the laws of New South Wales, Australia. You submit to the jurisdiction of the courts of
          New South Wales.
        </p>
      </Section>

      <Section n={18} title="Contact">
        <p className="mb-3 text-[15px] leading-relaxed text-gray-700">For any questions regarding these Terms:</p>
        <p className="text-[15px] font-semibold text-gray-900">
          Email:{' '}
          <a href="mailto:info@predelivery.ai" className="text-[#0033FF] hover:underline">
            info@predelivery.ai
          </a>
        </p>
      </Section>
    </LegalPageShell>
  );
}

function Section({
  n,
  title,
  children,
  isFirst,
}: {
  n: number;
  title: string;
  children: ReactNode;
  isFirst?: boolean;
}) {
  return (
    <section className={isFirst ? 'mt-8' : 'mt-10 border-t border-gray-100 pt-8'}>
      <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
        {n}. {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
