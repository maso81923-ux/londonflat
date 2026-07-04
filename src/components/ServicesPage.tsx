import React, { useState, useMemo } from 'react';
import { Wrench, Scale, Truck, Shield, Globe, Phone, Mail, CheckCircle, Search, Sparkles, Zap, Droplet, Landmark, ShieldCheck, Camera, Heart, Palette, Leaf, Ruler, Key, Trash2, Building2, Paintbrush } from 'lucide-react';
import type { ServiceProvider, ServiceCategory } from '../db/schema';

interface ServicesPageProps {
  providers: ServiceProvider[];
  initialCategory?: ServiceCategory | null;
}

const CATEGORIES: { id: ServiceCategory; label: string; icon: any; description: string }[] = [
  { id: 'property-maintenance', label: 'Property Maintenance & Handyman Services', icon: Wrench, description: 'Expert repairs and general upkeep for your London property.' },
  { id: 'painters-decorators', label: 'Painters & Decorators', icon: Paintbrush, description: 'Professional painting and decorating for premium interiors and exteriors.' },
  { id: 'electricians', label: 'Electricians', icon: Zap, description: 'Certified electrical installations, rewiring, and smart home setups.' },
  { id: 'plumbing-heating', label: 'Plumbing & Heating', icon: Droplet, description: 'Trusted plumbing and central heating specialists across London.' },
  { id: 'legal-notaries', label: 'Legal & Notaries', icon: Scale, description: 'Solicitors, notaries, and legal experts for property and conveyancing.' },
  { id: 'banking-mortgages', label: 'Banking & Mortgages', icon: Landmark, description: 'Premier banking, mortgage advice, and wealth management services.' },
  { id: 'insurance-agencies', label: 'Insurance Agencies', icon: ShieldCheck, description: 'Property insurance, landlord cover, and comprehensive home policies.' },
  { id: 'physical-security', label: 'Physical Property Security', icon: Shield, description: 'Security personnel, access control, and physical property protection.' },
  { id: 'removals-transport', label: 'Removals & Transport', icon: Truck, description: 'Professional removals, fine art handling, and London-wide transport.' },
  { id: 'surveillance-cctv', label: 'Home Surveillance & CCTV', icon: Camera, description: 'CCTV installation, smart security cameras, and 24/7 monitoring.' },
  { id: 'child-elderly-care', label: 'Child & Elderly Care', icon: Heart, description: 'Compassionate childminding and elderly home care services.' },
  { id: 'cleaning-services', label: 'Cleaning Services', icon: Sparkles, description: 'Deep cleaning, eco-friendly cleaning, and regular home maintenance.' },
  { id: 'architecture-planning', label: 'Architecture & Planning', icon: Building2, description: 'Architectural design, planning permission, and building regulations.' },
  { id: 'interior-design', label: 'Interior Design', icon: Palette, description: 'Luxury interior design, space planning, and home styling.' },
  { id: 'landscape-gardening', label: 'Landscape Gardening', icon: Leaf, description: 'Garden design, landscaping, and outdoor space maintenance.' },
  { id: 'surveying-valuations', label: 'Surveying & Valuations', icon: Ruler, description: 'Property surveys, valuations, and building inspections.' },
  { id: 'locksmith-services', label: 'Locksmith Services', icon: Key, description: 'Emergency locksmiths, security locks, and key cutting.' },
  { id: 'waste-removal', label: 'Waste Removal', icon: Trash2, description: 'Domestic and commercial waste removal and clearance services.' }
];

export const ServicesPage: React.FC<ServicesPageProps> = ({ providers, initialCategory }) => {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(initialCategory || null);
  const [boroughFilter, setBoroughFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const boroughsList = Array.from(new Set(providers.map(p => p.borough))).sort();

  const filteredProviders = useMemo(() => {
    return providers.filter(p => {
      if (selectedCategory && p.category !== selectedCategory) return false;
      if (boroughFilter && p.borough !== boroughFilter) return false;
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [providers, selectedCategory, boroughFilter, searchQuery]);

  return (
    <div className="flex-grow bg-slate-950 text-white min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-slate-900 border-b border-slate-800 py-16 sm:py-24">
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
        </div>
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6">
            London Living <span className="text-amber-500">Services Hub</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-400">
            Connecting you with London's most trusted and verified service providers. 
            From tradesmen to legal experts, everything you need for your premium London home.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Category Selection Grid */}
        {!selectedCategory ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-16">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="flex flex-col items-center text-center p-8 rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-amber-500/50 transition duration-300 group"
              >
                <div className="mb-6 p-4 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-amber-500/30 group-hover:bg-amber-500/5 transition">
                  <cat.icon className="h-8 w-8 text-amber-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{cat.label}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {cat.description}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <div className="mb-8">
            <button 
              onClick={() => setSelectedCategory(null)}
              className="text-amber-500 hover:text-amber-400 text-sm font-bold flex items-center mb-6 transition"
            >
              ← Back to all categories
            </button>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-900">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  {React.createElement(CATEGORIES.find(c => c.id === selectedCategory)?.icon || Wrench, { className: "h-6 w-6 text-amber-500" })}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {CATEGORIES.find(c => c.id === selectedCategory)?.label}
                  </h2>
                  <p className="text-slate-400 text-sm">
                    {filteredProviders.length} verified providers found
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:border-amber-500 outline-none"
                  />
                </div>
                <select
                  value={boroughFilter}
                  onChange={(e) => setBoroughFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:border-amber-500 outline-none cursor-pointer min-w-[140px]"
                >
                  <option value="">All Boroughs</option>
                  {boroughsList.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Providers List */}
        {selectedCategory && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProviders.length > 0 ? (
              filteredProviders.map((provider) => (
                <div key={provider.id} className="rounded-2xl border border-slate-900 bg-slate-900/30 p-6 flex flex-col sm:flex-row gap-6 hover:border-amber-500/20 transition">
                  <div className="h-20 w-20 shrink-0 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center p-2">
                    {provider.logo_url ? (
                      <img src={provider.logo_url} alt={provider.name} className="max-h-full max-w-full rounded" />
                    ) : (
                      <div className="text-amber-500 font-black text-2xl">
                        {provider.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white">{provider.name}</h3>
                        {provider.is_verified && (
                          <CheckCircle className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-slate-950 rounded border border-slate-800 text-slate-400">
                        {provider.borough}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                      {provider.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {provider.subcategories.map(sub => (
                        <span key={sub} className="text-[9px] font-bold text-amber-400/80 bg-amber-500/5 px-2 py-0.5 rounded-full border border-amber-500/10">
                          {sub}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-900/50">
                      <div className="flex items-center text-xs text-slate-400">
                        <Phone className="h-3.5 w-3.5 mr-2 text-slate-500" />
                        {provider.phone}
                      </div>
                      <div className="flex items-center text-xs text-slate-400">
                        <Mail className="h-3.5 w-3.5 mr-2 text-slate-500" />
                        {provider.email}
                      </div>
                      {provider.website && (
                        <a href={provider.website} target="_blank" rel="noreferrer" className="flex items-center text-xs text-amber-500 hover:text-amber-400 transition sm:col-span-2">
                          <Globe className="h-3.5 w-3.5 mr-2" />
                          {provider.website.replace('https://', '')}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center rounded-2xl border border-dashed border-slate-800">
                <Search className="h-10 w-10 text-slate-700 mx-auto mb-4" />
                <h3 className="text-slate-400 font-bold">No providers found matching your criteria</h3>
                <p className="text-slate-600 text-sm mt-1">Try resetting your filters or search query.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
