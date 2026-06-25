import React, { useState, useEffect } from 'react';
import type { UserProfile, PropertyListing } from '../db/schema';
import { db } from '../db';
import { MapPin, Calendar, Check, ShieldCheck, Phone, CalendarRange, Clock, Sparkles, Send, ArrowLeft, Home } from 'lucide-react';

interface ListingDetailsPageProps {
  listingId: string;
  currentUser: UserProfile | null;
  onNavigate: (view: string) => void;
  onOpenAuth: () => void;
}

export const ListingDetailsPage: React.FC<ListingDetailsPageProps> = ({
  listingId,
  currentUser,
  onNavigate,
  onOpenAuth
}) => {
  const [listing, setListing] = useState<PropertyListing | undefined>(undefined);
  const [provider, setProvider] = useState<{ name: string; avatar?: string; agencyName?: string; phone?: string; type: 'agency' | 'landlord' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const listingData = await db.getListingById(listingId);
        setListing(listingData);
        if (listingData) {
          const providerData = await db.getProviderByListingId(listingData.provider_id);
          setProvider(providerData);
        }
      } catch (error) {
        console.error('Error fetching listing details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [listingId]);

  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Form states
  const [seekerName, setSeekerName] = useState('');
  const [seekerEmail, setSeekerEmail] = useState('');
  const [seekerPhone, setSeekerPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [messageText, setMessageText] = useState('');

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-fill form if logged in
  useEffect(() => {
    if (currentUser) {
      setSeekerName(currentUser.full_name);
      setSeekerEmail(currentUser.email);
      setSeekerPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  if (isLoading) {
    return (
      <div className="flex-grow bg-slate-950 text-white py-16 text-center">
        <p className="text-slate-400">Loading premium listing details...</p>
      </div>
    );
  }

  if (!listing || !provider) {
    return (
      <div className="flex-grow bg-slate-950 text-white py-16 text-center">
        <p className="text-slate-400 mb-4">Listing not found or has been removed.</p>
        <button 
          onClick={() => onNavigate('listings')}
          className="rounded-lg bg-amber-500 py-2.5 px-5 text-xs font-bold text-slate-950 hover:bg-amber-600 transition"
        >
          Return to Listings
        </button>
      </div>
    );
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seekerName || !seekerEmail || !seekerPhone || !preferredDate || !preferredTime) {
      setErrorMessage('Please fill in all requested fields to secure your request.');
      return;
    }

    if (!currentUser) {
      setErrorMessage('You must be registered or logged in to submit viewing requests.');
      onOpenAuth();
      return;
    }

    try {
      await db.createViewingRequest({
        listing_id: listing.id,
        seeker_id: currentUser.id,
        seeker_name: seekerName,
        seeker_email: seekerEmail,
        seeker_phone: seekerPhone,
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        message: messageText
      });
      setIsSubmitted(true);
      setErrorMessage('');
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="flex-grow bg-slate-950 text-white py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Navigation & Breadcrumb */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-900">
          <button
            onClick={() => onNavigate('listings')}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-500 hover:text-amber-400 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Listings</span>
          </button>
          <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">
            londonflat.uk estate network • ID: {listing.id}
          </span>
        </div>

        {/* Title Grid */}
        <div className="text-left mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400 border border-amber-500/10">
              {listing.type === 'room' ? 'Premium Shared Flat' : 'Entire Luxury Apartment'}
            </span>
            {listing.is_verified && (
              <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/10">
                <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                Verified Premium
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-tight">
            {listing.title}
          </h1>
          <div className="flex items-center text-slate-400 text-xs sm:text-sm">
            <MapPin className="h-4 w-4 text-amber-500 mr-1.5" />
            <span>{listing.address}, {listing.borough}, {listing.postcode}</span>
          </div>
        </div>

        {/* Main Content: Split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 7 COLS: Images, Specs, Description, Amenities */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Elegant Image Gallery */}
            <div className="space-y-3">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-slate-900 bg-slate-900">
                <img 
                  src={listing.images[activeImageIdx]} 
                  alt={listing.title} 
                  className="h-full w-full object-cover transition-all duration-300"
                />
              </div>
              {/* Thumbnails */}
              <div className="flex space-x-3 overflow-x-auto pb-1">
                {listing.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative aspect-[4/3] w-20 sm:w-24 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                      activeImageIdx === idx ? 'border-amber-500' : 'border-slate-900 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick specifications grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-xl border border-slate-900 bg-slate-900/20 p-5 text-center">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  {listing.listing_purpose === 'sale' ? 'Purchase Price' : 'Monthly Rent'}
                </span>
                <span className="text-lg font-black text-amber-400">
                  {listing.listing_purpose === 'sale' 
                    ? `£${(listing.price || 0).toLocaleString()}` 
                    : `£${(listing.price_per_month || 0).toLocaleString()}`}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Refundable Deposit</span>
                <span className="text-lg font-black text-white">£{listing.deposit.toLocaleString()}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Available From</span>
                <span className="text-xs font-bold text-white mt-1.5 block">
                  {new Date(listing.available_from).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Utilities Status</span>
                <span className="text-xs font-bold text-white mt-1.5 block">
                  {listing.is_bills_included ? 'All Bills Included' : 'Excluded'}
                </span>
              </div>
            </div>

            {/* Overview / Description */}
            <div className="text-left space-y-4">
              <h2 className="text-lg font-extrabold text-white flex items-center">
                <Home className="h-4 w-4 text-amber-500 mr-2" />
                Property Overview
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            {/* Roommate Profile (Custom addition for premium room feel) */}
            {listing.type === 'room' && (
              <div className="rounded-2xl border border-slate-900 bg-gradient-to-tr from-slate-900/40 to-slate-900/10 p-6 text-left space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-amber-500/5 blur-2xl" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center">
                  <Sparkles className="h-3.5 w-3.5 mr-1.5 animate-pulse" />
                  Roommate Profile & Household Vibe
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  This flat is home to clean, professional flatmates who maintain a peaceful house vibe. Perfect for consultants, developers, or research academics moving to London. Regular cleaning of shared spaces is organized. Cooking together, climbing, and exploring London's dynamic gallery landscape happens often!
                </p>
              </div>
            )}

            {/* Amenities Section */}
            <div className="text-left space-y-4">
              <h2 className="text-lg font-extrabold text-white">Amenities & Features</h2>
              <div className="flex flex-wrap gap-2.5">
                {listing.amenities.map((amenity, idx) => (
                  <span 
                    key={idx}
                    className="inline-flex items-center rounded-lg border border-slate-900 bg-slate-950 py-2 px-3.5 text-xs font-medium text-slate-300"
                  >
                    <Check className="h-3.5 w-3.5 text-amber-500 mr-2" />
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT 5 COLS: Booking Viewing Card & Provider Profile */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
            
            {/* Booking Card */}
            <div className="rounded-2xl border border-slate-900 bg-slate-900/45 p-6 backdrop-blur-md shadow-xl">
              
              {/* Provider Header details */}
              <div className="flex items-center space-x-4 border-b border-slate-800/80 pb-5 mb-5 text-left">
                {provider.avatar ? (
                  <img src={provider.avatar} alt="" className="h-11 w-11 rounded-full object-cover border border-slate-700" />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500 text-slate-950 font-bold">
                    {provider.name[0]}
                  </div>
                )}
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Listed By</span>
                  <span className="block text-sm font-extrabold text-white">
                    {provider.agencyName || provider.name}
                  </span>
                  <span className="block text-[10px] text-slate-400">
                    {provider.type === 'agency' ? 'Licensed Letting Agency' : 'Verified Private Landlord'}
                  </span>
                </div>
              </div>

              {/* Booking Viewing Request Form */}
              <div className="text-left">
                {isSubmitted ? (
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-5 text-center space-y-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mx-auto">
                      <ShieldCheck className="h-6 w-6 stroke-[2]" />
                    </div>
                    <h3 className="text-sm font-extrabold text-white">Viewing Request Submitted</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Excellent! Your viewing request has been registered in the LondonFlat network. You can track its status live from your <strong>Dashboard</strong>.
                    </p>
                    <button
                      onClick={() => onNavigate('dashboard')}
                      className="w-full rounded-xl bg-slate-950 py-3 text-xs font-bold text-slate-200 border border-slate-800 hover:border-slate-700 hover:text-white transition"
                    >
                      Go to Seeker Dashboard
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center mb-3">
                        <CalendarRange className="h-4 w-4 text-amber-500 mr-1.5" />
                        Schedule a Viewing
                      </h3>
                      <p className="text-[10px] text-slate-500 leading-relaxed mb-4">
                        Secure your personalized appointment slot directly with the provider.
                      </p>
                    </div>

                    {/* Preferred Date & Time Row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Preferred Date
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                          <input
                            type="date"
                            value={preferredDate}
                            onChange={(e) => setPreferredDate(e.target.value)}
                            className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 pl-8 pr-2.5 text-xs font-medium text-slate-300 outline-none focus:border-amber-500 cursor-pointer"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Preferred Time
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                          <select
                            value={preferredTime}
                            onChange={(e) => setPreferredTime(e.target.value)}
                            className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 pl-8 pr-2.5 text-xs font-medium text-slate-300 outline-none focus:border-amber-500 cursor-pointer appearance-none"
                            required
                          >
                            <option value="">Select Time</option>
                            <option value="09:00">09:00 AM</option>
                            <option value="11:00">11:00 AM</option>
                            <option value="14:00">02:00 PM</option>
                            <option value="16:00">04:00 PM</option>
                            <option value="18:00">06:00 PM</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Seeker Contact Details */}
                    <div className="space-y-2.5 border-t border-slate-800/50 pt-4">
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Your Full Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Alex Mercer"
                          value={seekerName}
                          onChange={(e) => setSeekerName(e.target.value)}
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs font-medium text-slate-300 outline-none focus:border-amber-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          placeholder="e.g. alex@gmail.com"
                          value={seekerEmail}
                          onChange={(e) => setSeekerEmail(e.target.value)}
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs font-medium text-slate-300 outline-none focus:border-amber-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          UK Contact Phone
                        </label>
                        <input
                          type="tel"
                          placeholder="e.g. +44 7700 900543"
                          value={seekerPhone}
                          onChange={(e) => setSeekerPhone(e.target.value)}
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs font-medium text-slate-300 outline-none focus:border-amber-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Introduce Yourself (Optional)
                        </label>
                        <textarea
                          placeholder="Introduce yourself, your profession, and why you are interested in this property..."
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          rows={3}
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs font-medium text-slate-300 placeholder:text-slate-700 outline-none focus:border-amber-500 resize-none"
                        />
                      </div>
                    </div>

                    {/* Booking error */}
                    {errorMessage && (
                      <p className="text-[10px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/10 p-2.5 rounded-lg text-center">
                        {errorMessage}
                      </p>
                    )}

                    {/* Submit booking */}
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 py-3.5 text-xs font-extrabold text-slate-950 shadow-md active:scale-95 transition"
                    >
                      <Send className="h-3.5 w-3.5 stroke-[2.5]" />
                      <span>Request viewing appointment</span>
                    </button>

                  </form>
                )}
              </div>

            </div>

            {/* Quick Contact Panel */}
            <div className="rounded-xl border border-slate-900 bg-slate-950 p-4 text-left space-y-2">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Immediate Inquiries</span>
              <div className="flex items-center space-x-2 text-xs text-slate-300">
                <Phone className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>UK Line: {provider.phone || '+44 20 7946 0999'}</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
