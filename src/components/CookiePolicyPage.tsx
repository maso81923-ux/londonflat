import { Cookie, ArrowRight } from 'lucide-react';
import { SEO } from './SEO';
import { StructuredData } from './StructuredData';

interface CookiePolicyPageProps {
  onNavigate: (view: string) => void;
}

/**
 * Owner-supplied legal copy — reproduced verbatim.
 * Contains the Cookie Policy & Consent Banner Text plus the full Technical Preferences Panel wording.
 */
export const CookiePolicyPage: React.FC<CookiePolicyPageProps> = ({ onNavigate }) => {
  return (
    <div className="flex-grow bg-slate-950 text-white min-h-screen">
      {/* Hero */}
      <div className="relative bg-slate-900 border-b border-slate-800 py-12 sm:py-20">
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-amber-500 text-sm font-semibold mb-3">
            <Cookie className="h-4 w-4" />
            Legal &amp; Trust
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">Cookie Policy</h1>
          <p className="max-w-2xl text-lg text-slate-400">Last Updated: September 26, 2026</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar TOC */}
          <aside className="hidden lg:block">
            <nav className="sticky top-8 space-y-1">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">On this page</h3>
              <a href="#cookie-policy-text" className="block text-sm text-slate-400 hover:text-amber-500 transition py-1">
                Cookie Policy &amp; Consent Banner Text
              </a>
              <a href="#technical-preferences-panel" className="block text-sm text-slate-400 hover:text-amber-500 transition py-1">
                Technical Preferences Panel
              </a>
            </nav>
          </aside>

          {/* Policy body */}
          <article className="lg:col-span-3 space-y-8">
            {/* Cookie Policy & Consent Banner Text */}
            <section id="cookie-policy-text" className="scroll-mt-20">
              <h2 className="text-xl font-bold text-white mb-3">Cookie Policy &amp; Consent Banner Text</h2>
              <p className="text-slate-300 leading-relaxed">
                We use cookies to secure our PropTech ecosystem, optimize speed via the Vercel network, and deliver
                targeted real estate listings. By clicking 'Accept All', you consent to the activation of our automated
                performance and analytical metrics in full compliance with UK GDPR and PECR regulations. You can manage
                your specific preferences or read our policy at any time.
              </p>
              <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-slate-400">
                Interface Navigation Controls (banner buttons — exact labels)
              </h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-300">
                <li>Button 1: Accept All</li>
                <li>Button 2: Reject Non-Essential</li>
                <li>Button 3: Cookie Settings</li>
              </ul>
            </section>

            {/* Technical Preferences Panel */}
            <section id="technical-preferences-panel" className="scroll-mt-20">
              <h2 className="text-xl font-bold text-white mb-4">Technical Preferences Panel</h2>

              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-bold text-white">1. Strictly Necessary Cookies</h3>
                    <span className="inline-block rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Always Active
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    Required for core platform functionality, secure SSL routing via GitHub/Vercel architecture, and
                    user dashboard stability. Cannot be disabled.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-bold text-white">2. Analytical &amp; Performance Cookies</h3>
                    <span className="inline-block rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Disabled by Default
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    Used exclusively to track search volume patterns across London Boroughs and evaluate structural
                    traffic entry points without identifying individual users.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-bold text-white">3. Integrated Ecosystem Cookies</h3>
                    <span className="inline-block rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Disabled by Default
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    Facilitates secure API routing and XML feed tracking between your browser and our corporate partner
                    agencies for real-time listings and related services synchronization.
                  </p>
                </div>
              </div>
            </section>

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

      <SEO title="Cookie Policy" description="How LondonFlat uses cookies — UK GDPR & PECR compliant cookie policy and consent preferences." path="/cookie-policy" />
      <StructuredData type="BreadcrumbList" breadcrumbs={[{ name: 'Home', url: '/' }, { name: 'Cookie Policy', url: '/cookie-policy' }]} />
    </div>
  );
};