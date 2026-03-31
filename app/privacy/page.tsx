import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import LegalPageShell from '@/components/LegalPageShell';

export const metadata: Metadata = {
  title: 'Privacy Policy | Predelivery.ai',
  description:
    'Privacy Policy for Predelivery.ai — how we collect, use and protect your personal information under Australian privacy law.',
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell active="privacy" pageTitle="Privacy Policy">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        Privacy Policy – Predelivery.ai
      </h1>
      <p className="mt-2 text-sm font-medium text-[#0033FF]">
        Effective Date: 30th March 2026
      </p>

      <p className="mt-6 text-[15px] leading-relaxed text-gray-700">
        Predelivery.ai (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your privacy and handling your personal
        information in accordance with the Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs).
      </p>
      <p className="mt-4 text-[15px] leading-relaxed text-gray-700">
        This Privacy Policy explains how we collect, use, disclose and protect your personal information when you use our
        platform, website and services (&quot;Platform&quot;).
      </p>

      <Section n={1} title="What Information We Collect" isFirst>
        <p className="mb-4 text-[15px] leading-relaxed text-gray-700">
          We may collect the following types of personal information:
        </p>
        <Sub n="1.1" title="Personal and Contact Information" />
        <ul className="ml-4 list-disc space-y-1 text-[15px] text-gray-700">
          <li>Name</li>
          <li>Email address</li>
          <li>Phone number</li>
          <li>Business or employer details</li>
        </ul>
        <Sub n="1.2" title="Vehicle and Inspection Data" />
        <ul className="ml-4 list-disc space-y-1 text-[15px] text-gray-700">
          <li>Vehicle Identification Number (VIN)</li>
          <li>Vehicle condition data</li>
          <li>Inspection results and reports</li>
          <li>Photos and videos of vehicles</li>
        </ul>
        <Sub n="1.3" title="Location Information" />
        <ul className="ml-4 list-disc space-y-1 text-[15px] text-gray-700">
          <li>GPS location data associated with inspections</li>
        </ul>
        <Sub n="1.4" title="Technical and Usage Information" />
        <ul className="ml-4 list-disc space-y-1 text-[15px] text-gray-700">
          <li>IP address</li>
          <li>Device and browser information</li>
          <li>Log data and usage activity</li>
        </ul>
        <Sub n="1.5" title="Account Information" />
        <ul className="ml-4 list-disc space-y-1 text-[15px] text-gray-700">
          <li>Login credentials</li>
          <li>User preferences</li>
        </ul>
      </Section>

      <Section n={2} title="How We Collect Information">
        <p className="mb-3 text-[15px] leading-relaxed text-gray-700">We collect personal information:</p>
        <ul className="ml-4 list-disc space-y-2 text-[15px] text-gray-700">
          <li>Directly from you when you use the Platform</li>
          <li>When you upload inspection data or images</li>
          <li>Automatically through your use of the Platform (e.g. cookies, analytics)</li>
          <li>From third-party integrations (e.g. VIN data providers)</li>
        </ul>
      </Section>

      <Section n={3} title="How We Use Your Information">
        <p className="mb-3 text-[15px] leading-relaxed text-gray-700">We use your personal information to:</p>
        <ul className="ml-4 list-disc space-y-2 text-[15px] text-gray-700">
          <li>Provide and operate the Platform</li>
          <li>Generate inspection reports and analytics</li>
          <li>Improve and develop our AI models and services</li>
          <li>Provide customer support</li>
          <li>Communicate with you</li>
          <li>Comply with legal and regulatory obligations</li>
        </ul>
        <p className="mt-4 text-[15px] leading-relaxed text-gray-700">
          We may use de-identified and aggregated data to train and improve our AI system.
        </p>
      </Section>

      <Section n={4} title="AI and Automated Processing">
        <p className="mb-3 text-[15px] leading-relaxed text-gray-700">Predelivery.ai uses artificial intelligence to assist with:</p>
        <ul className="ml-4 list-disc space-y-1 text-[15px] text-gray-700">
          <li>Damage detection</li>
          <li>Condition scoring</li>
          <li>Data analysis</li>
        </ul>
        <p className="mt-4 text-[15px] leading-relaxed text-gray-700">These outputs are:</p>
        <ul className="ml-4 list-disc space-y-1 text-[15px] text-gray-700">
          <li>Indicative only</li>
          <li>Not guaranteed to be accurate</li>
        </ul>
        <p className="mt-4 text-[15px] leading-relaxed text-gray-700">
          You should not rely solely on AI outputs for decision-making.
        </p>
      </Section>

      <Section n={5} title="Disclosure of Personal Information">
        <p className="mb-3 text-[15px] leading-relaxed text-gray-700">We may disclose your personal information to:</p>
        <ul className="ml-4 list-disc space-y-2 text-[15px] text-gray-700">
          <li>Business customers (e.g. dealers, fleet operators, OEMs)</li>
          <li>Service providers (e.g. cloud hosting, analytics providers)</li>
          <li>Professional advisors (e.g. legal, accounting)</li>
          <li>Government or regulatory authorities where required</li>
        </ul>
      </Section>

      <Section n={6} title="Overseas Disclosure">
        <p className="text-[15px] leading-relaxed text-gray-700">
          Your personal information may be stored or processed overseas, including via cloud service providers.
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-gray-700">
          We take reasonable steps to ensure overseas recipients comply with Australian privacy standards.
        </p>
      </Section>

      <Section n={7} title="Data Security">
        <p className="mb-3 text-[15px] leading-relaxed text-gray-700">We take reasonable steps to protect your personal information, including:</p>
        <ul className="ml-4 list-disc space-y-1 text-[15px] text-gray-700">
          <li>Encryption</li>
          <li>Secure cloud infrastructure</li>
          <li>Access controls</li>
          <li>Audit logs</li>
        </ul>
        <p className="mt-4 text-[15px] leading-relaxed text-gray-700">
          However, no system is completely secure, and we cannot guarantee absolute security.
        </p>
      </Section>

      <Section n={8} title="Data Retention">
        <p className="mb-3 text-[15px] leading-relaxed text-gray-700">We retain personal information:</p>
        <ul className="ml-4 list-disc space-y-1 text-[15px] text-gray-700">
          <li>As long as necessary to provide our services</li>
          <li>To comply with legal obligations</li>
          <li>For legitimate business purposes</li>
        </ul>
        <p className="mt-4 text-[15px] leading-relaxed text-gray-700">
          We may retain de-identified data indefinitely for analytics and AI training.
        </p>
      </Section>

      <Section n={9} title="Your Rights">
        <p className="mb-3 text-[15px] leading-relaxed text-gray-700">Under Australian privacy law, you have the right to:</p>
        <ul className="ml-4 list-disc space-y-1 text-[15px] text-gray-700">
          <li>Access your personal information</li>
          <li>Request correction of inaccurate information</li>
          <li>Request deletion (where applicable)</li>
          <li>Make a complaint about how your data is handled</li>
        </ul>
      </Section>

      <Section n={10} title="Access and Correction">
        <p className="text-[15px] leading-relaxed text-gray-700">
          To request access or correction of your personal information, please contact us using the details below.
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-gray-700">
          We may need to verify your identity before processing your request.
        </p>
      </Section>

      <Section n={11} title="Cookies and Tracking">
        <p className="mb-3 text-[15px] leading-relaxed text-gray-700">We use cookies and similar technologies to:</p>
        <ul className="ml-4 list-disc space-y-1 text-[15px] text-gray-700">
          <li>Improve platform performance</li>
          <li>Analyse usage</li>
          <li>Enhance user experience</li>
        </ul>
        <p className="mt-4 text-[15px] leading-relaxed text-gray-700">
          You can manage cookies through your browser settings.
        </p>
      </Section>

      <Section n={12} title="Third-Party Services">
        <p className="text-[15px] leading-relaxed text-gray-700">
          Our Platform may integrate with third-party services. We are not responsible for the privacy practices of those third
          parties.
        </p>
      </Section>

      <Section n={13} title="Changes to This Policy">
        <p className="text-[15px] leading-relaxed text-gray-700">
          We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective
          date.
        </p>
      </Section>

      <Section n={14} title="Contact Us">
        <p className="mb-3 text-[15px] leading-relaxed text-gray-700">
          If you have any questions or requests regarding this Privacy Policy, please contact us:
        </p>
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

function Sub({ n, title }: { n: string; title: string }) {
  return <h3 className="mt-6 text-base font-semibold text-gray-900">{n} {title}</h3>;
}
