/**
 * LondonFlat Feed Sync Engine
 * 
 * GET /api/sync — Trigger sync of all active agency feeds
 * GET /api/sync?feed_id=... — Sync a specific feed
 * 
 * This is a Vercel serverless function designed to be called on a schedule
 * (e.g. Vercel Cron Job every 15 minutes, or triggered manually).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { parseFeedUrl, parseAndValidateFeed, transformProperty } from '../src/db/feedParser';
import { XMLParser } from 'fast-xml-parser';

const xmlParser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', isArray: (name: string) => ['property', 'listing', 'image', 'feature'].includes(name) });

// ─── Mock registered feeds (mirrors api/ingest.ts — in production use DB) ────

interface RegisteredFeed {
  feedId: string;
  agencyName: string;
  feedUrl: string;
  feedType: 'xml' | 'json';
  apiKey: string;
  tier: 'standard' | 'premium';
  providerId: string;
}

const FEEDS: RegisteredFeed[] = [
  {
    feedId: 'demo-feed-001',
    agencyName: 'Demo Agency London',
    feedUrl: 'https://example.com/feed/properties?api_key=lf_demo_key_2026',
    feedType: 'json',
    apiKey: 'lf_demo_key_2026',
    tier: 'premium',
    providerId: 'provider-demo',
  },
];

// ─── XML sync (for XML-type feeds) ──────────────────────────────────────────

async function syncXmlFeed(feed: RegisteredFeed): Promise<{ imported: number; failed: number; errors: string[] }> {
  const { cleanUrl, apiKey } = parseFeedUrl(feed.feedUrl);
  const key = apiKey || feed.apiKey;

  const response = await fetch(cleanUrl, {
    headers: {
      'Accept': 'application/xml, text/xml, */*',
      'Authorization': `Api-Key ${key}`,
      'User-Agent': 'LondonFlat-Sync/1.0',
    },
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    return { imported: 0, failed: 0, errors: [`HTTP ${response.status}: ${response.statusText}`] };
  }

  const xml = await response.text();
  const parsed = xmlParser.parse(xml);
  
  // Extract properties — same detection logic as ingest.ts
  const root = parsed.property_data || parsed.properties || parsed.listings || parsed;
  let rawProperties: any[] = [];
  
  if (root.property) rawProperties = root.property;
  else if (root.listing) rawProperties = root.listing;
  else if (root.properties?.property) rawProperties = root.properties.property;
  else if (root.data) rawProperties = root.data;
  else {
    for (const key of Object.keys(root)) {
      if (Array.isArray(root[key]) && root[key].length > 0) {
        rawProperties = root[key];
        break;
      }
    }
  }

  const result = { imported: 0, failed: 0, errors: [] as string[] };
  
  for (const raw of rawProperties) {
    try {
      // Map XML property to a format compatible with transformProperty
      const mapped = {
        property_id: raw.agent_ref || raw.property_id || raw.id || '',
        title: raw.title || raw.display_address || '',
        description: raw.description || raw.summary || '',
        price: parseFloat(raw.price || raw.rent || '0'),
        price_type: 'pcm' as const,
        deposit: parseFloat(raw.deposit) || 0,
        address_line1: raw.address_line_1 || raw.address?.line1 || raw.display_address || '',
        city: raw.town || raw.city || 'London',
        borough: raw.borough || raw.town || raw.city,
        postcode: raw.postcode || '',
        property_type: (raw.property_type || raw.type || 'flat') as any,
        bedrooms: parseInt(raw.bedrooms) || 0,
        bathrooms: parseInt(raw.bathrooms) || 0,
        available_date: raw.available_date || raw.available_from || new Date().toISOString(),
        bills_included: raw.bills_included === 'true' || raw.bills_included === true,
        features: Array.isArray(raw.feature) ? raw.feature : (Array.isArray(raw.features) ? raw.features : []),
        images: Array.isArray(raw.image) ? raw.image.map((img: any) => img.url || img) : (Array.isArray(raw.images) ? raw.images : []),
        status: (raw.status || 'available') as any,
        latitude: parseFloat(raw.latitude) || undefined,
        longitude: parseFloat(raw.longitude) || undefined,
      };
      
      const validationError = validateProperty(mapped);
      if (validationError) {
        result.failed++;
        result.errors.push(`${mapped.property_id}: ${validationError}`);
      } else {
        // In production: transform and upsert to database via the db layer
        result.imported++;
      }
    } catch (err: any) {
      result.failed++;
      result.errors.push(`Parse error: ${err.message}`);
    }
  }
  
  return result;
}

function validateProperty(p: any): string | null {
  if (!p.title || typeof p.title !== 'string') return 'Missing title';
  if (!p.price || p.price <= 0) return 'Missing or invalid price';
  if (!p.bedrooms || p.bedrooms < 1) return 'Missing bedroom count';
  return null;
}

// ─── Handler ────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET to trigger sync.' });
  }

  const feedId = req.query.feed_id as string;
  const feedsToSync = feedId ? FEEDS.filter(f => f.feedId === feedId) : FEEDS.filter(f => f.feedType === 'xml');
  
  // JSON feeds (Homedata) use existing parseAndValidateFeed
  const jsonFeeds = feedId ? FEEDS.filter(f => f.feedId === feedId && f.feedType === 'json') : FEEDS.filter(f => f.feedType === 'json');
  
  const results: any[] = [];

  // Sync JSON feeds
  for (const feed of jsonFeeds) {
    const { cleanUrl, apiKey } = parseFeedUrl(feed.feedUrl);
    const key = apiKey || feed.apiKey;
    try {
      const parsed = await parseAndValidateFeed(cleanUrl, key);
      // In production: transform and upsert
      results.push({ feed_id: feed.feedId, agency: feed.agencyName, type: 'json', ...parsed.result });
    } catch (err: any) {
      results.push({ feed_id: feed.feedId, agency: feed.agencyName, type: 'json', imported: 0, failed: 0, errors: [err.message] });
    }
  }

  // Sync XML feeds
  for (const feed of feedsToSync) {
    try {
      const result = await syncXmlFeed(feed);
      results.push({ feed_id: feed.feedId, agency: feed.agencyName, type: 'xml', ...result });
    } catch (err: any) {
      results.push({ feed_id: feed.feedId, agency: feed.agencyName, type: 'xml', imported: 0, failed: 0, errors: [err.message] });
    }
  }

  const totalImported = results.reduce((sum, r) => sum + r.imported, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);

  return res.status(200).json({
    synced_at: new Date().toISOString(),
    feeds_synced: results.length,
    total_imported: totalImported,
    total_failed: totalFailed,
    feeds: results,
  });
}