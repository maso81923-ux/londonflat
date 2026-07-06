import { useState, useEffect } from 'react';
import { db } from '../db';
import type { UserProfile, AgencyDetails, ServiceProvider, PropertyListing } from '../db/schema';
import { Building2, Home, RefreshCw, CheckCircle, XCircle, ShieldOff, Search, Wrench, ExternalLink } from 'lucide-react';
import type React from 'react';

// Simple inline icon for pound
function PoundIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 7c0-5.333-8-5.333-8 0 0 5.333 8 5.333 8 0z" />
      <path d="M18 7v14" />
      <path d="M6 21h12" />
      <path d="M6 13l10 0" />
    </svg>
  );
}

type AgencyRow = AgencyDetails & { feed_url?: string; sync_status?: string };

export function AdminPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [agencies, setAgencies] = useState<AgencyRow[]>([]);
  const [listings, setListings] = useState<PropertyListing[]>([]);
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [feedUrls, setFeedUrls] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState<Record<string, boolean>>({});
  const [blocking, setBlocking] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allUsers, allAgencies, allListings, allProviders] = await Promise.all([
        db.getAllUsers(),
        db.getAllAgencies(),
        db.getListings(),
        db.getServiceProviders()
      ]);
      setUsers(allUsers);
      setAgencies(allAgencies);
      setListings(allListings);
      setServiceProviders(allProviders);

      // Init feed URLs from agencies
      const urls: Record<string, string> = {};
      allAgencies.forEach(a => { if (a.feed_url) urls[a.id] = a.feed_url; });
      setFeedUrls(urls);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // --- Metrics ---
  const totalAgencies = users.filter(u => u.role === 'agency').length;
  const totalServiceProviders = serviceProviders.length;
  const activeListings = listings.filter(l => l.property_status === 'available').length;
  const estimatedRevenue = totalAgencies * 149; // £149/mo base subscription estimate

  // --- User Management ---
  const filteredUsers = users.filter(u => {
    const q = userSearch.toLowerCase();
    return u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const handleBlockUser = async (userId: string, userName: string) => {
    if (!confirm(`Block "${userName}"? This will suspend their account and delete ALL their listings immediately.`)) return;
    setBlocking(userId);
    try {
      await db.blockUser(userId);
      setMessage({ type: 'success', text: `User "${userName}" blocked, all listings purged.` });
      await loadData();
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to block user.' });
    }
    setBlocking(null);
  };

  // --- Feed Management ---
  const handleSaveFeedUrl = async (agencyId: string) => {
    const url = feedUrls[agencyId] || '';
    // Basic validation
    if (url && !url.startsWith('http')) {
      setMessage({ type: 'error', text: 'Feed URL must start with http:// or https://' });
      return;
    }
    try {
      await db.updateAgencyFeedUrl(agencyId, url);
      setMessage({ type: 'success', text: 'Feed URL saved.' });
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to save feed URL.' });
    }
  };

  const handleImportNow = async (agencyId: string, agencyName: string) => {
    setImporting(prev => ({ ...prev, [agencyId]: true }));
    try {
      const result = await db.importAgencyListings(agencyId);
      setMessage({ type: 'success', text: `Imported ${result.imported} listings from ${agencyName}.` });
      // Refresh listings
      const refreshed = await db.getListings();
      setListings(refreshed);
    } catch (e) {
      setMessage({ type: 'error', text: `Import failed for ${agencyName}.` });
    }
    setImporting(prev => ({ ...prev, [agencyId]: false }));
  };

  // Toast auto-dismiss
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(t);
    }
  }, [message]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Toast notification */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-xl text-sm font-medium animate-fade-in ${
          message.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {message.text}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Admin Panel</h1>
          <p className="text-slate-400 text-sm mt-1">Single-operator dashboard — manage agencies, feeds, and users.</p>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* === METRICS CARDS === */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          <MetricCard
            icon={<Building2 className="w-6 h-6" />}
            label="Total Agencies"
            value={totalAgencies}
            color="blue"
          />
          <MetricCard
            icon={<Wrench className="w-6 h-6" />}
            label="Service Providers"
            value={totalServiceProviders}
            color="amber"
          />
          <MetricCard
            icon={<Home className="w-6 h-6" />}
            label="Active Listings"
            value={activeListings}
            color="emerald"
          />
          <MetricCard
            icon={<PoundIcon />}
            label="Est. Monthly Rev."
            value={`£${estimatedRevenue.toLocaleString()}`}
            color="purple"
          />
        </div>
      </section>

      {/* === XML / API FEED MANAGEMENT === */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <ExternalLink className="w-5 h-5 text-amber-400" />
          XML / API Feed Management
        </h2>
        {agencies.length === 0 ? (
          <p className="text-slate-500 text-sm">No agencies registered yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-left">
                  <th className="pb-3 pr-3 font-medium">Agency</th>
                  <th className="pb-3 pr-3 font-medium">Feed URL</th>
                  <th className="pb-3 pr-3 font-medium text-center">Status</th>
                  <th className="pb-3 font-medium text-center">Import</th>
                </tr>
              </thead>
              <tbody>
                {agencies.map(a => (
                  <tr key={a.id} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                    <td className="py-3 pr-3">
                      <div className="font-medium text-white">{a.company_name}</div>
                      <div className="text-xs text-slate-500">{a.license_number}</div>
                    </td>
                    <td className="py-3 pr-3">
                      <div className="flex gap-2 items-center">
                        <input
                          type="url"
                          placeholder="https://..."
                          value={feedUrls[a.id] || ''}
                          onChange={e => setFeedUrls(prev => ({ ...prev, [a.id]: e.target.value }))}
                          className="w-full min-w-[180px] px-3 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                        <button
                          onClick={() => handleSaveFeedUrl(a.id)}
                          className="px-2.5 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-xs text-white transition-colors whitespace-nowrap"
                        >
                          Save
                        </button>
                      </div>
                    </td>
                    <td className="py-3 pr-3 text-center">
                      {a.sync_status === 'active' ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => handleImportNow(a.id, a.company_name)}
                        disabled={importing[a.id] || !feedUrls[a.id]}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs font-medium transition-colors"
                      >
                        {importing[a.id] ? (
                          <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <RefreshCw className="w-3.5 h-3.5" />
                        )}
                        {importing[a.id] ? 'Importing...' : 'Import Now'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* === USER & ACCESS CONTROL === */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <ShieldOff className="w-5 h-5 text-amber-400" />
          User & Access Control
        </h2>

        {/* Search */}
        <div className="relative mb-4 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={userSearch}
            onChange={e => setUserSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {filteredUsers.length === 0 ? (
          <p className="text-slate-500 text-sm">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-left">
                  <th className="pb-3 pr-3 font-medium">Name</th>
                  <th className="pb-3 pr-3 font-medium">Email</th>
                  <th className="pb-3 pr-3 font-medium">Role</th>
                  <th className="pb-3 pr-3 font-medium">Registered</th>
                  <th className="pb-3 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-400">
                            {u.full_name.charAt(0)}
                          </div>
                        )}
                        <span className="text-white font-medium">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-3 text-slate-300">{u.email}</td>
                    <td className="py-3 pr-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                        u.role === 'admin' ? 'bg-purple-900/60 text-purple-300' :
                        u.role === 'agency' ? 'bg-blue-900/60 text-blue-300' :
                        u.role === 'service-provider' ? 'bg-amber-900/60 text-amber-300' :
                        u.role === 'landlord' ? 'bg-emerald-900/60 text-emerald-300' :
                        'bg-slate-700 text-slate-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 text-center">
                      {u.role === 'admin' ? (
                        <span className="text-xs text-slate-600 italic">Protected</span>
                      ) : (
                        <button
                          onClick={() => handleBlockUser(u.id, u.full_name)}
                          disabled={blocking === u.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-700/60 hover:bg-red-600 disabled:bg-slate-700 text-white text-xs font-medium transition-colors"
                        >
                          {blocking === u.id ? (
                            <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                          ) : (
                            <ShieldOff className="w-3.5 h-3.5" />
                          )}
                          {blocking === u.id ? 'Blocking...' : 'Block / Deactivate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

// --- Metric Card Component ---
function MetricCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'from-blue-600/20 to-blue-600/5 border-blue-800/50 text-blue-400',
    amber: 'from-amber-600/20 to-amber-600/5 border-amber-800/50 text-amber-400',
    emerald: 'from-emerald-600/20 to-emerald-600/5 border-emerald-800/50 text-emerald-400',
    purple: 'from-purple-600/20 to-purple-600/5 border-purple-800/50 text-purple-400',
  };
  const badgeColor = colorMap[color] || colorMap.blue;

  return (
    <div className={`bg-gradient-to-br ${badgeColor} border rounded-xl p-4 flex flex-col gap-2`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider opacity-70">{label}</span>
        {icon}
      </div>
      <span className="text-2xl sm:text-3xl font-bold">{value}</span>
    </div>
  );
}