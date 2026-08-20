/**
 * LondonFlat Feed Ingestion API Endpoint
 * 
 * POST /api/ingest — Ingest feed data (XML or JSON) with API key auth
 * GET  /api/ingest?feed_id=...&status — Return feed sync status
 * 
 * This is a Vercel serverless function. Deploy auto-detects files in /api.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { XMLParser } from 'fast-xml-parser';

// In-memory store of registered feeds (serverless — resets on cold start)
// In production this should use a database
const REGISTERED_FEEDS: Record<string, { apiKey: string }> = {
  'demo-feed-001': { apiKey: 'lf_demo_key_2026' },
};

// ─── XML Parsing ───────────────────────────────────────────────────────────

interface ParsedProperty {
  external_id: string;
  title: string;
  description: string;
  price: number;
  deposit: number;
  address: string;
  borough: string;
  postcode: string;
  property_type: 'room' | 'entire_flat';
  bedrooms: number;
  bathrooms: number;
  available_date: string;
  bills_included: boolean;
  features: string[];
  images: string[];
  status: string;
}

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  isArray: (name: string) => ['property', 'listing', 'image', 'feature'].includes(name),
});

function parseXmlFeed(xml: string): ParsedProperty[] {
  const parsed = xmlParser.parse(xml);
  
  // Detect feed format from root element
  const root = parsed.property_data || parsed.properties || parsed.listings || parsed;
  
  // BLM Standard: root.property[]
  if (root.property) return root.property.map(mapBlmProperty);
  // Rightmove V3: root.listing[]
  if (root.listing) return root.listing.map(mapRmProperty);
  // Jupix: root.properties.property[]
  if (root.properties?.property) return root.properties.property.map(mapJupixProperty);
  // Reapit RPS: root.data[]
  if (root.data) return root.data.map(mapReapitProperty);
  
  // Generic fallback — try to find any array of property-like objects
  for (const key of Object.keys(root)) {
    if (Array.isArray(root[key]) && root[key].length > 0) {
      const first = root[key][0];
      if (first.title || first.property_id || first.reference) {
        return root[key].map((item: any) => mapGenericProperty(item, key));
      }
    }
  }
  
  throw new Error('Unrecognised XML feed format. Expected BLM, Rightmove V3, Jupix, or Reapit RPS structure.');
}

function mapBlmProperty(p: any): ParsedProperty {
  return {
    external_id: p.agent_ref || p.property_id || '',
    title: p.title || p.display_address || '',
    description: p.description || p.full_description || '',
    price: parseFloat(p.price) || 0,
    deposit: parseFloat(p.deposit) || 0,
    address: [p.address?.address_line_1, p.address?.address_line_2].filter(Boolean).join(', ') || p.display_address || '',
    borough: p.address?.city || p.address?.town || 'Greater London',
    postcode: p.address?.postcode || '',
    property_type: mapBlmType(p.property_type || p.type),
    bedrooms: parseInt(p.bedrooms) || 0,
    bathrooms: parseInt(p.bathrooms) || 0,
    available_date: p.available_date || p.available_from || new Date().toISOString(),
    bills_included: p.bills_included === 'true' || p.bills_included === true,
    features: Array.isArray(p.feature) ? p.feature : (p.features ? p.features.split(',') : []),
    images: Array.isArray(p.image) ? p.image.map((img: any) => img.url || img['@_url'] || img) : [],
    status: mapStatus(p.status || p.listing_status),
  };
}

function mapRmProperty(p: any): ParsedProperty {
  return {
    external_id: p.agent_ref || p['@_agent_ref'] || '',
    title: p.display_address || p.title || '',
    description: p.description || p.summary || '',
    price: parseFloat(p.price_information?.price) || parseFloat(p.price) || 0,
    deposit: parseFloat(p.price_information?.deposit) || 0,
    address: [p.address_line_1, p.address_line_2].filter(Boolean).join(', ') || p.display_address || '',
    borough: p.town || p.city || 'Greater London',
    postcode: p.postcode || '',
    property_type: p.property_type === 'room' ? 'room' : 'entire_flat',
    bedrooms: parseInt(p.bedrooms) || 0,
    bathrooms: parseInt(p.bathrooms) || 0,
    available_date: p.available_from_date || p.available_date || new Date().toISOString(),
    bills_included: false,
    features: Array.isArray(p.bullet_points) ? p.bullet_points : [],
    images: Array.isArray(p.media?.image) ? p.media.image.map((img: any) => img.url || img['@_url'] || img) : [],
    status: mapStatus(p.status || p.listing_status),
  };
}

function mapJupixProperty(p: any): ParsedProperty {
  return {
    external_id: p.reference || p.property_id || '',
    title: p.display_address || p.title || '',
    description: p.description || p.summary || '',
    price: parseFloat(p.rent) || parseFloat(p.price) || 0,
    deposit: parseFloat(p.deposit) || 0,
    address: [p.address_1, p.address_2].filter(Boolean).join(', ') || p.display_address || '',
    borough: p.town || p.city || 'Greater London',
    postcode: p.postcode || '',
    property_type: p.style === 'room' || p.style === 'studio' ? 'room' : 'entire_flat',
    bedrooms: parseInt(p.bedrooms) || 0,
    bathrooms: parseInt(p.bathrooms) || 0,
    available_date: p.available_date || p.available || new Date().toISOString(),
    bills_included: p.bills_inclusive === 'yes' || p.bills_included === true,
    features: Array.isArray(p.features?.feature) ? p.features.feature : [],
    images: Array.isArray(p.images?.image) ? p.images.image.map((img: any) => img.url || img) : [],
    status: mapStatus(p.status || p.listing_status),
  };
}

function mapReapitProperty(p: any): ParsedProperty {
  return {
    external_id: p.id || p.property_id || '',
    title: p.displayAddress || p.title || '',
    description: p.description || p.summary || '',
    price: parseFloat(p.letting?.rent) || parseFloat(p.price) || 0,
    deposit: parseFloat(p.letting?.deposit) || 0,
    address: [p.address?.line1, p.address?.line2].filter(Boolean).join(', ') || p.displayAddress || '',
    borough: p.address?.district || p.address?.town || 'Greater London',
    postcode: p.address?.postcode || '',
    property_type: p.type === 'room' || p.type === 'studio' ? 'room' : 'entire_flat',
    bedrooms: parseInt(p.bedrooms) || 0,
    bathrooms: parseInt(p.bathrooms) || 0,
    available_date: p.letting?.availableFrom || p.availableDate || new Date().toISOString(),
    bills_included: false,
    features: Array.isArray(p.features) ? p.features : [],
    images: Array.isArray(p.media?.photos) ? p.media.photos.map((img: any) => img.url || img) : [],
    status: mapStatus(p.status || p.letting?.status),
  };
}

function mapGenericProperty(p: any, _source: string): ParsedProperty {
  return {
    external_id: p.external_id || p.property_id || p.agent_ref || p.id || '',
    title: p.title || p.display_address || '',
    description: p.description || p.summary || '',
    price: parseFloat(p.price) || parseFloat(p.price_per_month) || 0,
    deposit: parseFloat(p.deposit) || 0,
    address: p.address || p.display_address || '',
    borough: p.borough || p.city || p.town || 'Greater London',
    postcode: p.postcode || '',
    property_type: (p.type === 'room' || p.property_type === 'room') ? 'room' : 'entire_flat',
    bedrooms: parseInt(p.bedrooms) || 0,
    bathrooms: parseInt(p.bathrooms) || 0,
    available_date: p.available_date || p.available_from || new Date().toISOString(),
    bills_included: p.bills_included === true || p.bills_included === 'true',
    features: Array.isArray(p.features) ? p.features : (Array.isArray(p.amenities) ? p.amenities : []),
    images: Array.isArray(p.images) ? p.images : [],
    status: mapStatus(p.status || p.listing_status),
  };
}

function mapBlmType(type: string): 'room' | 'entire_flat' {
  const t = (type || '').toLowerCase();
  return (t === 'room' || t === 'studio' || t === 'bedsit') ? 'room' : 'entire_flat';
}

function mapStatus(status: string): string {
  const s = (status || '').toLowerCase();
  if (s === 'under_offer' || s === 'under offer' || s === 'sold_stc') return 'under_offer';
  if (s === 'sold' || s === 'completed') return 'sold';
  if (s === 'let_agreed' || s === 'let agreed' || s === 'rented') return 'rented';
  return 'available';
}

// ─── JSON Parsing ───────────────────────────────────────────────────────────

function parseJsonFeed(body: any): ParsedProperty[] {
  const data = Array.isArray(body) ? body :
    body.properties || body.data || body.listings || body.property_data || 
    (body.property ? [body.property] : [body]);
  
  if (!Array.isArray(data)) throw new Error('JSON body must be an array of properties or contain a recognised key (properties, data, listings)');
  
  return data.map((item: any) => mapGenericProperty(item, 'json'));
}

// ─── API Handler ────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET: status check
  if (req.method === 'GET') {
    const feedId = req.query.feed_id as string;
    if (!feedId) {
      return res.status(400).json({ error: 'Missing feed_id query parameter' });
    }
    const feed = REGISTERED_FEEDS[feedId];
    if (!feed) {
      return res.status(404).json({ error: 'Feed not found' });
    }
    return res.status(200).json({
      feed_id: feedId,
      registered: true,
      last_sync: null, // populated by sync engine
      status: 'active',
    });
  }

  // POST: ingest
  if (req.method === 'POST') {
    const apiKey = req.headers['x-api-key'] as string || req.headers['authorization']?.replace('Bearer ', '') || '';
    const feedId = (req.query.feed_id as string) || Object.keys(REGISTERED_FEEDS).find(k => REGISTERED_FEEDS[k].apiKey === apiKey) || '';
    
    if (!apiKey) {
      return res.status(401).json({ error: 'Missing API key. Provide X-API-Key header or ?feed_id query parameter.' });
    }
    
    if (!feedId || !REGISTERED_FEEDS[feedId] || REGISTERED_FEEDS[feedId].apiKey !== apiKey) {
      return res.status(403).json({ error: 'Invalid API key or feed_id' });
    }

    const contentType = req.headers['content-type'] || '';
    let properties: ParsedProperty[];

    try {
      if (contentType.includes('xml') || contentType.includes('application/xml') || 
          (typeof req.body === 'string' && req.body.trim().startsWith('<'))) {
        const xml = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        properties = parseXmlFeed(xml);
      } else {
        properties = parseJsonFeed(req.body);
      }
    } catch (err: any) {
      return res.status(422).json({ error: `Feed parsing failed: ${err.message}`, imported: 0 });
    }

    return res.status(200).json({
      feed_id: feedId,
      imported: properties.length,
      properties: properties.slice(0, 5), // return first 5 for verification
      total: properties.length,
      message: `Successfully parsed ${properties.length} properties`,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}