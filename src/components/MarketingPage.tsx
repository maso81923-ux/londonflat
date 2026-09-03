import React from 'react';
import { ArrowLeft, Megaphone, Target, FileText, TrendingUp, Building2, Zap, Shield } from 'lucide-react';

interface MarketingPageProps {
  onNavigate: (view: string) => void;
}

const gtmPlan = [
  {
    title: 'Positioning — the EMD advantage is the engine',
    bullets: [
      'londonflat.uk ≈ 74k/mo searches — flat seekers, renters, sharers.',
      'londonrealestate.app ≈ 110k/mo searches — sales, investment, commercial.',
      'Primary acquisition lever is free, compounding organic/SEO traffic riding the exact-match domains.',
    ],
  },
  {
    title: 'The core sequencing problem (honest)',
    bullets: [
      'Marketplace chicken-and-egg: seekers need inventory, providers need an audience.',
      'Break it deliberately: bootstrap inventory → build audience → sell to providers → convert agencies.',
    ],
  },
  {
    title: 'Target segments (priority order)',
    bullets: [
      'A — Service providers (fastest first £): 20 categories, £650–£1,200/mo; only need proof of a London audience.',
      'B — Independent agents & letting agencies: £1,500/£2,500 per branch/mo; supply inventory via feed; land 2–3 on a free beta first.',
      'C — Build-to-rent operators: large premium portfolios.',
      'D — Seekers (free demand): professionals, expats, students; via SEO content + communities.',
    ],
  },
  {
    title: 'Outreach channels (ranked)',
    bullets: [
      '1. SEO / organic — primary, free, compounding.',
      '2. Direct outreach to agencies & providers — needs email (paid plan).',
      '3. Partnerships — relocation firms, expat/university communities, corporate housing.',
      '4. Paid ads — later, once revenue exists.',
    ],
  },
  {
    title: 'Acquisition sequence (stage-gated)',
    bullets: [
      'Stage 0 (now): unblock payments + email (owner decision).',
      'Stage 1: bootstrap — 2–3 agencies on a free feed beta; seed 20+ providers; publish SEO content.',
      'Stage 2: first revenue — borough sponsorships + Services Hub.',
      'Stage 3: convert agencies to paid; sign BTR operators.',
      'Stage 4: sell the £4,500 header placement once traffic is real.',
    ],
  },
  {
    title: 'KPIs',
    bullets: ['Active listings · MAU · agency feed subscriptions · services-hub subscribers · placement occupancy.'],
  },
  {
    title: 'Honest blockers',
    bullets: [
      'Payments: no provider connected yet — cannot collect money until the payment method is specified.',
      'Email: no integration — cannot run direct outreach yet.',
    ],
  },
];

const pitchPillars = [
  {
    pillar: 'Pillar 1 — XML/API Feed License',
    audience: 'Estate agents & letting agencies',
    headline: "Your whole portfolio on London's premium flat marketplace — automatically.",
    points: [
      ['Problem', 'Manual uploads, stale listings, wasted enquiry time on portals that bury you under thousands.'],
      ['Solution', 'A live XML/API feed syncs your full portfolio in real time, with prioritised indexing in the boroughs you serve.'],
      ['Plans', 'Standard £1,500/branch/mo — automated feed integration, full portfolio sync. Premium £2,500/branch/mo — unlimited updates + prioritised indexing.'],
      ['Proof', 'Real Land Registry sold-price data, borough guides, high-intent London seekers, flat fee (no commission).'],
      ['Objection', '"Why pay when listing is free elsewhere?" — free portals hide you under volume; we index and prioritise you for a flat fee, no per-lead commission.'],
    ],
  },
  {
    pillar: 'Pillar 2 — Services Hub',
    audience: '20 property-lifecycle categories',
    headline: 'Own your category. One flat fee. No bidding.',
    points: [
      ['Problem', 'Londoners search Google for "plumber near me" — not a directory — at the exact moment they need you.'],
      ['Solution', 'Be the listed provider for your category on a premium London property platform, visible at the moment of need.'],
      ['Plans', 'High-ticket £1,200/mo (Legal, Mortgages, Architecture, Independent Agents, Surveying, Eviction, Interior Design). High-frequency £650/mo (Maintenance, Painters, Electricians, Plumbing, Security, Removals, CCTV, Care, Cleaning, Locksmith, Waste, Landscaping).'],
      ['Proof', 'Fixed-price, no-bid, direct checkout; exclusivity per category/borough.'],
    ],
  },
  {
    pillar: 'Pillar 3 — Automated Placements',
    audience: 'Fixed-price inventory',
    headline: 'The one placement every LondonFlat visitor sees.',
    points: [
      ['Problem', 'Stand out against competitors across every entry point, or within a single borough.'],
      ['Solution', 'Main Platform Header £4,500/mo — exclusive global banner. Borough Sponsorship £1,200/mo — the only provider in your category for a chosen borough.'],
      ['Proof', 'No bidding, no correspondence, direct checkout, immediate automated activation.'],
    ],
  },
];

const agenciesCorporate = ['Foxtons', 'Dexters', 'Kinleigh Folkard & Hayward (KFH)', 'Stirling Ackroyd', 'Marsh & Parsons', 'Chestertons', 'Hamptons', 'Savills', 'Knight Frank', 'Winkworth', 'Hunters', 'Haart', 'Bairstow Eves', 'Barnard Marcus', 'Felicity J Lord'];
const agenciesIndependent = ['Benham & Reeves', 'Portico', 'Ludlow Thompson', 'Douglas & Gordon', 'Keatons', 'Currell', 'Antony Roberts'];
const btrOperators = ['Get Living', 'Greystar', 'Quintain Living (Wembley Park)', 'Grainger', 'L&Q Living', 'Related Argent (King\'s Cross)', 'Essential Living', 'UNCLE (Realstar)', 'Vertus (Canary Wharf Group)', 'Fizzy Living (Metropolitan Thames Valley)', 'Folio London (Notting Hill Genesis)', 'Way of Life', 'Dandara Living', 'Be:here (Willmott Dixon)', 'Moda Living'];

const servicesHighTicket: [string, string][] = [
  ['Legal & Notaries', 'source: Law Society find-a-solicitor'],
  ['Banking & Mortgages', 'anchors: L&C Mortgages, Habito, Trussle'],
  ['Architecture & Planning', 'source: RIBA Find an Architect'],
  ['Independent Estate Agents', 'anchor list in Pillar 1'],
  ['Surveying & Valuations', 'source: RICS Find a Surveyor'],
  ['Legal Eviction & Case Handling', 'source: Law Society (landlord & tenant)'],
  ['Interior Design', 'source: BIID (British Institute of Interior Design)'],
];

const servicesHighFrequency: [string, string][] = [
  ['Property Maintenance & Handyman', 'anchors: Fantastic Services, Aspect'],
  ['Painters & Decorators', 'source: Checkatrade, TrustATrader'],
  ['Electricians', 'anchors: Aspect, Rightio; source: NICEIC'],
  ['Plumbing & Heating', 'anchors: Pimlico Plumbers, Dyno-Rod, ERG Facilities'],
  ['Physical Property Security', 'anchors: Banham, Chubb'],
  ['Removals & Transport', "anchors: AnyVan, Pickfords, Bishop's Move"],
  ['Home Surveillance & CCTV', 'anchors: Verisure, ADT'],
  ['Child & Elderly Care', 'anchors: Home Instead, Bluebird Care'],
  ['Cleaning Services', 'anchors: Housekeep, Fantastic Services, Molly Maid'],
  ['Locksmith Services', 'anchor: Banham'],
  ['Waste Removal', 'anchors: Clearabee, HIPPO (HIPPOBAG)'],
  ['Landscape Gardening', 'source: Association of Professional Landscapers (APL)'],
];

export const MarketingPage: React.FC<MarketingPageProps> = ({ onNavigate }) => {
  return (
    <div className="flex-grow bg-slate-950 text-white min-h-screen">
      {/* Header */}
      <div className="relative bg-slate-900 border-b border-slate-800 py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <button
            onClick={() => onNavigate('home')}
            className="text-slate-400 hover:text-white text-sm flex items-center gap-1 mb-6 transition"
          >
            <ArrowLeft className="h-3 w-3" />
            Back
          </button>
          <div className="flex items-center gap-3 mb-3">
            <Megaphone className="h-5 w-5 text-amber-500" />
            <span className="text-amber-500 text-sm font-semibold uppercase tracking-wider">Sales &amp; Marketing</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Go-To-Market Overview</h1>
          <p className="text-slate-400 mt-2">Target lists, pitch one-pagers and the London acquisition plan — all in one view.</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 space-y-16">
        {/* SECTION 1 — Go-to-market plan */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="h-5 w-5 text-amber-500" />
            <h2 className="text-2xl font-bold">1. Go-To-Market Plan</h2>
          </div>
          <div className="space-y-6">
            {gtmPlan.map((s) => (
              <div key={s.title} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                <h3 className="text-base font-semibold text-amber-400 mb-3">{s.title}</h3>
                <ul className="space-y-2">
                  {s.bullets.map((b) => (
                    <li key={b} className="text-sm text-slate-300 flex gap-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2 — Pitch one-pagers */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <FileText className="h-5 w-5 text-amber-500" />
            <h2 className="text-2xl font-bold">2. Pitch One-Pagers</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {pitchPillars.map((p) => (
              <div key={p.pillar} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col">
                <div className="mb-3">
                  <span className="text-amber-500 text-xs font-semibold uppercase tracking-wider">{p.pillar}</span>
                  <p className="text-slate-400 text-xs mt-1">{p.audience}</p>
                </div>
                <h3 className="text-lg font-bold text-white leading-snug mb-4">{p.headline}</h3>
                <div className="space-y-4">
                  {p.points.map(([k, v]) => (
                    <div key={k}>
                      <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{k}</span>
                      <p className="text-sm text-slate-300">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3 — Target lists */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Target className="h-5 w-5 text-amber-500" />
            <h2 className="text-2xl font-bold">3. Target Lists</h2>
          </div>

          {/* Agencies */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-4 w-4 text-amber-500" />
              <h3 className="text-base font-semibold text-white">Estate Agents &amp; Letting Agencies <span className="text-slate-400 font-normal">(API License £1,500/£2,500)</span></h3>
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Corporate / multi-branch (one deal = many branches)</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {agenciesCorporate.map((a) => (
                <span key={a} className="rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs text-slate-200">{a}</span>
              ))}
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Premium / independent</p>
            <div className="flex flex-wrap gap-2">
              {agenciesIndependent.map((a) => (
                <span key={a} className="rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs text-slate-200">{a}</span>
              ))}
            </div>
          </div>

          {/* BTR operators */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-4 w-4 text-amber-500" />
              <h3 className="text-base font-semibold text-white">Build-to-Rent (BTR) Operators</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {btrOperators.map((b) => (
                <span key={b} className="rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs text-slate-200">{b}</span>
              ))}
            </div>
          </div>

          {/* Services hub */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-4 w-4 text-amber-500" />
              <h3 className="text-base font-semibold text-white">Services Hub — 20 Categories</h3>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">High-ticket · £1,200/mo</p>
                <ul className="space-y-2">
                  {servicesHighTicket.map(([name, note]) => (
                    <li key={name} className="text-sm text-slate-300">
                      <span className="text-white">{name}</span>
                      <span className="text-slate-500"> — {note}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">High-frequency · £650/mo</p>
                <ul className="space-y-2">
                  {servicesHighFrequency.map(([name, note]) => (
                    <li key={name} className="text-sm text-slate-300">
                      <span className="text-white">{name}</span>
                      <span className="text-slate-500"> — {note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">Directories to pull full per-borough lists: Yell, Checkatrade, TrustATrader, Rated People, Google Business Profile + trade bodies (NICEIC, Gas Safe Register, RICS, RIBA, Law Society, BIID, APL).</p>
          </div>
        </section>
      </div>
    </div>
  );
};
