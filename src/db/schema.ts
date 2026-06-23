/**
 * Database Schema Definitions
 * Representing standard PostgreSQL tables used in standard platform backends like Supabase or Convex.
 */

export type UserRole = 'seeker' | 'agency' | 'landlord';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  created_at: string;
}

export interface AgencyDetails {
  id: string;
  user_id: string; // Links to UserProfile
  company_name: string;
  logo_url?: string;
  license_number: string;
  phone: string;
  office_address: string;
  website?: string;
  created_at: string;
  is_verified: boolean;
}

export type PropertyType = 'room' | 'entire_flat';
export type ListingPurpose = 'rent' | 'sale' | 'buy';
export type PropertyStatus = 'available' | 'under_offer' | 'sold' | 'rented';

export interface PropertyListing {
  id: string;
  provider_id: string; // Links to UserProfile
  title: string;
  description: string;
  price_per_month?: number; // Optional for rent
  price?: number; // Optional for sale
  deposit: number;
  address: string;
  borough: string; // e.g. 'Westminster', 'Kensington & Chelsea', 'Camden', etc.
  postcode: string; // e.g. 'W1B', 'EC1A'
  type: PropertyType;
  listing_purpose: ListingPurpose;
  property_status: PropertyStatus;
  bedrooms: number;
  bathrooms: number;
  available_from: string;
  is_bills_included: boolean;
  amenities: string[]; // e.g. ['wifi', 'parking', 'gym', 'garden']
  images: string[];
  is_verified: boolean;
  created_at: string;
}

export type ServiceCategory = 'maintenance-tradesmen' | 'legal-financial' | 'logistics-daily-life' | 'safety-care';

export interface ServiceProvider {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  subcategories: string[];
  borough: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo_url?: string;
  is_verified: boolean;
  agency_id?: string; // Optional link to agency_details
  created_at: string;
}

export type RequestStatus = 'pending' | 'confirmed' | 'cancelled';

export interface ViewingRequest {
  id: string;
  listing_id: string; // Links to PropertyListing
  seeker_id: string; // Links to UserProfile (the flat hunter)
  seeker_name: string;
  seeker_email: string;
  seeker_phone: string;
  preferred_date: string;
  preferred_time: string;
  message?: string;
  status: RequestStatus;
  created_at: string;
}
