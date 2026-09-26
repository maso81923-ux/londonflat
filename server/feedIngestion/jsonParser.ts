/**
 * JSON API Feed Parser
 * Supports REST JSON payloads (Homedata and generic property feeds).
 * Handles wrapped response formats: { properties: [...] }, { data: [...] }, { listings: [...] },
 * and bare arrays.
 */

import type { FeedSourceListing, FeedFormat } from './types';

function toNumber(v: unknown): number {
  const n = parseFloat(String(v ?? '').replace(/[^0-9.\-]/g, ''));
  return isNaN(n) ? 0 : n;
}

function toBool(v: unknown): boolean {
  const s = String(v ?? '').trim().toLowerCase();
  return s === 'true' || s === 'yes' || s === '1' || s === 'y';
}

/**
 * Normalize a raw JSON object into a FeedSourceListing.
 * Accepts snake_case and camelCase keys.
 */
function normalizeJsonProperty(raw: any, index: number): FeedSourceListing {
  const g = (key: string) => raw[key] ?? raw[key.toLowerCase()] ?? raw[key.replace(/_/g, '')] ?? '';

  const propertyType = g('property_type') || g('propertyType') || g('type') || 'flat';
  const priceType = g('price_type') || g('priceType') || 'pcm';

  return {
    externalId: g('property_id') || g('propertyId') || g('id') || g('externalId') || `json-${index}`,
    title: g('title') || g('summary') || g('name'),
    description: g('description') || g('details') || g('full_description'),
    price: toNumber(g('price') || g('price_per_month') || g('rent') || g('asking_price')),
    priceType: priceType as any,
    deposit: toNumber(g('deposit')),
    addressLine1: g('address_line1') || g('addressLine1') || g('address_1') || g('address'),
    addressLine2: g('address_line2') || g('addressLine2') || g('address_2'),
    city: g('city') || g('town'),
    borough: g('borough') || g('area'),
    postcode: g('postcode') || g('post_code') || g('postalCode'),
    propertyType,
    bedrooms: toNumber(g('bedrooms') || g('beds')),
    bathrooms: toNumber(g('bathrooms') || g('baths')),
    availableDate: g('available_date') || g('availableDate') || g('available'),
    billsIncluded: toBool(g('bills_included') || g('billsIncluded')),
    features: Array.isArray(g('features') || g('amenities')) ? (g('features') || g('amenities')) : [],
    images: Array.isArray(g('images') || g('photos') || g('image_urls')) ? (g('images') || g('photos') || g('image_urls')) : [],
    latitude: toNumber(g('latitude') || g('lat')),
    longitude: toNumber(g('longitude') || g('lng')),
    status: g('status') || 'available',
    agencyRef: g('agency_ref') || g('agencyRef') || g('reference'),
    agencyName: g('agency_name') || g('agencyName') || g('agent_name'),
    agencyPhone: g('agency_phone') || g('agencyPhone') || g('agent_phone'),
    agencyEmail: g('agency_email') || g('agencyEmail') || g('agent_email'),
    agencyLogo: g('agency_logo') || g('agencyLogo') || g('agent_logo'),
    _sourceFormat: 'generic-json',
    _rawData: JSON.stringify(raw),
  };
}

/**
 * Parse a JSON payload into FeedSourceListing[].
 * Accepts: bare array, { properties }, { data }, { listings }, { results }.
 */
export function parseJsonFeed(payload: unknown, format: FeedFormat = 'generic-json'): FeedSourceListing[] {
  let arr: any[] = [];

  if (Array.isArray(payload)) {
    arr = payload;
  } else if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, any>;
    if (Array.isArray(obj.properties)) arr = obj.properties;
    else if (Array.isArray(obj.data)) arr = obj.data;
    else if (Array.isArray(obj.listings)) arr = obj.listings;
    else if (Array.isArray(obj.results)) arr = obj.results;
    else if (Array.isArray(obj.items)) arr = obj.items;
    else arr = [obj]; // Single property object
  }

  return arr.map((item, i) => {
    const normalized = normalizeJsonProperty(item, i);
    normalized._sourceFormat = format;
    return normalized;
  });
}

/**
 * Detect format from JSON payload hints (homedata vs generic).
 */
export function detectJsonFormat(payload: unknown): FeedFormat {
  const str = JSON.stringify(payload).toLowerCase();
  if (str.includes('homedata') || str.includes('price_type') || str.includes('property_id')) {
    return 'homedata-json';
  }
  return 'generic-json';
}
