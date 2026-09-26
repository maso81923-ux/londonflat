/**
 * Field Mapper — Maps FeedSourceListing to LondonFlat PropertyListing
 * Handles all supported feed formats with consistent field mapping.
 */

import type { PropertyListing } from '../../src/db/schema';
import type { FeedSourceListing } from './types';
import {
  mapPropertyType,
  mapListingPurpose,
  mapPropertyStatus,
  normalizeBorough,
} from './types';

/**
 * Transform a parsed feed listing into LondonFlat's PropertyListing schema.
 */
export function mapToPropertyListing(
  source: FeedSourceListing,
  providerId: string,
): Omit<PropertyListing, 'id' | 'is_verified' | 'created_at'> {
  const listingPurpose = mapListingPurpose(source.priceType);
  const propertyType = mapPropertyType(source.propertyType);
  const propertyStatus = mapPropertyStatus(source.status);
  const borough = normalizeBorough(source.borough, source.city);

  // Build full address from components
  const addressParts = [source.addressLine1, source.addressLine2, source.city, source.postcode]
    .filter(Boolean);
  const address = addressParts.join(', ');

  // Build amenities from features
  const amenities = source.features
    ? source.features.slice(0, 20).map(f => f.trim()).filter(Boolean)
    : [];

  // Images — ensure array
  const images = source.images && source.images.length > 0
    ? source.images.slice(0, 30)
    : [];

  const baseListing: Omit<PropertyListing, 'id' | 'is_verified' | 'created_at'> = {
    provider_id: providerId,
    title: source.title || `${source.bedrooms} bed ${propertyType} in ${borough}`,
    description: source.description || '',
    deposit: source.deposit || 0,
    address,
    borough,
    postcode: source.postcode || '',
    type: propertyType,
    listing_purpose: listingPurpose,
    property_status: propertyStatus,
    bedrooms: source.bedrooms || 1,
    bathrooms: source.bathrooms || 1,
    available_from: source.availableDate || new Date().toISOString().split('T')[0],
    is_bills_included: source.billsIncluded || false,
    amenities,
    images,
    latitude: source.latitude,
    longitude: source.longitude,
  };

  // Set price fields based on listing purpose
  if (listingPurpose === 'rent') {
    baseListing.price_per_month = source.price;
  } else {
    baseListing.price = source.price;
  }

  return baseListing;
}

/**
 * Validate a mapped listing has all required fields.
 * Returns null if valid, or an error message string.
 */
export function validateMappedListing(listing: Omit<PropertyListing, 'id' | 'is_verified' | 'created_at'>): string | null {
  if (!listing.title || listing.title.trim().length < 3) {
    return 'Title is too short or missing';
  }
  if (!listing.address || listing.address.trim().length < 5) {
    return 'Address is too short or missing';
  }
  if (!listing.postcode || listing.postcode.trim().length < 3) {
    return 'Postcode is missing';
  }
  if (!listing.borough || listing.borough.trim().length < 2) {
    return 'Borough is missing';
  }
  if (listing.listing_purpose === 'rent' && (!listing.price_per_month || listing.price_per_month <= 0)) {
    return 'Rent price is missing or invalid';
  }
  if ((listing.listing_purpose === 'sale' || listing.listing_purpose === 'buy') && (!listing.price || listing.price <= 0)) {
    return 'Sale price is missing or invalid';
  }
  if (listing.bedrooms < 1) {
    return 'Bedrooms must be at least 1';
  }
  return null;
}
