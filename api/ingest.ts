/**
 * Ingestion API Endpoint — POST /api/ingest
 * Accepts XML and JSON property feed payloads with API key authentication.
 *
 * Authentication: `Authorization: Api-Key <KEY>` or `X-API-Key: <KEY>` header.
 * Body: raw XML string, or JSON object/array.
 *
 * Vercel serverless function (Node runtime).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { parseFeedBody } from '../server/feedIngestion/syncEngine';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://ffqwbtvdemoihuxbmczq.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

/**
 * Validate the API key from request headers against the feed_api_keys table.
 */
async function authenticate(apiKey: string) {
  if (!apiKey) return null;
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const { data, error } = await supabase
    .from('feed_api_keys')
    .select('*')
    .eq('key', apiKey)
    .eq('is_active', true)
    .single();
  if (error || !data) return null;
  return data;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // --- Authentication ---
  const authHeader = req.headers['authorization'] || '';
  const xApiKey = (req.headers['x-api-key'] as string) || '';
  let apiKey = '';
  if (authHeader.startsWith('Api-Key ')) {
    apiKey = authHeader.slice(8).trim();
  } else if (authHeader.startsWith('Bearer ')) {
    apiKey = authHeader.slice(7).trim();
  } else if (xApiKey) {
    apiKey = xApiKey;
  }

  const apiKeyRecord = await authenticate(apiKey);
  if (!apiKeyRecord) {
    return res.status(401).json({ error: 'Invalid or missing API key.' });
  }

  // --- Parse body ---
  const contentType = req.headers['content-type'] || '';
  const format = (req.query.format as string) || (apiKeyRecord.default_format as string) || 'blm';
  let rawBody: string;

  try {
    if (typeof req.body === 'string') {
      rawBody = req.body;
    } else if (Buffer.isBuffer(req.body)) {
      rawBody = req.body.toString('utf-8');
    } else if (req.body && typeof req.body === 'object') {
      // JSON object body — re-serialize
      rawBody = JSON.stringify(req.body);
    } else {
      rawBody = '';
    }
  } catch (e) {
    return res.status(400).json({ error: 'Unable to read request body.' });
  }

  if (!rawBody || !rawBody.trim()) {
    return res.status(400).json({ error: 'Empty feed payload.' });
  }

  // --- Parse feed ---
  let listings;
  try {
    listings = parseFeedBody(rawBody, contentType, format as any);
  } catch (e: any) {
    return res.status(400).json({ error: `Feed parsing failed: ${e.message}` });
  }

  if (listings.length === 0) {
    return res.status(422).json({ error: 'Feed contained zero valid listings.', imported: 0, failed: 0 });
  }

  // --- Persist listings ---
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const providerId = apiKeyRecord.agency_id || 'feed-source';

  let imported = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const source of listings) {
    try {
      const { mapToPropertyListing, validateMappedListing } = await import('../server/feedIngestion/fieldMapper');
      const mapped = mapToPropertyListing(source, providerId);
      const validationError = validateMappedListing(mapped);
      if (validationError) {
        failed++;
        errors.push(`${source.title || source.externalId}: ${validationError}`);
        continue;
      }

      const record = {
        ...mapped,
        external_id: `${providerId}:${source.externalId}`,
        feed_source: source._sourceFormat,
        source_external_id: source.externalId,
        last_synced_at: new Date().toISOString(),
        is_verified: true,
      };

      const { error } = await supabase
        .from('property_listings')
        .upsert(record, { onConflict: 'external_id' });

      if (error) {
        failed++;
        errors.push(`${source.title || source.externalId}: ${error.message}`);
      } else {
        imported++;
      }
    } catch (e: any) {
      failed++;
      errors.push(`${source.title || source.externalId}: ${e.message}`);
    }
  }

  return res.status(200).json({
    success: failed === 0 || imported > 0,
    imported,
    failed,
    errors: errors.slice(0, 50),
    timestamp: new Date().toISOString(),
  });
}
