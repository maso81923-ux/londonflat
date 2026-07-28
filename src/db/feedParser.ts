/**
 * Homedata UK Feed Parser
 * Fetches property listings from Homedata UK's JSON API with API key authentication.
 * 
 * API endpoint: https://api.homedata.uk/v1/properties
 * Auth: Bearer token via X-API-Key or Authorization header
 * Response: JSON array of property objects
 */

import type { PropertyListing, ListingPurpose, PropertyType, PropertyStatus } from './schema';

export interface HomedataProperty {
  property_id: string;
  title: string;
  description: string;
  price: number;
  price_type: 'pcm' | 'sale_price' | 'asking_price';
  deposit?: number;
  address_line1: string;
  address_line2?: string;
  city: string;
  borough?: string;
  postcode: string;
  property_type: 'flat' | 'house' | 'studio' | 'room' | 'maisonette';
  bedrooms: number;
  bathrooms: number;
  available_date: string;
  bills_included: boolean;
  features?: string[];
  images?: string[];
  latitude?: number;
  longitude?: number;
  status: 'available' | 'under_offer' | 'sold' | 'let_agreed';
  agency_ref?: string;
  agency_name?: string;
  agency_phone?: string;
  agency_email?: string;
  agency_logo?: string;
}

export interface FeedImportResult {
  imported: number;
  failed: number;
  errors: string[];
}

export interface FeedImportOptions {
  apiKey: string;
  endpoint?: string;
  providerId: string; // The user/agency importing listings
}

const DEFAULT_ENDPOINT = 'https://api.homedata.uk/v1/properties';

/**
 * Map Homedata property type to LondonFlat PropertyType
 */
function mapPropertyType(homedataType: HomedataProperty['property_type']): PropertyType {
  switch (homedataType) {
    case 'room':
    case 'studio':
      return 'room';
    case 'flat':
    case 'house':
    case 'maisonette':
    default:
      return 'entire_flat';
  }
}

/**
 * Map Homedata price type to LondonFlat ListingPurpose
 */
function mapListingPurpose(priceType: HomedataProperty['price_type']): ListingPurpose {
  switch (priceType) {
    case 'sale_price':
      return 'sale';
    case 'asking_price':
      return 'buy';
    case 'pcm':
    default:
      return 'rent';
  }
}

/**
 * Map Homedata status to LondonFlat PropertyStatus
 */
function mapPropertyStatus(status: HomedataProperty['status']): PropertyStatus {
  switch (status) {
    case 'under_offer':
      return 'under_offer';
    case 'sold':
      return 'sold';
    case 'let_agreed':
      return 'rented';
    case 'available':
    default:
      return 'available';
  }
}

/**
 * Map Homedata borough string — clean up and normalize known London borough names
 */
function normalizeBorough(borough?: string, city?: string): string {
  const raw = borough || city || 'Greater London';
  // Normalize common variants
  const mapping: Record<string, string> = {
    'Kensington and Chelsea': 'Kensington & Chelsea',
    'City of Westminster': 'Westminster',
    'City': 'City of London',
    'Hammersmith and Fulham': 'Hammersmith & Fulham',
    'Barking and Dagenham': 'Barking & Dagenham',
    'Kingston upon Thames': 'Kingston upon Thames',
    'Richmond upon Thames': 'Richmond upon Thames',
  };
  return mapping[raw] || raw;
}

/**
 * Transform a Homedata property into a LondonFlat PropertyListing
 */
export function transformProperty(property: HomedataProperty, providerId: string): Omit<PropertyListing, 'id' | 'is_verified' | 'created_at'> {
  const listingPurpose = mapListingPurpose(property.price_type);
  
  return {
    provider_id: providerId,
    title: property.title,
    description: property.description,
    price_per_month: listingPurpose === 'rent' ? property.price : undefined,
    price: listingPurpose !== 'rent' ? property.price : undefined,
    deposit: property.deposit || 0,
    address: property.address_line1 + (property.address_line2 ? ', ' + property.address_line2 : ''),
    borough: normalizeBorough(property.borough, property.city),
    postcode: property.postcode,
    type: mapPropertyType(property.property_type),
    listing_purpose: listingPurpose,
    property_status: mapPropertyStatus(property.status),
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    available_from: property.available_date,
    is_bills_included: property.bills_included,
    amenities: property.features || [],
    images: property.images || [],
    latitude: property.latitude,
    longitude: property.longitude,
  };
}

/**
 * Parse a feed URL to extract and strip the api_key query parameter.
 * Returns { cleanUrl, apiKey } — the cleanUrl has api_key removed.
 */
export function parseFeedUrl(feedUrl: string): { cleanUrl: string; apiKey: string | null } {
  try {
    const url = new URL(feedUrl);
    const apiKey = url.searchParams.get('api_key');
    url.searchParams.delete('api_key');
    return { cleanUrl: url.toString(), apiKey };
  } catch {
    // If URL parsing fails, treat as raw URL without API key
    return { cleanUrl: feedUrl, apiKey: null };
  }
}

/**
 * Fetch properties from the Homedata UK JSON API
 */
export async function fetchHomedataFeed(options: FeedImportOptions): Promise<HomedataProperty[]> {
  const endpoint = options.endpoint || DEFAULT_ENDPOINT;
  
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Api-Key ${options.apiKey}`,
      'User-Agent': 'LondonFlat/1.0 (Feed Importer)',
    },
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Homedata API authentication failed. Check your API key.');
    }
    if (response.status === 429) {
      throw new Error('Homedata API rate limit exceeded. Try again later.');
    }
    throw new Error(`Homedata API error: HTTP ${response.status} — ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!Array.isArray(data)) {
    // Some APIs wrap in { properties: [...] } or { data: [...] }
    if (data?.properties && Array.isArray(data.properties)) {
      return data.properties;
    }
    if (data?.data && Array.isArray(data.data)) {
      return data.data;
    }
    if (data?.listings && Array.isArray(data.listings)) {
      return data.listings;
    }
    throw new Error('Unexpected API response format: expected an array of properties');
  }
  
  return data as HomedataProperty[];
}

/**
 * Validate a Homedata property object
 */
export function validateProperty(property: HomedataProperty): string | null {
  if (!property.title || typeof property.title !== 'string') return 'Missing or invalid title';
  if (!property.price || typeof property.price !== 'number' || property.price <= 0) return 'Missing or invalid price';
  if (!property.address_line1) return 'Missing address';
  if (!property.postcode) return 'Missing postcode';
  if (!property.bedrooms || property.bedrooms < 1) return 'Missing or invalid bedroom count';
  return null; // Valid
}

/**
 * Parse and import a Homedata UK feed, returning the import result.
 * This is the main entry point — call this with API key and provider ID.
 */
export async function parseAndValidateFeed(options: FeedImportOptions): Promise<{ properties: HomedataProperty[]; result: FeedImportResult }> {
  const result: FeedImportResult = { imported: 0, failed: 0, errors: [] };
  
  let properties: HomedataProperty[];
  try {
    properties = await fetchHomedataFeed(options);
  } catch (err: any) {
    result.errors.push(`Feed fetch failed: ${err.message}`);
    return { properties: [], result };
  }

  if (properties.length === 0) {
    result.errors.push('Feed returned 0 properties — the agency may have no active listings.');
    return { properties: [], result };
  }

  // Validate each property
  const valid: HomedataProperty[] = [];
  for (const property of properties) {
    const validationError = validateProperty(property);
    if (validationError) {
      result.failed++;
      result.errors.push(`Property "${property.property_id || 'unknown'}" skipped: ${validationError}`);
    } else {
      valid.push(property);
    }
  }

  result.imported = valid.length;
  return { properties: valid, result };
}
