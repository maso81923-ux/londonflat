/**
 * Homedata UK Feed Parser
 * Parses Homedata UK JSON API responses and maps them to LondonFlat PropertyListing schema.
 * 
 * Feed URLs may include ?api_key=... which is extracted and sent as Authorization: Api-Key header.
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
}

export interface FeedImportResult {
  imported: number;
  failed: number;
  errors: string[];
}

/**
 * Extract api_key from a feed URL query string.
 * Returns the clean URL (api_key stripped) and the extracted key.
 */
export function parseFeedUrl(feedUrl: string): { cleanUrl: string; apiKey: string | null } {
  try {
    const url = new URL(feedUrl);
    const apiKey = url.searchParams.get('api_key');
    url.searchParams.delete('api_key');
    return { cleanUrl: url.toString(), apiKey };
  } catch {
    return { cleanUrl: feedUrl, apiKey: null };
  }
}

function mapPropertyType(ht: HomedataProperty['property_type']): PropertyType {
  switch (ht) {
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

function normalizeBorough(borough?: string, city?: string): string {
  const raw = borough || city || 'Greater London';
  const mapping: Record<string, string> = {
    'Kensington and Chelsea': 'Kensington & Chelsea',
    'City of Westminster': 'Westminster',
    'City': 'City of London',
    'Hammersmith and Fulham': 'Hammersmith & Fulham',
    'Barking and Dagenham': 'Barking & Dagenham',
  };
  return mapping[raw] || raw;
}

/**
 * Transform a Homedata property into a LondonFlat PropertyListing (without id/is_verified/created_at).
 */
export function transformProperty(
  property: HomedataProperty,
  providerId: string
): Omit<PropertyListing, 'id' | 'is_verified' | 'created_at'> {
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

function validateProperty(property: HomedataProperty): string | null {
  if (!property.title || typeof property.title !== 'string') return 'Missing or invalid title';
  if (!property.price || typeof property.price !== 'number' || property.price <= 0) return 'Missing or invalid price';
  if (!property.address_line1) return 'Missing address';
  if (!property.postcode) return 'Missing postcode';
  if (!property.bedrooms || property.bedrooms < 1) return 'Missing or invalid bedroom count';
  return null;
}

async function fetchFeed(endpoint: string, apiKey: string): Promise<HomedataProperty[]> {
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Api-Key ' + apiKey,
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
    throw new Error(`Homedata API error: HTTP ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    if (data?.properties && Array.isArray(data.properties)) return data.properties;
    if (data?.data && Array.isArray(data.data)) return data.data;
    if (data?.listings && Array.isArray(data.listings)) return data.listings;
    throw new Error('Unexpected API response format: expected an array of properties');
  }
  return data as HomedataProperty[];
}

/**
 * Fetch and validate a Homedata UK feed.
 */
export async function parseAndValidateFeed(
  endpoint: string,
  apiKey: string
): Promise<{ properties: HomedataProperty[]; result: FeedImportResult }> {
  const result: FeedImportResult = { imported: 0, failed: 0, errors: [] };
  let properties: HomedataProperty[];

  try {
    properties = await fetchFeed(endpoint, apiKey);
  } catch (err: any) {
    result.errors.push(`Feed fetch failed: ${err.message}`);
    return { properties: [], result };
  }

  if (properties.length === 0) {
    result.errors.push('Feed returned 0 properties — the agency may have no active listings.');
    return { properties: [], result };
  }

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
