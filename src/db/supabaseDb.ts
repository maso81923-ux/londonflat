import { supabase } from './supabaseClient';
import type { Database } from './DatabaseInterface';
import { 
  type PropertyListing, 
  type UserProfile, 
  type ViewingRequest, 
  type AgencyDetails, 
  type RequestStatus, 
  type ServiceProvider, 
  type ServiceCategory 
} from './schema';

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

  async registerUser(fullName: string, email: string, role: 'seeker' | 'agency' | 'landlord', phone?: string): Promise<UserProfile> {
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
}

export const supabaseDb = new SupabaseDatabase();
