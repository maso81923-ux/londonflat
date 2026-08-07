import { MapPin, Building2, Train, Users, Star, ArrowRight } from 'lucide-react';
import boroughData from '../data/boroughs.json';

interface BoroughGuidePageProps {
  slug: string;
  onNavigate: (view: string, listingId?: string, serviceCategory?: string) => void;
}

export const BoroughGuidePage: React.FC<BoroughGuidePageProps> = ({ slug, onNavigate }) => {
  const borough = (boroughData as any).boroughs[slug];

  if (!borough) {
    return (
      <div className="flex-grow bg-slate-950 text-white flex items-center justify-center min-h-screen">
        <div className="text-center">
          <MapPin className="h-16 w-16 text-slate-700 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Borough Not Found</h1>
          <p className="text-slate-400 mb-6">We couldn't find a guide for this London borough.</p>
          <button
            onClick={() => onNavigate('home')}
            className="px-6 py-3 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const formatPrice = (p: number) => `£${p.toLocaleString()}`;

  return (
    <div className="flex-grow bg-slate-950 text-white min-h-screen">
      {/* Hero */}
      <div className="relative bg-slate-900 border-b border-slate-800 py-16 sm:py-24">
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-amber-500 text-sm font-semibold mb-4">
            <MapPin className="h-4 w-4" />
            {borough.zone} · London
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-4">
            {borough.name} Area Guide
          </h1>
          <p className="max-w-2xl text-lg text-slate-400 mb-8">
            {borough.description}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('listings')}
              className="px-6 py-3 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 transition flex items-center gap-2"
            >
              Browse listings in {borough.name} <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigate('services')}
              className="px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition border border-slate-700"
            >
              View local services
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Rent Table */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Building2 className="h-6 w-6 text-amber-500" />
                Average Rental Prices
              </h2>
              <div className="overflow-hidden rounded-xl border border-slate-800">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-900">
                      <th className="px-6 py-3 text-sm font-semibold text-slate-400">Property Type</th>
                      <th className="px-6 py-3 text-sm font-semibold text-slate-400">Per Month (PCM)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {borough.averageRent.studio && (
                      <tr className="hover:bg-slate-900/50 transition">
                        <td className="px-6 py-4 text-white font-medium">Studio</td>
                        <td className="px-6 py-4 text-amber-400 font-bold">{formatPrice(borough.averageRent.studio)}</td>
                      </tr>
                    )}
                    <tr className="hover:bg-slate-900/50 transition">
                      <td className="px-6 py-4 text-white font-medium">1 Bedroom</td>
                      <td className="px-6 py-4 text-amber-400 font-bold">{formatPrice(borough.averageRent['1bed'])}</td>
                    </tr>
                    <tr className="hover:bg-slate-900/50 transition">
                      <td className="px-6 py-4 text-white font-medium">2 Bedrooms</td>
                      <td className="px-6 py-4 text-amber-400 font-bold">{formatPrice(borough.averageRent['2bed'])}</td>
                    </tr>
                    <tr className="hover:bg-slate-900/50 transition">
                      <td className="px-6 py-4 text-white font-medium">3 Bedrooms</td>
                      <td className="px-6 py-4 text-amber-400 font-bold">{formatPrice(borough.averageRent['3bed'])}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Sale Prices */}
            {borough.averageSalePrice && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Building2 className="h-6 w-6 text-amber-500" />
                  Average Sale Prices
                </h2>
                <div className="overflow-hidden rounded-xl border border-slate-800">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-900">
                        <th className="px-6 py-3 text-sm font-semibold text-slate-400">Property Type</th>
                        <th className="px-6 py-3 text-sm font-semibold text-slate-400">Guide Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {Object.entries(borough.averageSalePrice).map(([key, price]) => (
                        <tr key={key} className="hover:bg-slate-900/50 transition">
                          <td className="px-6 py-4 text-white font-medium">{key.replace('bed', ' Bedroom').replace('1', '1').replace('2', '2').replace('3', '3')}</td>
                          <td className="px-6 py-4 text-amber-400 font-bold">{formatPrice(price as number)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Transport */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Train className="h-6 w-6 text-amber-500" />
                Transport Links
              </h2>
              <div className="flex flex-wrap gap-2">
                {borough.transport.map((line: string) => (
                  <span key={line} className="px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-white text-sm font-medium">
                    {line}
                  </span>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Demographics */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Users className="h-5 w-5 text-amber-500" />
                Who Lives Here
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">{borough.demographic}</p>
            </div>

            {/* Vibe */}
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
              <h3 className="text-lg font-bold text-white mb-2">🏷️ The Vibe</h3>
              <p className="text-amber-400 font-semibold">{borough.vibe}</p>
            </div>

            {/* Highlights */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                Highlights
              </h3>
              <ul className="space-y-3">
                {borough.highlights.map((h: string) => (
                  <li key={h} className="flex items-start gap-3 text-sm text-slate-300">
                    <span className="text-amber-500 mt-0.5">•</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
              <Building2 className="h-8 w-8 text-amber-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Find your {borough.name} home</h3>
              <p className="text-slate-400 text-sm mb-4">Browse verified listings from trusted agencies and landlords.</p>
              <button
                onClick={() => onNavigate('listings')}
                className="w-full px-4 py-3 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 transition"
              >
                View Listings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
