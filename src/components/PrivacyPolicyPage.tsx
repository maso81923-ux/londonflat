import { ShieldCheck, ArrowRight } from 'lucide-react';
import { SEO } from './SEO';
import { StructuredData } from './StructuredData';

interface PrivacyPolicyPageProps {
  onNavigate: (view: string) => void;
}

/**
 * Owner-supplied legal copy — reproduced verbatim.
 * Privacy Policy sections 1–8. Last Updated: September 26, 2026.
 */
export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onNavigate }) => {
  const sections = [
    {
      heading: '1. INTRODUCTION',
      body: (
        <>
          This Privacy Policy governs the processing of personal data collected through our PropTech platforms,
          LondonFlat (londonflat.uk) and LondonRealEstate (londonrealestate.app), hereinafter referred to as "the
          Platforms". The Platforms are fully committed to protecting the privacy of our users, clients, and partner
          agencies in strict compliance with the UK General Data Protection Regulation (UK GDPR) and the Data
          Protection Act 2018.
        </>
      ),
    },
    {
      heading: '2. DATA CONTROLLER',
      body: (
        <>
          The data controller responsible for your personal information is the management of the Platforms. For any
          privacy-related inquiries, automated feed configurations, or data subject rights, you can contact us at:{' '}
          <a href="mailto:privacy@londonflat.uk" className="text-amber-500 underline underline-offset-2 hover:text-amber-400">
            privacy@londonflat.uk
          </a>
          .
        </>
      ),
    },
    {
      heading: '3. TYPES OF DATA WE COLLECT',
      body: (
        <>
          <p>We process personal data only to the extent necessary to deliver our automated real estate ecosystem and related services:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Identity Data: Full name, professional credentials (for registered agents and service providers).</li>
            <li>Contact Data: Email address, telephone number, and physical billing address.</li>
            <li>Technical &amp; Feed Data: IP addresses, device identifiers, cookies, and structured XML/API feed payload logs transmitted by partner agencies.</li>
            <li>Property &amp; Service Preference Data: Search parameters, geographical layout queries (Borough metadata), and interactions with integrated financial, legal, removal, cleaning, and design services.</li>
          </ul>
        </>
      ),
    },
    {
      heading: '4. LAWFUL BASIS FOR PROCESSING',
      body: (
        <>
          <p>Under the UK GDPR, we process your data based on the following legal grounds:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Performance of a Contract: To operate the automated real estate portal and facilitate XML/API data synchronization.</li>
            <li>Legal Obligation: To prevent fraud and secure financial transactions within the network.</li>
            <li>Legitimate Interests: To monitor platform performance, prevent cybersecurity threats, and optimize the automated PropTech infrastructure.</li>
          </ul>
        </>
      ),
    },
    {
      heading: '5. DATA SHARING AND THE INTEGRATED ECOSYSTEM',
      body: (
        <>
          The Platforms act as an automated syndication hub. Property listings, contact details, and routing inquiries
          are automatically shared with authorized real estate agencies and integrated ecosystem service providers
          (including legal, relocation, maintenance, and interior design firms) via secure API endpoints. We do not
          sell or lease personal data to unauthorized third-party marketing networks.
        </>
      ),
    },
    {
      heading: '6. INTERNATIONAL DATA TRANSFERS',
      body: (
        <>
          Our platform infrastructure is decentralized and optimized using Vercel and GitHub, ensuring industry-standard
          security. Any data processed outside the United Kingdom or the European Economic Area (EEA) is protected by
          standard contractual clauses (SCCs) to ensure equivalent data protection levels.
        </>
      ),
    },
    {
      heading: '7. DATA SECURITY AND ZERO-DATABASE INTEGRITY',
      body: (
        <>
          The Platforms utilize an advanced, decentralized software architecture. All data transfers, including
          structural API updates and external property feeds, are encrypted using Mandatory SSL (HTTPS) protocols. Our
          systems are engineered to prevent traditional database vulnerabilities and mitigate external cybersecurity
          breach attempts from aggressive competitors.
        </>
      ),
    },
    {
      heading: '8. YOUR RIGHTS UNDER UK GDPR',
      body: (
        <>
          <p>As a UK resident, you possess the following explicit legal rights:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>The right to access your personal data.</li>
            <li>The right to rectification of inaccurate information.</li>
            <li>The right to erasure ("the right to be forgotten").</li>
            <li>The right to restrict or object to data processing.</li>
            <li>The right to data portability.</li>
          </ul>
          <p className="mt-4">
            To exercise these rights, contact:{' '}
            <a href="mailto:info@londonflat.uk" className="text-amber-500 underline underline-offset-2 hover:text-amber-400">
              info@londonflat.uk
            </a>
            . You also retain the right to lodge a formal complaint with the Information Commissioner's Office (ICO) at{' '}
            <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-amber-500 underline underline-offset-2 hover:text-amber-400">
              ico.org.uk
            </a>
            .
          </p>
        </>
      ),
    },
  ];

  return (
    <div className="flex-grow bg-slate-950 text-white min-h-screen">
      {/* Hero */}
      <div className="relative bg-slate-900 border-b border-slate-800 py-12 sm:py-20">
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-amber-500 text-sm font-semibold mb-3">
            <ShieldCheck className="h-4 w-4" />
            Legal &amp; Trust
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">Privacy Policy</h1>
          <p className="max-w-2xl text-lg text-slate-400">Last Updated: September 26, 2026</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar TOC */}
          <aside className="hidden lg:block">
            <nav className="sticky top-8 space-y-1">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">On this page</h3>
              {sections.map((s) => (
                <a
                  key={s.heading}
                  href={`#section-${s.heading.split('.')[0]}`}
                  className="block text-sm text-slate-400 hover:text-amber-500 transition py-1"
                >
                  {s.heading}
                </a>
              ))}
            </nav>
          </aside>

          {/* Policy body */}
          <article className="lg:col-span-3 space-y-8">
            {sections.map((s) => (
              <section key={s.heading} id={`section-${s.heading.split('.')[0]}`} className="scroll-mt-20">
                <h2 className="text-xl font-bold text-white mb-3">{s.heading}</h2>
                <div className="text-slate-300 leading-relaxed">{s.body}</div>
              </section>
            ))}

            {/* Back to home */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 mt-8">
              <button
                onClick={() => onNavigate('home')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 transition text-sm"
              >
                Back to Home <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </article>
        </div>
      </div>

      <SEO title="Privacy Policy" description="How LondonFlat processes personal data — UK GDPR & Data Protection Act 2018 compliance." path="/privacy-policy" />
      <StructuredData type="BreadcrumbList" breadcrumbs={[{ name: 'Home', url: '/' }, { name: 'Privacy Policy', url: '/privacy-policy' }]} />
    </div>
  );
};