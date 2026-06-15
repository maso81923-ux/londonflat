import React, { useState } from 'react';
import type { PropertyListing } from '../db/schema';
import { Search, MapPin, Sparkles, ShieldCheck, CheckCircle2, Star, Compass, ArrowRight, UserPlus } from 'lucide-react';

interface HomePageProps {
  listings: PropertyListing[];
  onNavigate: (view: string, listingId?: string) => void;
  onSearch: (filters: { borough: string; type: string; maxPrice: number }) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ listings, onNavigate, onSearch }) => {
  const [borough, setBorough] = useState('');
  const [type, setType] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      borough,
      type,
      maxPrice: maxPrice ? Number(maxPrice) : 0
    });
    onNavigate('listings');
  };

  const featuredListings = listings.slice(0, 3);

  const boroughsList = [
    'Westminster',
    'Kensington & Chelsea',
    'Camden',
    'Hackney',
    'Tower Hamlets',
    'Greenwich',
    'Islington',
    'Southwark'
  ];

  return (
    <div className="flex-grow bg-slate-950 text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 py-24 md:py-32">
        {/* Background Decorative Gradient Radial */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.07),rgba(255,255,255,0))]" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Tagline Badge */}
          <div className="inline-flex items-center space-x-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-400 mb-6 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>Premium London Housing Only</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-white max-w-4xl mx-auto leading-[1.1] mb-6">
            Find Premium Flats & Flatshares in{' '}
            <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">
              London
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 mb-12 font-medium">
            Discover verified premium rooms, curated professional house-shares, and entire luxury apartments. High performance search under the <span className="text-white font-semibold">londonflat.uk</span> estate network.
          </p>

          {/* Search Engine Placeholder / Real System */}
          <div className="mx-auto max-w-4xl rounded-2xl border border-slate-800 bg-slate-900/50 p-3 sm:p-4 shadow-2xl backdrop-blur-lg mb-16">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-4 items-center">
              
              {/* Borough Select */}
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <select
                  value={borough}
                  onChange={(e) => setBorough(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3.5 pl-10 pr-4 text-xs font-medium text-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none appearance-none cursor-pointer"
                >
                  <option value="">Any London Borough</option>
                  {boroughsList.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Property Type */}
              <div>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3.5 px-4 text-xs font-medium text-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none appearance-none cursor-pointer"
                >
                  <option value="">Any Listing Type</option>
                  <option value="room">Premium Flatshares (Room)</option>
                  <option value="entire_flat">Entire Apartments (Flat)</option>
                </select>
              </div>

              {/* Price Limit */}
              <div>
                <input
                  type="number"
                  placeholder="Max Budget (£/mo)"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3.5 px-4 text-xs font-medium text-slate-300 placeholder:text-slate-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>

              {/* Search Submit button */}
              <div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 py-3.5 text-xs font-bold text-slate-950 transition duration-200 shadow-md active:scale-95"
                >
                  <Search className="h-4 w-4 stroke-[2.5]" />
                  <span>Search Properties</span>
                </button>
              </div>

            </form>
          </div>

          {/* Quick Metrics Banner */}
          <div className="mx-auto max-w-5xl border-y border-slate-900 py-8 grid grid-cols-3 gap-4 text-center">
            <div>
              <span className="block text-xl sm:text-3xl font-extrabold text-amber-500">100%</span>
              <span className="block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">
                Verified Listings
              </span>
            </div>
            <div>
              <span className="block text-xl sm:text-3xl font-extrabold text-white">48h</span>
              <span className="block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">
                Average Match Time
              </span>
            </div>
            <div>
              <span className="block text-xl sm:text-3xl font-extrabold text-white">£0</span>
              <span className="block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">
                Searcher Fee
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* Trust & Guarantee Section */}
      <section className="bg-slate-900 py-20 border-y border-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Setting the Standard for Premium London Lettings
            </h2>
            <p className="mt-3 text-slate-400 text-sm">
              We vet every partner agency and private landlord to ensure an exceptionally reliable marketplace. No spam, no scams, no duplicate listings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl bg-slate-950 p-8 border border-slate-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 mb-6">
                <ShieldCheck className="h-6 w-6 text-amber-500" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Verified Providers</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                All registered letting agencies undergo strict license verification matching standard United Kingdom agency mandates.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-950 p-8 border border-slate-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 mb-6">
                <CheckCircle2 className="h-6 w-6 text-amber-500" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">High Performance Platform</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Experience instantaneous filtering, precise maps, and direct, automated booking notifications designed for the premium market.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-950 p-8 border border-slate-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 mb-6">
                <Star className="h-6 w-6 text-amber-500" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Strict Quality Copy</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                We maintain strictly professional English descriptions and clear terms of rent, bills, deposit, and roommate conditions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl text-white">
              Featured Properties & Flatshares
            </h2>
            <p className="mt-2 text-slate-400 text-sm">
              Discover verified accommodations handpicked for their premium finishes and exceptional locations.
            </p>
          </div>
          <button
            onClick={() => onNavigate('listings')}
            className="mt-4 sm:mt-0 inline-flex items-center space-x-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition"
          >
            <span>View All Listings</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredListings.map((listing) => (
            <div 
              key={listing.id}
              onClick={() => onNavigate('details', listing.id)}
              className="group cursor-pointer rounded-2xl bg-slate-900 border border-slate-800/80 overflow-hidden transition duration-300 hover:border-amber-500/30 hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1"
            >
              {/* Image Carousel Mock Container */}
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <img 
                  src={listing.images[0]} 
                  alt={listing.title} 
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 rounded-lg bg-slate-950/80 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-amber-400 border border-amber-500/20 shadow-md">
                  {listing.type === 'room' ? 'Room / Flatshare' : 'Entire Flat'}
                </div>
                {listing.is_verified && (
                  <div className="absolute top-4 right-4 rounded-lg bg-amber-500 px-2.5 py-1 text-[10px] font-bold text-slate-950 uppercase tracking-wider">
                    Verified
                  </div>
                )}
                {/* Price Overlay */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 to-transparent p-4 flex items-end justify-between">
                  <span className="text-lg font-bold text-white">
                    £{listing.price_per_month.toLocaleString()} <span className="text-xs font-medium text-slate-300">/ month</span>
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-medium">
                    {listing.is_bills_included ? 'Bills Inc.' : 'Excl. Bills'}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 text-left">
                <div className="flex items-center text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-500 mr-1 shrink-0" />
                  <span>{listing.borough} • {listing.postcode}</span>
                </div>
                
                <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition line-clamp-1 mb-2">
                  {listing.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {listing.description}
                </p>

                <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 text-xs text-slate-400">
                  <div className="flex items-center space-x-4">
                    <span><strong>{listing.bedrooms}</strong> {listing.bedrooms === 1 ? 'bed' : 'beds'}</span>
                    <span><strong>{listing.bathrooms}</strong> {listing.bathrooms === 1 ? 'bath' : 'baths'}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Available from {new Date(listing.available_from).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* London Borough Spotlight */}
      <section id="about-london-section" className="bg-slate-900/40 py-20 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto mb-16">
            <Compass className="h-10 w-10 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold sm:text-3xl text-white">
              Navigating London's Neighborhoods
            </h2>
            <p className="mt-3 text-slate-400 text-sm">
              Each London borough holds its unique soul and appeal. Let us guide you to the perfect premium match.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <div className="rounded-2xl border border-slate-800/60 bg-slate-950 p-6">
              <h3 className="text-sm font-bold text-white mb-2">Kensington & Chelsea</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Stately, elegant, and historically premium. Perfect for quiet executives, boasting high-end shopping and lush communal gardens.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800/60 bg-slate-950 p-6">
              <h3 className="text-sm font-bold text-white mb-2">Hackney & Shoreditch</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                A vibrant hub of creative and tech professionals. Famed for its industrial developments, loft apartments, and trendy culinary spots.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800/60 bg-slate-950 p-6">
              <h3 className="text-sm font-bold text-white mb-2">Canary Wharf</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Skyscrapers, clean waterside paths, and premium amenities. Highly favored by financial professionals looking for super-high-spec high-rises.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800/60 bg-slate-950 p-6">
              <h3 className="text-sm font-bold text-white mb-2">Camden</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Eclectic, scenic, and historic. Featuring elegant Victorian terraces bordering the famous locks, providing quick access to Regent's Park.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Gilded Panel */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700/30 overflow-hidden p-8 sm:p-12 md:p-16 text-center shadow-2xl">
          {/* Gilded Background Accents */}
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold sm:text-4xl text-white mb-6">
              Ready to Join the Premier London Network?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-10">
              Whether you are looking for a beautiful room in a verified flatshare, or representing a letting agency looking to list high-end properties directly on the <span className="text-amber-400 font-semibold">londonflat.uk</span> estate network, registering is seamless and free.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => onNavigate('listings')}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-8 py-4 text-xs font-bold text-slate-950 shadow-xl shadow-amber-500/10 transition"
              >
                <span>Browse Active Listings</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => onNavigate('dashboard')}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-xl bg-slate-950/80 hover:bg-slate-950 border border-slate-700 hover:border-slate-600 px-8 py-4 text-xs font-bold text-slate-200 transition"
              >
                <UserPlus className="h-4 w-4" />
                <span>Create Agency Account</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
