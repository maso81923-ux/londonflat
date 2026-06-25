import React, { useState, useMemo, useEffect } from 'react';
import type { UserProfile, PropertyListing, ViewingRequest, AgencyDetails } from '../db/schema';
import { db } from '../db';
import { LayoutDashboard, Plus, Trash2, Calendar, Clock, User, Phone, Mail, Globe, MapPin, CheckCircle, XCircle, ChevronRight, Sparkles, Building2, ShieldCheck, Check } from 'lucide-react';

interface DashboardPageProps {
  currentUser: UserProfile | null;
  onNavigate: (view: string, listingId?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ currentUser, onNavigate }) => {
  if (!currentUser) {
    return (
      <div className="flex-grow bg-slate-950 text-white py-20 text-center">
        <div className="max-w-md mx-auto p-8 rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-md">
          <User className="h-10 w-10 text-amber-500 mx-auto mb-4" />
          <h2 className="text-base font-extrabold mb-2">Access Dashboard</h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            Please register or log in to access your personal seeker dashboard or agency management panels.
          </p>
        </div>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<'overview' | 'post-listing'>('overview');

  // Load live db states
  const [listings, setListings] = useState<PropertyListing[]>([]);
  const [seekerRequests, setSeekerRequests] = useState<(ViewingRequest & { propertyTitle: string; propertyImage: string; borough: string; price: number })[]>([]);
  const [providerRequests, setProviderRequests] = useState<(ViewingRequest & { propertyTitle: string })[]>([]);
  const [agencyDetails, setAgencyDetails] = useState<AgencyDetails | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      try {
        const [listingsData, seekerReqsData, providerReqsData, agencyData] = await Promise.all([
          db.getListings(),
          db.getViewingRequestsForSeeker(currentUser.id),
          db.getViewingRequestsForProvider(currentUser.id),
          db.getAgencyByUserId(currentUser.id)
        ]);
        setListings(listingsData);
        setSeekerRequests(seekerReqsData);
        setProviderRequests(providerReqsData);
        setAgencyDetails(agencyData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchData();
  }, [currentUser, activeTab]); // Re-fetch on tab change or user change

  const providerListings = useMemo(() => {
    return listings.filter(l => l.provider_id === currentUser.id);
  }, [listings, currentUser.id]);

  // New Property Form State
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'room' | 'entire_flat'>('room');
  const [newPrice, setNewPrice] = useState('');
  const [newDeposit, setNewDeposit] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newBorough, setNewBorough] = useState('Westminster');
  const [newPostcode, setNewPostcode] = useState('');
  const [newBedrooms, setNewBedrooms] = useState('1');
  const [newBathrooms, setNewBathrooms] = useState('1');
  const [newAvailable, setNewAvailable] = useState('');
  const [newBills, setNewBills] = useState(true);
  const [newDescription, setNewDescription] = useState('');
  
  // Amenities multiselect
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(['Superfast Wifi']);
  const amenityPresets = [
    'Superfast Wifi', 'Private Ensuite', 'All Bills Included', 'Underfloor Heating', 
    'Weekly Cleaner', 'Balcony', 'Roof Terrace Access', 'Private Garden Patio', 'Gym', 'Parking'
  ];

  // Preset premium Image presets (Unsplash)
  const imagePresets = [
    { name: 'Cozy Master Room', url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80' },
    { name: 'Elegant Living Space', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80' },
    { name: 'Luxury Ensuite Bedroom', url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80' },
    { name: 'Sky High Apartment', url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80' }
  ];
  const [selectedImgUrl, setSelectedImgUrl] = useState(imagePresets[0].url);

  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  const handlePostListingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice || !newDeposit || !newAddress || !newPostcode || !newAvailable || !newDescription) {
      setFormError('Please fill in all requested fields.');
      return;
    }

    try {
      await db.createListing({
        provider_id: currentUser.id,
        title: newTitle,
        description: newDescription,
        listing_purpose: 'rent',
        property_status: 'available',
        price_per_month: Number(newPrice),
        deposit: Number(newDeposit),
        address: newAddress,
        borough: newBorough,
        postcode: newPostcode.toUpperCase(),
        type: newType,
        bedrooms: Number(newBedrooms),
        bathrooms: Number(newBathrooms),
        available_from: newAvailable,
        is_bills_included: newBills,
        amenities: selectedAmenities,
        images: [selectedImgUrl]
      });

      setFormSuccess(true);
      setFormError('');
      setTimeout(() => {
        setFormSuccess(false);
        setActiveTab('overview');
        // Reset form
        setNewTitle('');
        setNewPrice('');
        setNewDeposit('');
        setNewAddress('');
        setNewPostcode('');
        setNewDescription('');
      }, 1500);

    } catch (err: any) {
      setFormError(err.message || 'Error occurred while creating listing.');
    }
  };

  const handleDeleteListing = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to permanently remove this listing?')) {
      await db.deleteListing(id);
      // Update local state instead of reload
      setListings(listings.filter(l => l.id !== id));
    }
  };

  const handleUpdateStatus = async (reqId: string, status: 'confirmed' | 'cancelled') => {
    await db.updateViewingRequestStatus(reqId, status);
    // Update local state
    setProviderRequests(providerRequests.map(r => r.id === reqId ? { ...r, status } : r));
    setSeekerRequests(seekerRequests.map(r => r.id === reqId ? { ...r, status } : r));
  };

  const handleAmenityToggle = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  return (
    <div className="flex-grow bg-slate-950 text-white py-10 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Profile Card Header */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 text-left">
          <div className="flex items-center space-x-5">
            <img 
              src={currentUser.avatar_url} 
              alt={currentUser.full_name} 
              className="h-16 w-16 rounded-full border border-slate-800 object-cover shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl font-extrabold text-white">{currentUser.full_name}</h1>
                <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-400 capitalize border border-amber-500/10">
                  {currentUser.role === 'seeker' ? 'Flat Hunter' : currentUser.role}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center space-x-3">
                <span className="flex items-center"><Mail className="h-3 w-3 mr-1 text-amber-500" /> {currentUser.email}</span>
                {currentUser.phone && <span className="flex items-center"><Phone className="h-3 w-3 mr-1 text-amber-500" /> {currentUser.phone}</span>}
              </p>
            </div>
          </div>

          {/* Agency Details Header */}
          {agencyDetails && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs space-y-2 max-w-sm">
              <div className="flex items-center space-x-1.5 font-bold text-white">
                <Building2 className="h-4 w-4 text-amber-500" />
                <span>{agencyDetails.company_name}</span>
                {agencyDetails.is_verified && <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />}
              </div>
              <p className="text-slate-400 text-[11px] leading-tight flex items-start">
                <MapPin className="h-3 w-3 mr-1 text-amber-500 shrink-0 mt-0.5" />
                <span>{agencyDetails.office_address}</span>
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/80 pt-2">
                <span>License: {agencyDetails.license_number}</span>
                {agencyDetails.website && (
                  <a href={agencyDetails.website} target="_blank" rel="noreferrer" className="text-amber-500 hover:underline flex items-center">
                    <Globe className="h-3 w-3 mr-0.5" /> Website
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* TAB CONTROLS (Only for Agency/Landlord) */}
        {(currentUser.role === 'agency' || currentUser.role === 'landlord') && (
          <div className="flex border-b border-slate-900 mb-8 space-x-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-4 text-xs font-bold uppercase tracking-wider transition ${
                activeTab === 'overview' ? 'border-b-2 border-amber-500 text-amber-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Management Overview
            </button>
            <button
              onClick={() => setActiveTab('post-listing')}
              className={`pb-4 text-xs font-bold uppercase tracking-wider transition flex items-center space-x-1.5 ${
                activeTab === 'post-listing' ? 'border-b-2 border-amber-500 text-amber-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Plus className="h-4 w-4" />
              <span>Post New Property</span>
            </button>
          </div>
        )}

        {/* CONTENT SWITCHER */}
        {currentUser.role === 'seeker' ? (
          
          /* ==================================== */
          /* FLAT HUNTER (SEEKER) DASHBOARD VIEW */
          /* ==================================== */
          <div className="text-left space-y-6">
            <div className="flex items-center space-x-2">
              <LayoutDashboard className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-extrabold text-white">Your Viewing Requests</h2>
            </div>

            {seekerRequests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {seekerRequests.map((req) => (
                  <div 
                    key={req.id}
                    className="rounded-2xl border border-slate-900 bg-slate-900/20 p-5 flex flex-col justify-between"
                  >
                    <div>
                      {/* Property Thumbnail & Title Row */}
                      <div className="flex items-start space-x-4 mb-4">
                        <img 
                          src={req.propertyImage} 
                          alt="" 
                          className="h-14 w-14 rounded-lg object-cover border border-slate-800 shrink-0"
                        />
                        <div>
                          <span className="text-[10px] text-slate-500 font-semibold uppercase">{req.borough}</span>
                          <h3 
                            onClick={() => onNavigate('details', req.listing_id)}
                            className="text-xs font-bold text-white hover:text-amber-400 transition cursor-pointer line-clamp-1"
                          >
                            {req.propertyTitle}
                          </h3>
                          <span className="block text-[11px] font-bold text-amber-500 mt-0.5">
                            £{req.price.toLocaleString()} / mo
                          </span>
                        </div>
                      </div>

                      {/* Schedule Details Row */}
                      <div className="grid grid-cols-2 gap-2 text-xs border-y border-slate-900 py-3 mb-4 text-slate-400">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="h-4 w-4 text-amber-500" />
                          <span>{new Date(req.preferred_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <Clock className="h-4 w-4 text-amber-500" />
                          <span>{req.preferred_time} PM</span>
                        </div>
                      </div>

                      {req.message && (
                        <div className="bg-slate-950 p-2.5 rounded-lg text-[10px] text-slate-500 italic mb-4 leading-relaxed">
                          "{req.message}"
                        </div>
                      )}
                    </div>

                    {/* Status & Action */}
                    <div className="flex items-center justify-between border-t border-slate-900/50 pt-3">
                      <span className="text-[10px] text-slate-500">Submitted {new Date(req.created_at).toLocaleDateString('en-GB')}</span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                        req.status === 'confirmed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                          : req.status === 'cancelled'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/10'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/10'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center">
                <Calendar className="h-8 w-8 text-slate-600 mx-auto mb-4" />
                <h3 className="text-sm font-bold text-slate-300 mb-1">No viewing requests yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                  Find premium homes in London and schedule a direct viewing slot inside their detail pages.
                </p>
                <button
                  onClick={() => onNavigate('listings')}
                  className="rounded-lg bg-amber-500 py-2 px-4 text-xs font-bold text-slate-950 hover:bg-amber-600 transition"
                >
                  Explore Premium Listings
                </button>
              </div>
            )}
          </div>

        ) : (
          
          /* ======================================= */
          /* AGENCY & LANDLORD MANAGEMENT DASHBOARD  */
          /* ======================================= */
          <div>
            {activeTab === 'overview' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left items-start">
                
                {/* LEFT COLUMN: Manage active properties listed */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-900">
                    <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
                      Your Listings ({providerListings.length})
                    </h2>
                  </div>

                  {providerListings.length > 0 ? (
                    <div className="space-y-4">
                      {providerListings.map((item) => (
                        <div 
                          key={item.id}
                          className="rounded-xl border border-slate-900 bg-slate-900/10 p-4 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center space-x-4">
                            <img src={item.images[0]} alt="" className="h-12 w-12 rounded-lg object-cover shrink-0" />
                            <div>
                              <h3 className="text-xs font-bold text-white line-clamp-1">{item.title}</h3>
                              <div className="flex items-center space-x-2 mt-0.5">
                                <span className="text-[10px] text-slate-500">
                                  {item.borough} • {item.listing_purpose === 'sale' ? `£${(item.price || 0).toLocaleString()}` : `£${(item.price_per_month || 0).toLocaleString()} / mo`}
                                </span>
                                {item.is_verified ? (
                                  <span className="flex items-center text-[8px] font-bold text-emerald-400 bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10">
                                    VERIFIED
                                  </span>
                                ) : (
                                  <button 
                                    onClick={async () => {
                                      if (confirm('Apply for Verified Premium status for £25?')) {
                                        await db.verifyListing(item.id);
                                        // Update local state
                                        setListings(listings.map(l => l.id === item.id ? { ...l, is_verified: true } : l));
                                      }
                                    }}
                                    className="text-[8px] font-bold text-amber-500 bg-amber-500/5 px-1.5 py-0.5 rounded border border-amber-500/10 hover:bg-amber-500 hover:text-slate-950 transition"
                                  >
                                    GET VERIFIED
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => onNavigate('details', item.id)}
                              className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-900 rounded-lg transition"
                              title="View"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteListing(item.id, e)}
                              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition"
                              title="Delete Listing"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-xs text-slate-500">
                      You have not published any properties on this portal yet.
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN: Viewing requests inbox */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="pb-3 border-b border-slate-900">
                    <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
                      Requests Inbox ({providerRequests.length})
                    </h2>
                  </div>

                  {providerRequests.length > 0 ? (
                    <div className="space-y-4">
                      {providerRequests.map((req) => (
                        <div 
                          key={req.id}
                          className="rounded-2xl border border-slate-900 bg-slate-900/35 p-5 relative overflow-hidden"
                        >
                          {/* Inner details */}
                          <div className="mb-4">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-1">
                              {req.propertyTitle}
                            </span>
                            
                            <h3 className="text-xs font-extrabold text-white flex items-center space-x-1.5 mb-1">
                              <User className="h-3.5 w-3.5 text-slate-400" />
                              <span>{req.seeker_name}</span>
                            </h3>

                            <p className="text-[10px] text-slate-400 flex flex-wrap items-center gap-x-3 mb-3">
                              <span className="flex items-center"><Mail className="h-3 w-3 mr-1" /> {req.seeker_email}</span>
                              <span className="flex items-center"><Phone className="h-3 w-3 mr-1" /> {req.seeker_phone}</span>
                            </p>

                            {/* Date Time slot */}
                            <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-950 p-2.5 text-[11px] text-slate-300">
                              <span className="flex items-center"><Calendar className="h-3.5 w-3.5 text-amber-500 mr-1.5" /> {req.preferred_date}</span>
                              <span className="flex items-center"><Clock className="h-3.5 w-3.5 text-amber-500 mr-1.5" /> {req.preferred_time} PM</span>
                            </div>

                            {req.message && (
                              <p className="text-[10px] italic text-slate-500 bg-slate-950 p-2 rounded-lg mt-2 leading-relaxed">
                                "{req.message}"
                              </p>
                            )}
                          </div>

                          {/* Action panel */}
                          <div className="flex items-center justify-between border-t border-slate-900/60 pt-3">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                              req.status === 'confirmed'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                                : req.status === 'cancelled'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/10'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/10'
                            }`}>
                              {req.status}
                            </span>

                            {req.status === 'pending' && (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleUpdateStatus(req.id, 'cancelled')}
                                  className="inline-flex items-center space-x-1 rounded-md border border-slate-800 hover:border-slate-700 bg-slate-950 px-2.5 py-1 text-[10px] font-bold text-rose-400 transition"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                  <span>Decline</span>
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(req.id, 'confirmed')}
                                  className="inline-flex items-center space-x-1 rounded-md bg-amber-500 py-1 px-2.5 text-[10px] font-extrabold text-slate-950 hover:bg-amber-600 transition"
                                >
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  <span>Confirm</span>
                                </button>
                              </div>
                            )}
                          </div>

                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-xs text-slate-500">
                      No viewing requests have been sent for your listings yet.
                    </div>
                  )}

                </div>

              </div>
            ) : (
              
              /* ================================== */
              /* POST NEW PROPERTY LISTING FORM TAB */
              /* ================================== */
              <div className="max-w-2xl mx-auto rounded-2xl border border-slate-900 bg-slate-900/25 p-6 md:p-8 backdrop-blur-md text-left">
                <div className="mb-6 border-b border-slate-900 pb-4">
                  <h2 className="text-base font-extrabold text-white flex items-center space-x-2">
                    <Sparkles className="h-4.5 w-4.5 text-amber-500" />
                    <span>Create Premium Listing</span>
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    List a high-end property on the <strong>londonflat.uk</strong> estate portal. Vetted and auto-verified instantly.
                  </p>
                </div>

                {formSuccess ? (
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-8 text-center space-y-4">
                    <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto" />
                    <h3 className="text-sm font-extrabold text-white">Property Published Live</h3>
                    <p className="text-xs text-slate-400">
                      Congratulations! Your premium listing is now live and fully discoverable inside the main search page.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handlePostListingSubmit} className="space-y-4">
                    
                    {/* Title */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Listing Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Elegant Ensuite Master Bed in Westminster Duplex"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3 text-xs font-medium text-slate-300 outline-none focus:border-amber-500"
                        required
                      />
                    </div>

                    {/* Split: Type, Price, Deposit */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Listing Type
                        </label>
                        <select
                          value={newType}
                          onChange={(e) => setNewType(e.target.value as 'room' | 'entire_flat')}
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3 text-xs font-medium text-slate-300 outline-none focus:border-amber-500 cursor-pointer"
                        >
                          <option value="room">Room (Flatshare)</option>
                          <option value="entire_flat">Entire Apartment</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Rent Per Month (£)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 1500"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3 text-xs font-medium text-slate-300 outline-none focus:border-amber-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Deposit Required (£)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 1500"
                          value={newDeposit}
                          onChange={(e) => setNewDeposit(e.target.value)}
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3 text-xs font-medium text-slate-300 outline-none focus:border-amber-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Split: Address, Postcode, Borough */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          London Borough
                        </label>
                        <select
                          value={newBorough}
                          onChange={(e) => setNewBorough(e.target.value)}
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3 text-xs font-medium text-slate-300 outline-none focus:border-amber-500 cursor-pointer"
                        >
                          <option value="Westminster">Westminster</option>
                          <option value="Kensington & Chelsea">Kensington & Chelsea</option>
                          <option value="Camden">Camden</option>
                          <option value="Hackney">Hackney</option>
                          <option value="Tower Hamlets">Tower Hamlets</option>
                          <option value="Greenwich">Greenwich</option>
                        </select>
                      </div>

                      <div className="sm:col-span-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Address & Street
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 42 Great Portland St"
                          value={newAddress}
                          onChange={(e) => setNewAddress(e.target.value)}
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3 text-xs font-medium text-slate-300 outline-none focus:border-amber-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Postcode
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. W1W 7LT"
                          value={newPostcode}
                          onChange={(e) => setNewPostcode(e.target.value)}
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3 text-xs font-medium text-slate-300 outline-none focus:border-amber-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Beds, Baths, Available Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Total Bedrooms
                        </label>
                        <select
                          value={newBedrooms}
                          onChange={(e) => setNewBedrooms(e.target.value)}
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3 text-xs font-medium text-slate-300 outline-none focus:border-amber-500 cursor-pointer"
                        >
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4+</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Total Bathrooms
                        </label>
                        <select
                          value={newBathrooms}
                          onChange={(e) => setNewBathrooms(e.target.value)}
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3 text-xs font-medium text-slate-300 outline-none focus:border-amber-500 cursor-pointer"
                        >
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Available From
                        </label>
                        <input
                          type="date"
                          value={newAvailable}
                          onChange={(e) => setNewAvailable(e.target.value)}
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3 text-xs font-medium text-slate-300 outline-none focus:border-amber-500 cursor-pointer"
                          required
                        />
                      </div>
                    </div>

                    {/* Image Preset Picker */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Select Room Preset Photograph
                      </label>
                      <div className="grid grid-cols-4 gap-3">
                        {imagePresets.map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedImgUrl(p.url)}
                            className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition ${
                              selectedImgUrl === p.url ? 'border-amber-500 shadow-lg shadow-amber-500/10 scale-105' : 'border-slate-900 opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={p.url} alt={p.name} className="h-full w-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Amenities Checklist */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Features & Amenities Included
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {amenityPresets.map((amenity, idx) => {
                          const hasAmenity = selectedAmenities.includes(amenity);
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleAmenityToggle(amenity)}
                              className={`flex items-center space-x-2 border p-2.5 rounded-lg transition text-left ${
                                hasAmenity
                                  ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-white'
                              }`}
                            >
                              <div className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${
                                hasAmenity ? 'border-amber-500 bg-amber-500 text-slate-950' : 'border-slate-800 bg-slate-950'
                              }`}>
                                {hasAmenity && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                              </div>
                              <span className="text-[10px] font-semibold">{amenity}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bills included checkbox */}
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setNewBills(!newBills)}
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                          newBills ? 'border-amber-500 bg-amber-500 text-slate-950' : 'border-slate-800 bg-slate-950'
                        }`}
                      >
                        {newBills && <Check className="h-3 w-3 stroke-[3]" />}
                      </button>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 cursor-pointer select-none" onClick={() => setNewBills(!newBills)}>
                        All Utilities / Bills Included in Rent Price
                      </span>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Property Description
                      </label>
                      <textarea
                        placeholder="Detail the layout, shared amenities, public transport links, and household profile..."
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        rows={5}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3 text-xs font-medium text-slate-300 outline-none focus:border-amber-500"
                        required
                      />
                    </div>

                    {formError && (
                      <p className="text-[10px] text-rose-400 font-semibold text-center bg-rose-500/10 border border-rose-500/10 p-2.5 rounded-lg">
                        {formError}
                      </p>
                    )}

                    {/* Submit Listing */}
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 py-4 text-xs font-extrabold text-slate-950 shadow-md active:scale-95 transition"
                    >
                      <Plus className="h-4.5 w-4.5 stroke-[2.5]" />
                      <span>Publish Premium Property</span>
                    </button>

                  </form>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
