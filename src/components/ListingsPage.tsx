import React, { useState, useMemo } from 'react';
import type { PropertyListing } from '../db/schema';
import { MapPin, SlidersHorizontal, Check, Info, Compass, ShieldCheck } from 'lucide-react';

interface ListingsPageProps {
  listings: PropertyListing[];
  onNavigate: (view: string, listingId?: string) => void;
  initialFilters?: { borough: string; type: string; maxPrice: number; purpose?: string };
}

export const ListingsPage: React.FC<ListingsPageProps> = ({
  listings,
  onNavigate,
  initialFilters
}) => {
  const [boroughFilter, setBoroughFilter] = useState(initialFilters?.borough || '');
  const [typeFilter, setTypeFilter] = useState(initialFilters?.type || '');
  const [purposeFilter, setPurposeFilter] = useState<string>(initialFilters?.purpose || 'rent');
  const [maxPriceFilter, setMaxPriceFilter] = useState(
    initialFilters?.maxPrice ? String(initialFilters.maxPrice) : ''
  );
  const [billsFilter, setBillsFilter] = useState(false);
  const [bedroomsFilter, setBedroomsFilter] = useState('');

  const [hoveredBorough, setHoveredBorough] = useState<string | null>(null);

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

  // Live client filtering
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      if (purposeFilter && item.listing_purpose !== purposeFilter) return false;
      if (boroughFilter && item.borough !== boroughFilter) return false;
      if (typeFilter && item.type !== typeFilter) return false;
      
      const price = item.listing_purpose === 'sale' ? (item.price || 0) : (item.price_per_month || 0);
      if (maxPriceFilter && price > Number(maxPriceFilter)) return false;
      
      if (billsFilter && !item.is_bills_included) return false;
      if (bedroomsFilter && item.bedrooms !== Number(bedroomsFilter)) return false;
      return true;
    });
  }, [listings, boroughFilter, typeFilter, purposeFilter, maxPriceFilter, billsFilter, bedroomsFilter]);

  // Map highlights representing physical coordinates on our styled vector map
  const activeBorough = boroughFilter || hoveredBorough;

  const handleResetFilters = () => {
    setBoroughFilter('');
    setTypeFilter('');
    setPurposeFilter('rent');
    setMaxPriceFilter('');
    setBillsFilter(false);
    setBedroomsFilter('');
  };

  return (
    <div className="flex-grow bg-slate-950 text-white min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Purpose Filter Bar (NEW) */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 bg-slate-900 rounded-xl border border-slate-800">
            {[
              { id: 'rent', label: 'Rent' },
              { id: 'sale', label: 'Sale' },
              { id: 'buy', label: 'Buy' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setPurposeFilter(p.id);
                  setMaxPriceFilter(''); // Reset budget as scale changes significantly
                }}
                className={`px-6 py-2 text-xs font-bold rounded-lg transition ${
                  purposeFilter === p.id
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="text-left mb-8 border-b border-slate-900 pb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Available Premium Residences
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Showing {filteredListings.length} of {listings.length} high-specifications rooms and apartments in Greater London.
          </p>
        </div>

        {/* Outer Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 7 COLS: Filters & Listing Cards */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Filter Panel */}
            <div className="rounded-xl border border-slate-900 bg-slate-900/40 p-4 sm:p-5 backdrop-blur-md">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <SlidersHorizontal className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Refine Search</span>
                </div>
                {(boroughFilter || typeFilter || maxPriceFilter || billsFilter || bedroomsFilter) && (
                  <button
                    onClick={handleResetFilters}
                    className="text-[10px] font-bold text-amber-500 hover:text-amber-400 transition"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Borough Select */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    London Borough
                  </label>
                  <select
                    value={boroughFilter}
                    onChange={(e) => setBoroughFilter(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3 text-xs font-medium text-slate-300 focus:border-amber-500 outline-none cursor-pointer"
                  >
                    <option value="">All Boroughs</option>
                    {boroughsList.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                {/* Type Select */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Listing Type
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3 text-xs font-medium text-slate-300 focus:border-amber-500 outline-none cursor-pointer"
                  >
                    <option value="">All Types</option>
                    <option value="room">Flatshare (Room)</option>
                    <option value="entire_flat">Entire Apartment</option>
                  </select>
                </div>

                {/* Max Budget */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    {purposeFilter === 'sale' ? 'Max Purchase Price (£)' : 'Max Monthly Rent (£)'}
                  </label>
                  <input
                    type="number"
                    placeholder={purposeFilter === 'sale' ? 'e.g. 1000000' : 'e.g. 2000'}
                    value={maxPriceFilter}
                    onChange={(e) => setMaxPriceFilter(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3 text-xs font-medium text-slate-300 placeholder:text-slate-700 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* Extra Filters */}
              <div className="mt-4 pt-3 border-t border-slate-800/50 flex flex-wrap items-center justify-between gap-3">
                
                {/* Bedrooms Select */}
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bedrooms:</span>
                  <div className="flex space-x-1.5">
                    {['', '1', '2', '3'].map((num) => (
                      <button
                        key={num}
                        onClick={() => setBedroomsFilter(num)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-md border transition ${
                          bedroomsFilter === num
                            ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        {num === '' ? 'Any' : num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bills Toggle */}
                <label className="inline-flex items-center space-x-2 cursor-pointer group">
                  <div 
                    onClick={() => setBillsFilter(!billsFilter)}
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                      billsFilter 
                        ? 'border-amber-500 bg-amber-500 text-slate-950' 
                        : 'border-slate-800 bg-slate-950 group-hover:border-slate-600'
                    }`}
                  >
                    {billsFilter && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none">
                    All Bills Included
                  </span>
                </label>

              </div>
            </div>

            {/* Results Grid */}
            {filteredListings.length > 0 ? (
              <div className="space-y-4">
                {filteredListings.map((listing) => (
                  <div
                    key={listing.id}
                    onClick={() => onNavigate('details', listing.id)}
                    onMouseEnter={() => setHoveredBorough(listing.borough)}
                    onMouseLeave={() => setHoveredBorough(null)}
                    className="group flex flex-col sm:flex-row cursor-pointer overflow-hidden rounded-2xl border border-slate-900 bg-slate-900/30 transition duration-300 hover:border-amber-500/25 hover:shadow-lg hover:shadow-amber-500/5 hover:-translate-y-0.5"
                  >
                    {/* Left: Thumbnail aspect-[16/10] */}
                    <div className="relative w-full sm:w-48 md:w-56 shrink-0 overflow-hidden bg-slate-950">
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 rounded-md bg-slate-950/80 backdrop-blur-md px-2 py-1 text-[10px] font-bold text-amber-400 border border-amber-500/10">
                        {listing.type === 'room' ? 'Room' : 'Apartment'}
                      </div>
                    </div>

                    {/* Right: Info */}
                    <div className="p-5 flex-grow text-left flex flex-col justify-between">
                      <div>
                        {/* Upper Details */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center text-slate-500 text-[9px] font-bold uppercase tracking-widest">
                            <MapPin className="h-3 w-3 text-amber-500 mr-1" />
                            <span>{listing.borough} • {listing.postcode}</span>
                          </div>
                          {listing.is_verified && (
                            <span className="flex items-center text-[9px] font-bold text-amber-400 bg-amber-500/5 px-2 py-0.5 rounded-full border border-amber-500/10">
                              <ShieldCheck className="h-3 w-3 mr-0.5" />
                              VERIFIED
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-extrabold text-white group-hover:text-amber-400 transition leading-snug line-clamp-1 mb-1.5">
                          {listing.title}
                        </h3>

                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                          {listing.description}
                        </p>
                      </div>

                      {/* Lower Metrics */}
                      <div className="flex items-center justify-between border-t border-slate-900 pt-3 text-xs text-slate-500">
                        <div className="flex items-center space-x-3 text-[11px]">
                          <span><strong>{listing.bedrooms}</strong> {listing.bedrooms === 1 ? 'bed' : 'beds'}</span>
                          <span>•</span>
                          <span><strong>{listing.bathrooms}</strong> {listing.bathrooms === 1 ? 'bath' : 'baths'}</span>
                        </div>
                        
                        <div className="text-right">
                          <span className="block text-sm font-extrabold text-white leading-none">
                            {listing.listing_purpose === 'sale' 
                              ? `£${listing.price?.toLocaleString()}` 
                              : listing.listing_purpose === 'buy'
                                ? 'Offers invited'
                                : `£${listing.price_per_month?.toLocaleString()}/mo`
                            }
                          </span>
                          <span className="text-[9px] text-slate-500">
                            {listing.listing_purpose === 'rent' 
                              ? (listing.is_bills_included ? 'inc. bills' : 'excl. bills')
                              : listing.listing_purpose === 'sale' ? 'Freehold/Leasehold' : 'Market interest'}
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center">
                <Info className="h-8 w-8 text-slate-600 mx-auto mb-4" />
                <h3 className="text-sm font-bold text-slate-300 mb-1">No matching listings found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                  Try broadening your budget threshold, checking "All Boroughs", or looking for any housing type.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white px-4 py-2 text-xs font-semibold text-slate-300 transition"
                >
                  Clear Active Filters
                </button>
              </div>
            )}

          </div>

          {/* RIGHT 5 COLS: Vector Blueprint London Map Placeholder */}
          <div className="lg:col-span-5 sticky top-28 hidden lg:block">
            <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-5 overflow-hidden text-center backdrop-blur-md relative">
              
              {/* Compass Icon */}
              <div className="absolute top-4 left-4 flex items-center space-x-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <Compass className="h-4 w-4 text-slate-600 animate-spin-slow" />
                <span>London Grid Vector</span>
              </div>

              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 text-right">
                Borough Heat Map
              </h2>

              {/* Styled CSS SVG Vector Map Mock */}
              <div className="aspect-[5/4] w-full rounded-xl border border-slate-800/60 bg-slate-950 p-4 relative flex flex-col justify-between overflow-hidden shadow-inner">
                {/* Visual grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />
                
                {/* Simulated Thames River Vector Path */}
                <div className="absolute inset-x-0 top-[60%] h-4 bg-slate-900 border-y border-slate-800/40 rotate-1 shadow-inner z-0 pointer-events-none" />

                {/* Map Borough Nodes */}
                <div className="relative z-10 grid grid-cols-3 gap-3 h-full items-center justify-center p-2">
                  
                  {/* Camden */}
                  <div 
                    onMouseEnter={() => setHoveredBorough('Camden')}
                    onMouseLeave={() => setHoveredBorough(null)}
                    onClick={() => setBoroughFilter(boroughFilter === 'Camden' ? '' : 'Camden')}
                    className={`p-3 rounded-lg border text-center transition cursor-pointer flex flex-col justify-center ${
                      activeBorough === 'Camden'
                        ? 'border-amber-500 bg-amber-500/15 text-white shadow-lg shadow-amber-500/10 scale-105'
                        : 'border-slate-900 bg-slate-900/40 text-slate-500 hover:border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    <span className="text-[10px] font-bold">Camden</span>
                    <span className="text-[8px] font-medium opacity-60">NW London</span>
                  </div>

                  {/* Hackney */}
                  <div 
                    onMouseEnter={() => setHoveredBorough('Hackney')}
                    onMouseLeave={() => setHoveredBorough(null)}
                    onClick={() => setBoroughFilter(boroughFilter === 'Hackney' ? '' : 'Hackney')}
                    className={`p-3 rounded-lg border text-center transition cursor-pointer flex flex-col justify-center ${
                      activeBorough === 'Hackney'
                        ? 'border-amber-500 bg-amber-500/15 text-white shadow-lg shadow-amber-500/10 scale-105'
                        : 'border-slate-900 bg-slate-900/40 text-slate-500 hover:border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    <span className="text-[10px] font-bold">Hackney</span>
                    <span className="text-[8px] font-medium opacity-60">East London</span>
                  </div>

                  {/* Islington */}
                  <div 
                    onMouseEnter={() => setHoveredBorough('Islington')}
                    onMouseLeave={() => setHoveredBorough(null)}
                    onClick={() => setBoroughFilter(boroughFilter === 'Islington' ? '' : 'Islington')}
                    className={`p-3 rounded-lg border text-center transition cursor-pointer flex flex-col justify-center ${
                      activeBorough === 'Islington'
                        ? 'border-amber-500 bg-amber-500/15 text-white shadow-lg shadow-amber-500/10 scale-105'
                        : 'border-slate-900 bg-slate-900/40 text-slate-500 hover:border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    <span className="text-[10px] font-bold">Islington</span>
                    <span className="text-[8px] font-medium opacity-60">Central N</span>
                  </div>

                  {/* Westminster */}
                  <div 
                    onMouseEnter={() => setHoveredBorough('Westminster')}
                    onMouseLeave={() => setHoveredBorough(null)}
                    onClick={() => setBoroughFilter(boroughFilter === 'Westminster' ? '' : 'Westminster')}
                    className={`p-3 rounded-lg border text-center transition cursor-pointer flex flex-col justify-center col-span-2 ${
                      activeBorough === 'Westminster'
                        ? 'border-amber-500 bg-amber-500/15 text-white shadow-lg shadow-amber-500/10 scale-105'
                        : 'border-slate-900 bg-slate-900/40 text-slate-500 hover:border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    <span className="text-[10px] font-bold">Westminster</span>
                    <span className="text-[8px] font-medium opacity-60">West End / Central</span>
                  </div>

                  {/* Tower Hamlets */}
                  <div 
                    onMouseEnter={() => setHoveredBorough('Tower Hamlets')}
                    onMouseLeave={() => setHoveredBorough(null)}
                    onClick={() => setBoroughFilter(boroughFilter === 'Tower Hamlets' ? '' : 'Tower Hamlets')}
                    className={`p-3 rounded-lg border text-center transition cursor-pointer flex flex-col justify-center ${
                      activeBorough === 'Tower Hamlets'
                        ? 'border-amber-500 bg-amber-500/15 text-white shadow-lg shadow-amber-500/10 scale-105'
                        : 'border-slate-900 bg-slate-900/40 text-slate-500 hover:border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    <span className="text-[10px] font-bold">Tower Hamlets</span>
                    <span className="text-[8px] font-medium opacity-60">Canary Wharf</span>
                  </div>

                  {/* Kensington & Chelsea */}
                  <div 
                    onMouseEnter={() => setHoveredBorough('Kensington & Chelsea')}
                    onMouseLeave={() => setHoveredBorough(null)}
                    onClick={() => setBoroughFilter(boroughFilter === 'Kensington & Chelsea' ? '' : 'Kensington & Chelsea')}
                    className={`p-3 rounded-lg border text-center transition cursor-pointer flex flex-col justify-center ${
                      activeBorough === 'Kensington & Chelsea'
                        ? 'border-amber-500 bg-amber-500/15 text-white shadow-lg shadow-amber-500/10 scale-105'
                        : 'border-slate-900 bg-slate-900/40 text-slate-500 hover:border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    <span className="text-[9px] font-bold leading-tight">Kensington</span>
                    <span className="text-[8px] font-medium opacity-60">Exclusive SW</span>
                  </div>

                  {/* Southwark */}
                  <div 
                    onMouseEnter={() => setHoveredBorough('Southwark')}
                    onMouseLeave={() => setHoveredBorough(null)}
                    onClick={() => setBoroughFilter(boroughFilter === 'Southwark' ? '' : 'Southwark')}
                    className={`p-3 rounded-lg border text-center transition cursor-pointer flex flex-col justify-center ${
                      activeBorough === 'Southwark'
                        ? 'border-amber-500 bg-amber-500/15 text-white shadow-lg shadow-amber-500/10 scale-105'
                        : 'border-slate-900 bg-slate-900/40 text-slate-500 hover:border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    <span className="text-[10px] font-bold">Southwark</span>
                    <span className="text-[8px] font-medium opacity-60">South Bank</span>
                  </div>

                  {/* Greenwich */}
                  <div 
                    onMouseEnter={() => setHoveredBorough('Greenwich')}
                    onMouseLeave={() => setHoveredBorough(null)}
                    onClick={() => setBoroughFilter(boroughFilter === 'Greenwich' ? '' : 'Greenwich')}
                    className={`p-3 rounded-lg border text-center transition cursor-pointer flex flex-col justify-center ${
                      activeBorough === 'Greenwich'
                        ? 'border-amber-500 bg-amber-500/15 text-white shadow-lg shadow-amber-500/10 scale-105'
                        : 'border-slate-900 bg-slate-900/40 text-slate-500 hover:border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    <span className="text-[10px] font-bold">Greenwich</span>
                    <span className="text-[8px] font-medium opacity-60">SE Maritime</span>
                  </div>

                </div>
              </div>

              {/* Map Footer Information */}
              <div className="mt-4 text-xs text-slate-500 text-left flex items-start space-x-2 p-1 border-t border-slate-900 pt-4">
                <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Click on any district node in the grid above to immediately isolate listings to that specific borough, or hover on property cards to highlight their zone.
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
