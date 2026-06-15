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

export interface PropertyListing {
  id: string;
  provider_id: string; // Links to UserProfile
  title: string;
  description: string;
  price_per_month: number;
  deposit: number;
  address: string;
  borough: string; // e.g. 'Westminster', 'Kensington & Chelsea', 'Camden', etc.
  postcode: string; // e.g. 'W1B', 'EC1A'
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  available_from: string;
  is_bills_included: boolean;
  amenities: string[]; // e.g. ['wifi', 'parking', 'gym', 'garden']
  images: string[];
  is_verified: boolean;
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
