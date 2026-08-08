import { Scale, Shield, AlertTriangle, ArrowRight } from 'lucide-react';
import rightsData from '../data/tenantRights.json';
import { StructuredData } from './StructuredData';

interface TenantRightsPageProps {
  slug: string;
  onNavigate: (view: string, listingId?: string, serviceCategory?: string) => void;
}

export const TenantRightsPage: React.FC<TenantRightsPageProps> = ({ slug, onNavigate }) => {
  const article = (rightsData as any).articles.find((a: any) => a.slug === slug);

  if (!article) {
    return (
      <div className="flex-grow bg-slate-950 text-white flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Scale className="h-16 w-16 text-slate-700 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Article Not Found</h1>
          <p className="text-slate-400 mb-6">We couldn't find this rights guide.</p>
          <button onClick={() => onNavigate('home')} className="px-6 py-3 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 transition">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow bg-slate-950 text-white min-h-screen">
      {/* Hero */}
      <div className="relative bg-slate-900 border-b border-slate-800 py-12 sm:py-20">
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-amber-500 text-sm font-semibold mb-3">
            <Scale className="h-4 w-4" />
            Tenant & Landlord Rights
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            {article.title}
          </h1>
          <p className="max-w-2xl text-lg text-slate-400">{article.summary}</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar TOC */}
          <aside className="hidden lg:block">
            <nav className="sticky top-8 space-y-1">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">On this page</h3>
              {article.sections.map((s: any, i: number) => (
                <a
                  key={i}
                  href={`#section-${i}`}
                  className="block text-sm text-slate-400 hover:text-amber-500 transition py-1"
                >
                  {s.heading}
                </a>
              ))}
            </nav>
          </aside>

          {/* Article body */}
          <article className="lg:col-span-3 space-y-8">
            {article.sections.map((s: any, i: number) => (
              <section key={i} id={`section-${i}`} className="scroll-mt-20">
                <h2 className="text-xl font-bold text-white mb-3">{s.heading}</h2>
                <p className="text-slate-300 leading-relaxed">{s.body}</p>
              </section>
            ))}

            {/* Eviction CTA for eviction-focused articles */}
            {article.showEvictionCTA && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 mt-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-amber-500/10 shrink-0">
                    <AlertTriangle className="h-6 w-6 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">
                      ⚖️ Legal Eviction & Case Handling
                    </h3>
                    <p className="text-slate-400 text-sm mb-4">
                      Expert solicitors for possession proceedings, deposit disputes, and tenant defence. Fixed-fee consultations available.
                    </p>
                    <button
                      onClick={() => onNavigate('services', undefined, 'legal-eviction')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 transition text-sm"
                    >
                      View Specialists <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* General services CTA */}
            {!article.showEvictionCTA && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 mt-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-slate-800 shrink-0">
                    <Shield className="h-6 w-6 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">Need legal advice?</h3>
                    <p className="text-slate-400 text-sm mb-4">
                      Our verified legal partners can help with tenancy disputes, deposit claims, and housing conditions.
                    </p>
                    <button
                      onClick={() => onNavigate('services', undefined, 'legal-notaries')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition text-sm border border-slate-700"
                    >
                      View Legal & Notaries <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </article>
        </div>
      </div>

      {/* Structured Data: Article */}
      <StructuredData
        type="Article"
        article={{
          headline: article.title,
          description: article.summary,
          datePublished: '2026-07-15T00:00:00+00:00',
          author: 'LondonFlat',
          url: `https://londonflat.uk/rights/${slug}`,
        }}
      />
    </div>
  );
};
