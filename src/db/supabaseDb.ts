import { supabase } from './supabaseClient';
import type { Database } from './DatabaseInterface';
import { 
  type PropertyListing, 
  type UserProfile, 
  type ViewingRequest, 
  type AgencyDetails, 
  type RequestStatus, 
  type ServiceProvider, 
  type ServiceCategory,
  type UserRole 
} from './schema';
import { parseFeedUrl, parseAndValidateFeed, transformProperty } from './feedParser';

export class SupabaseDatabase implements Database {
  // --- Auth APIs ---
  async getCurrentUser(): Promise<UserProfile | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    return profile;
  }

  async login(email: string): Promise<UserProfile | null> {
    // In a real app, we'd need a password. For this demo, we might use magic links or a dummy password.
    // The lead mentioned "Enable email/password auth in Supabase".
    // I'll assume standard login for now.
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: 'Password123!', // Demo password
    });

    if (error || !data.user) return null;

    return this.getCurrentUser();
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  }

  async registerUser(fullName: string, email: string, role: UserRole, phone?: string): Promise<UserProfile> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: 'Password123!',
      options: {
        data: {
          full_name: fullName,
          role: role,
        }
      }
    });

    if (error || !data.user) throw new Error(error?.message || 'Registration failed');

    const newUser: UserProfile = {
      id: data.user.id,
      email,
      full_name: fullName,
      role,
      phone,
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
      created_at: new Date().toISOString()
    };

    const { error: insertError } = await supabase
      .from('user_profiles')
      .insert([newUser]);

    if (insertError) throw new Error(insertError.message);

    return newUser;
  }

  async registerAgency(userId: string, companyName: string, licenseNumber: string, phone: string, officeAddress: string, website?: string): Promise<AgencyDetails> {
    const newAgency: AgencyDetails = {
      id: crypto.randomUUID(),
      user_id: userId,
      company_name: companyName,
      logo_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(companyName)}`,
      license_number: licenseNumber,
      phone,
      office_address: officeAddress,
      website,
      created_at: new Date().toISOString(),
      is_verified: true
    };

    const { error } = await supabase
      .from('agency_details')
      .insert([newAgency]);

    if (error) throw new Error(error.message);

    return newAgency;
  }

  async getAgencyByUserId(userId: string): Promise<AgencyDetails | undefined> {
    const { data, error } = await supabase
      .from('agency_details')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) return undefined;
    return data;
  }

  // --- Property Listing APIs ---
  async getListings(): Promise<PropertyListing[]> {
    const { data, error } = await supabase
      .from('property_listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async getListingById(id: string): Promise<PropertyListing | undefined> {
    const { data, error } = await supabase
      .from('property_listings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return undefined;
    return data;
  }

  async getProviderByListingId(providerId: string): Promise<{ name: string; avatar?: string; agencyName?: string; phone?: string; type: 'agency' | 'landlord' }> {
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', providerId)
      .single();

    if (userError || !user) {
      return { name: 'Unknown Landlord', type: 'landlord' };
    }

    if (user.role === 'agency') {
      const { data: agency } = await supabase
        .from('agency_details')
        .select('*')
        .eq('user_id', providerId)
        .single();

      return {
        name: user.full_name,
        avatar: user.avatar_url,
        agencyName: agency?.company_name || 'Premium Agency Partner',
        phone: agency?.phone || user.phone,
        type: 'agency'
      };
    }

    return {
      name: user.full_name,
      avatar: user.avatar_url,
      phone: user.phone,
      type: 'landlord'
    };
  }

  async createListing(listingData: Omit<PropertyListing, 'id' | 'is_verified' | 'created_at'>): Promise<PropertyListing> {
    const newListing: PropertyListing = {
      ...listingData,
      id: crypto.randomUUID(),
      is_verified: false,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('property_listings')
      .insert([newListing]);

    if (error) throw new Error(error.message);

    return newListing;
  }

  async verifyListing(id: string): Promise<void> {
    const { error } = await supabase
      .from('property_listings')
      .update({ is_verified: true })
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  async deleteListing(id: string): Promise<void> {
    const { error } = await supabase
      .from('property_listings')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  // --- Service Provider APIs ---
  async getServiceProviders(): Promise<ServiceProvider[]> {
    const { data, error } = await supabase
      .from('service_providers')
      .select('*');

    if (error) throw new Error(error.message);
    return data || [];
  }

  async getServiceProvidersByCategory(category: ServiceCategory): Promise<ServiceProvider[]> {
    const { data, error } = await supabase
      .from('service_providers')
      .select('*')
      .eq('category', category);

    if (error) throw new Error(error.message);
    return data || [];
  }

  async getServiceProvidersByBorough(borough: string): Promise<ServiceProvider[]> {
    const { data, error } = await supabase
      .from('service_providers')
      .select('*')
      .ilike('borough', borough);

    if (error) throw new Error(error.message);
    return data || [];
  }

  // --- Viewing Request APIs ---
  async getViewingRequests(): Promise<ViewingRequest[]> {
    const { data, error } = await supabase
      .from('viewing_requests')
      .select('*');

    if (error) throw new Error(error.message);
    return data || [];
  }

  async createViewingRequest(requestData: Omit<ViewingRequest, 'id' | 'status' | 'created_at'>): Promise<ViewingRequest> {
    const newRequest: ViewingRequest = {
      ...requestData,
      id: crypto.randomUUID(),
      status: 'pending',
      created_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('viewing_requests')
      .insert([newRequest]);

    if (error) throw new Error(error.message);

    return newRequest;
  }

  async updateViewingRequestStatus(id: string, status: RequestStatus): Promise<void> {
    const { error } = await supabase
      .from('viewing_requests')
      .update({ status })
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  async getViewingRequestsForProvider(providerId: string): Promise<(ViewingRequest & { propertyTitle: string })[]> {
    const { data, error } = await supabase
      .from('viewing_requests')
      .select('*, property_listings!inner(title, provider_id)')
      .eq('property_listings.provider_id', providerId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return (data || []).map(r => ({
      ...r,
      propertyTitle: (r.property_listings as any).title
    }));
  }

  async getViewingRequestsForSeeker(seekerId: string): Promise<(ViewingRequest & { propertyTitle: string; propertyImage: string; borough: string; price: number })[]> {
    const { data, error } = await supabase
      .from('viewing_requests')
      .select('*, property_listings!inner(title, images, borough, listing_purpose, price, price_per_month)')
      .eq('seeker_id', seekerId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return (data || []).map(r => {
      const listing = r.property_listings as any;
      return {
        ...r,
        propertyTitle: listing.title,
        propertyImage: listing.images?.[0] || '',
        borough: listing.borough,
        price: listing.listing_purpose === 'sale' ? (listing.price || 0) : (listing.price_per_month || 0)
      };
    });
  }
  // --- Admin Panel Methods ---
  async getAllUsers(): Promise<UserProfile[]> {
    const { data, error } = await supabase.from('user_profiles').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  }

  async getAllAgencies(): Promise<(AgencyDetails & { feed_url?: string; sync_status?: string })[]> {
    const { data, error } = await supabase.from('agency_details').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    const { data: feeds } = await supabase.from('agency_feeds').select('agency_name, feed_url');
    const feedByName: Record<string, string> = {};
    (feeds || []).forEach((f: any) => { if (f.agency_name) feedByName[f.agency_name] = f.feed_url; });
    return (data || []).map(a => ({ ...a, feed_url: feedByName[a.company_name] || '', sync_status: 'inactive' }));
  }

  async blockUser(userId: string): Promise<void> {
    await supabase.from('user_profiles').delete().eq('id', userId);
    await supabase.from('property_listings').delete().eq('provider_id', userId);
  }

  async deleteUserListings(userId: string): Promise<void> {
    await supabase.from('property_listings').delete().eq('provider_id', userId);
  }

  async updateAgencyFeedUrl(agencyId: string, feedUrl: string): Promise<void> {
    const { data: agency } = await supabase.from('agency_details').select('company_name').eq('id', agencyId).single();
    if (!agency) throw new Error('Agency not found');

    const { data: existing } = await supabase.from('agency_feeds').select('id').eq('agency_name', agency.company_name).maybeSingle();
    if (existing) {
      const { error } = await supabase.from('agency_feeds').update({ feed_url: feedUrl }).eq('id', existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from('agency_feeds').insert([{ agency_name: agency.company_name, feed_url: feedUrl }]);
      if (error) throw new Error(error.message);
    }
  }

  async importAgencyListings(agencyId: string): Promise<{ imported: number; failed: number }> {
    // Look up the agency to get the user_id and company name
    const { data: agency } = await supabase.from('agency_details').select('user_id, company_name').eq('id', agencyId).single();
    if (!agency) return { imported: 0, failed: 0 };

    // Resolve the persisted feed URL from agency_feeds (keyed by agency_name)
    const { data: feed } = await supabase.from('agency_feeds').select('feed_url').eq('agency_name', agency.company_name).maybeSingle();
    const feedUrl = feed?.feed_url;
    if (!feedUrl) return { imported: 0, failed: 0 };

    const { cleanUrl, apiKey } = parseFeedUrl(feedUrl);
    if (!apiKey) {
      console.error('Feed URL missing api_key parameter');
      return { imported: 0, failed: 0 };
    }

    const { properties, result } = await parseAndValidateFeed(cleanUrl, apiKey);
    if (properties.length === 0) return { imported: 0, failed: result.failed };

    let inserted = 0;
    for (const property of properties) {
      try {
        const listingData = transformProperty(property, agency.user_id);
        const newListing = {
          ...listingData,
          id: crypto.randomUUID(),
          is_verified: true,
          created_at: new Date().toISOString(),
        };
        const { error } = await supabase.from('property_listings').insert([newListing]);
        if (error) {
          result.failed++;
          result.errors.push(`Insert failed for "${property.title}": ${error.message}`);
        } else {
          inserted++;
        }
      } catch (err: any) {
        result.failed++;
        result.errors.push(`Insert failed for "${property.title}": ${err.message}`);
      }
    }

    return { imported: inserted, failed: result.failed };
  }

  // Push Notifications
  async savePushSubscription(subscription: any): Promise<void> {
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert([subscription], { onConflict: 'endpoint' });

    if (error) throw new Error(error.message);
  }

  async getPushSubscriptions(): Promise<any[]> {
    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (error) throw new Error(error.message);
    return data || [];
  }

  // Feed Ingestion Engine
  async registerAgencyFeed(feed: any): Promise<any> {
    const { data, error } = await supabase.from('agency_feeds').insert([{...feed, last_sync_at: null, created_at: new Date().toISOString()}]).select().single();
    if (error) throw new Error(error.message);
    return data;
  }
  async getAgencyFeeds(): Promise<any[]> {
    const { data, error } = await supabase.from('agency_feeds').select('*');
    if (error) throw new Error(error.message);
    return data || [];
  }
  async getAgencyFeedById(id: string): Promise<any> {
    const { data, error } = await supabase.from('agency_feeds').select('*').eq('id', id).single();
    if (error) throw new Error(error.message);
    return data;
  }
  async updateAgencyFeedSync(id: string, lastSyncAt: string): Promise<void> {
    const { error } = await supabase.from('agency_feeds').update({ last_sync_at: lastSyncAt }).eq('id', id);
    if (error) throw new Error(error.message);
  }
  async upsertFeedListings(agencyId: string, listings: any[]): Promise<any> {
    const result = { imported: 0, failed: 0, errors: [] as string[] };
    for (const listing of listings) {
      const { error } = await supabase.from('feed_listings').upsert(
        { ...listing, agency_id: agencyId, last_synced_at: new Date().toISOString() },
        { onConflict: 'agency_id,external_id' }
      );
      if (error) { result.failed++; result.errors.push(error.message); }
      else result.imported++;
    }
    return result;
  }
  async getFeedListingsByAgency(agencyId: string): Promise<any[]> {
    const { data, error } = await supabase.from('feed_listings').select('*').eq('agency_id', agencyId);
    if (error) throw new Error(error.message);
    return data || [];
  }
  async deactivateStaleFeedListings(agencyId: string, _activeExternalIds: string[]): Promise<number> {
    const { data, error } = await supabase.from('feed_listings')
      .update({ status: 'rented' })
      .eq('agency_id', agencyId)
      .eq('status', 'available')
      .select('id');
    if (error) throw new Error(error.message);
    return data?.length || 0;
  }
}
export const supabaseDb = new SupabaseDatabase();
