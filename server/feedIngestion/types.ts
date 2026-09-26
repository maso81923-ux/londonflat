/**
 * Feed Ingestion Engine — Type Definitions
 * Supports XML (BLM, Rightmove V3, Jupix, Reapit RPS) and JSON feed formats.
 */

import type { ListingPurpose, PropertyType, PropertyStatus } from '../../src/db/schema';

// --- Feed Source Formats ---
export type FeedFormat = 'blm' | 'rightmove-v3' | 'jupix' | 'reapit-rps' | 'homedata-json' | 'generic-json';

// --- Feed Sync Configuration ---
export interface FeedSyncConfig {
  id: string;
  agencyId: string;
  feedUrl: string;
  apiKey: string;
  format: FeedFormat;
  syncIntervalMinutes: number; // Standard: 1440 (daily), Premium: 15
  tier: 'standard' | 'premium';
  lastSyncAt?: string;
  isActive: boolean;
  createdAt: string;
}

// --- Feed Source Listing (raw, before mapping) ---
export interface FeedSourceListing {
  // Common across all formats
  externalId: string;
  title: string;
  description: string;
  price: number;
  priceType: 'pcm' | 'sale_price' | 'asking_price';
  deposit?: number;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  borough?: string;
  postcode: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  availableDate: string;
  billsIncluded: boolean;
  features?: string[];
  images?: string[];
  latitude?: number;
  longitude?: number;
  status: string;
  agencyRef?: string;
  agencyName?: string;
  agencyPhone?: string;
  agencyEmail?: string;
  agencyLogo?: string;

  // Raw source data preserved for debugging
  _sourceFormat: FeedFormat;
  _rawData: string;
}

// --- Ingestion Result ---
export interface IngestionResult {
  success: boolean;
  imported: number;
  updated: number;
  failed: number;
  errors: string[];
  feedSourceId?: string;
  timestamp: string;
}

// --- Feed Health Status ---
export interface FeedHealthStatus {
  feedId: string;
  agencyId: string;
  agencyName: string;
  feedUrl: string;
  format: FeedFormat;
  tier: 'standard' | 'premium';
  lastSyncAt: string | null;
  lastSyncStatus: 'success' | 'partial' | 'failed' | 'never';
  totalListings: number;
  activeListings: number;
  errors: string[];
}

// --- API Key Store (for endpoint auth) ---
export interface ApiKeyRecord {
  key: string;
  agencyId: string;
  tier: 'standard' | 'premium';
  isActive: boolean;
  createdAt: string;
}

// --- Field mapping helpers ---
export function mapPropertyType(raw: string): PropertyType {
  const t = raw.toLowerCase();
  if (t === 'room' || t === 'studio' || t === 'bedsit') return 'room';
  return 'entire_flat';
}

export function mapListingPurpose(priceType: string): ListingPurpose {
  if (priceType === 'pcm') return 'rent';
  if (priceType === 'sale_price' || priceType === 'asking_price') return 'sale';
  return 'rent';
}

export function mapPropertyStatus(status: string): PropertyStatus {
  const s = status.toLowerCase();
  if (s === 'under_offer' || s === 'under-offer') return 'under_offer';
  if (s === 'sold' || s === 'sold_stc' || s === 'sold-stc') return 'sold';
  if (s === 'let_agreed' || s === 'let-agreed' || s === 'rented') return 'rented';
  return 'available';
}

export function normalizeBorough(raw?: string, city?: string): string {
  const input = (raw || city || 'Greater London').trim();
  const mapping: Record<string, string> = {
    'Kensington and Chelsea': 'Kensington & Chelsea',
    'City of Westminster': 'Westminster',
    'City': 'City of London',
    'Hammersmith and Fulham': 'Hammersmith & Fulham',
    'Barking and Dagenham': 'Barking & Dagenham',
  };
  return mapping[input] || input;
}
