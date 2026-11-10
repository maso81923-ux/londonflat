/**
 * LondonFlat Feed Sync Engine
 *
 * GET /api/sync — Sync every active feed registered in agency_feeds
 * GET /api/sync?feed_id=<uuid> — Sync one registered feed
 *
 * This is a Vercel serverless function designed to be called on a schedule
 * (e.g. a Vercel Cron Job every 15 minutes, or triggered manually).
 *
 * Writes go through a service-role client built inside the handler from
 * process.env (see ../server/supabaseAdmin). feed_listings and agency_feeds are
 * RLS-protected, so the publishable key can no longer write them and must never
 * be used here. Without the key the endpoint fails closed with a 503.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { SupabaseClient } from '@supabase/supabase-js';
import { XMLParser } from 'fast-xml-parser';
import { parseFeedUrl, parseAndValidateFeed, type HomedataProperty } from '../src/db/feedParser';
import { createServiceClient, NOT_CONFIGURED_MESSAGE, NOT_CONFIGURED_DETAIL } from '../server/supabaseAdmin';

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  isArray: (name: string) => ['property', 'listing', 'image', 'feature'].includes(name),
});

// ─── Registered feeds (from agency_feeds) ───────────────────────────────────

interface FeedRow {
  id: string;
  agency_name: string;
  feed_url: string;
  feed_type: 'xml' | 'json';
  api_key: string | null;
  tier: string;
  is_active: boolean;
}

interface NormalisedProperty {
  external_id: string;
  title: string;
  description: string;
  price: number;
  borough: string | null;
  postcode: string | null;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  features: string[];
  status: 'available' | 'under_offer' | 'sold' | 'rented';
}

interface SyncResult {
  feed_id: string;
  agency: string;
  type: 'xml' | 'json';
  imported: number;
  failed: number;
  errors: string[];
}

// ─── Mapping helpers ────────────────────────────────────────────────────────

function mapStatus(status?: string): NormalisedProperty['status'] {
  const s = (status || '').toLowerCase();
  if (s === 'under_offer' || s === 'under offer' || s === 'sold_stc') return 'under_offer';
  if (s === 'sold' || s === 'completed') return 'sold';
  if (s === 'let_agreed' || s === 'let agreed' || s === 'rented' || s === 'let') return 'rented';
  return 'available';
}

function mapJsonProperty(p: HomedataProperty): NormalisedProperty {
  return {
    external_id: String(p.property_id || ''),
    title: p.title || '',
    description: p.description || '',
    price: Number(p.price) || 0,
    borough: p.borough || p.city || null,
    postcode: p.postcode || null,
    bedrooms: Number(p.bedrooms) || 0,
    bathrooms: Number(p.bathrooms) || 0,
    images: Array.isArray(p.images) ? p.images : [],
    features: Array.isArray(p.features) ? p.features : [],
    status: mapStatus(p.status),
  };
}

function mapXmlProperty(raw: any): NormalisedProperty {
  return {
    external_id: String(raw.agent_ref || raw.property_id || raw.id || ''),
    title: raw.title || raw.display_address || '',
    description: raw.description || raw.summary || '',
    price: parseFloat(raw.price || raw.rent || '0') || 0,
    borough: raw.borough || raw.town || raw.city || null,
    postcode: raw.postcode || null,
    bedrooms: parseInt(raw.bedrooms) || 0,
    bathrooms: parseInt(raw.bathrooms) || 0,
    images: Array.isArray(raw.image)
      ? raw.image.map((img: any) => img.url || img)
      : (Array.isArray(raw.images) ? raw.images : []),
    features: Array.isArray(raw.feature) ? raw.feature : (Array.isArray(raw.features) ? raw.features : []),
    status: mapStatus(raw.status),
  };
}

function validateProperty(p: NormalisedProperty): string | null {
  if (!p.external_id) return 'Missing property reference';
  if (!p.title || typeof p.title !== 'string') return 'Missing title';
  if (!p.price || p.price <= 0) return 'Missing or invalid price';
  if (!p.bedrooms || p.bedrooms < 1) return 'Missing bedroom count';
  return null;
}

// ─── XML parsing (same feed detection as api/ingest.ts) ─────────────────────

function parseXmlProperties(xml: string): NormalisedProperty[] {
  const parsed = xmlParser.parse(xml);
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

  return rawProperties.map(mapXmlProperty);
}

// ─── Per-feed sync ──────────────────────────────────────────────────────────

async function syncFeed(client: SupabaseClient, feed: FeedRow): Promise<SyncResult> {
  const base: SyncResult = {
    feed_id: feed.id,
    agency: feed.agency_name,
    type: feed.feed_type,
    imported: 0,
    failed: 0,
    errors: [],
  };

  const { cleanUrl, apiKey } = parseFeedUrl(feed.feed_url);
  const key = apiKey || feed.api_key || '';

  let properties: NormalisedProperty[];

  try {
    if (feed.feed_type === 'xml') {
      const response = await fetch(cleanUrl, {
        headers: {
          Accept: 'application/xml, text/xml, */*',
          Authorization: `Api-Key ${key}`,
          'User-Agent': 'LondonFlat-Sync/1.0',
        },
        signal: AbortSignal.timeout(30000),
      });
      if (!response.ok) {
        base.errors.push(`HTTP ${response.status}: ${response.statusText}`);
        return base;
      }
      properties = parseXmlProperties(await response.text());
    } else {
      const { properties: parsed, result } = await parseAndValidateFeed(cleanUrl, key);
      base.errors.push(...result.errors);
      base.failed += result.failed;
      properties = parsed.map(mapJsonProperty);
    }
  } catch (err: any) {
    base.errors.push(`Feed fetch failed: ${err.message}`);
    return base;
  }

  const now = new Date().toISOString();
  const rows = properties
    .filter((p) => {
      const validationError = validateProperty(p);
      if (validationError) {
        base.failed++;
        base.errors.push(`${p.external_id || p.title || 'unknown'}: ${validationError}`);
        return false;
      }
      return true;
    })
    .map((p) => ({
      agency_id: feed.id,
      external_id: p.external_id,
      source: `${feed.feed_type}-api-feed`,
      feed_type: feed.feed_type,
      property_data: p,
      status: p.status,
      borough: p.borough,
      price: p.price,
      bedrooms: p.bedrooms,
      images: p.images,
      last_synced_at: now,
    }));

  if (rows.length > 0) {
    const { error, count } = await client
      .from('feed_listings')
      .upsert(rows, { onConflict: 'agency_id,external_id', count: 'exact' });
    if (error) {
      base.errors.push(`Upsert failed: ${error.message}`);
      base.failed += rows.length;
    } else {
      base.imported = count ?? rows.length;
    }
  }

  if (base.errors.length === 0) {
    await client.from('agency_feeds').update({ last_sync_at: now }).eq('id', feed.id);
  }

  return base;
}

// ─── Handler ────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET to trigger sync.' });
  }

  // Fail closed: no server key, no sync. Never fall back to the publishable key.
  const client = createServiceClient();
  if (!client) {
    return res.status(503).json({ error: NOT_CONFIGURED_MESSAGE, detail: NOT_CONFIGURED_DETAIL });
  }

  const feedId = req.query.feed_id as string | undefined;

  let query = client
    .from('agency_feeds')
    .select('id, agency_name, feed_url, feed_type, api_key, tier, is_active');
  query = feedId ? query.eq('id', feedId) : query.eq('is_active', true);

  const { data: feeds, error } = await query;
  if (error) {
    return res.status(500).json({ error: `Could not load registered feeds: ${error.message}` });
  }

  const rows = (feeds || []) as FeedRow[];
  if (rows.length === 0) {
    return res.status(200).json({
      synced_at: new Date().toISOString(),
      feeds_synced: 0,
      total_imported: 0,
      total_failed: 0,
      feeds: [],
      message: feedId ? 'No feed with that id' : 'No active feeds registered',
    });
  }

  const results: SyncResult[] = [];
  for (const feed of rows) {
    results.push(await syncFeed(client, feed));
  }

  return res.status(200).json({
    synced_at: new Date().toISOString(),
    feeds_synced: results.length,
    total_imported: results.reduce((sum, r) => sum + r.imported, 0),
    total_failed: results.reduce((sum, r) => sum + r.failed, 0),
    feeds: results,
  });
}
