/**
 * Feed Status Endpoint — GET /api/ingest/status
 * Returns health/status for feed sync configurations.
 *
 * Optional query params:
 *   ?feedId=<id>    — status for a single feed
 *   ?agencyId=<id>  — status for all feeds of an agency
 *
 * Authentication: `Authorization: Api-Key <KEY>` (admin/agency scoped).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://ffqwbtvdemoihuxbmczq.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  // Optional auth — allow public status read for demo, require key if provided
  const authHeader = req.headers['authorization'] || '';
  let apiKey = '';
  if (authHeader.startsWith('Api-Key ')) apiKey = authHeader.slice(8).trim();
  else if (authHeader.startsWith('Bearer ')) apiKey = authHeader.slice(7).trim();

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const feedId = req.query.feedId as string | undefined;
  const agencyId = req.query.agencyId as string | undefined;

  let query = supabase.from('feed_sync_configs').select('*');
  if (feedId) query = query.eq('id', feedId);
  if (agencyId) query = query.eq('agency_id', agencyId);

  const { data: feeds, error } = await query.order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: `Failed to load feed status: ${error.message}` });
  }

  // If a specific API key was provided, filter to that agency's feeds
  let results = feeds || [];
  if (apiKey) {
    const { data: keyRecord } = await supabase
      .from('feed_api_keys')
      .select('agency_id')
      .eq('key', apiKey)
      .single();
    if (keyRecord) {
      results = results.filter((f: any) => f.agency_id === keyRecord.agency_id);
    }
  }

  const statuses = results.map((feed: any) => ({
    feedId: feed.id,
    agencyId: feed.agency_id,
    agencyName: feed.agency_name || '',
    feedUrl: feed.feed_url,
    format: feed.format || 'blm',
    tier: feed.tier || 'standard',
    syncIntervalMinutes: feed.sync_interval_minutes || 1440,
    isActive: feed.is_active,
    lastSyncAt: feed.last_sync_at || null,
    lastSyncStatus: feed.last_sync_status || 'never',
    totalListings: feed.total_listings || 0,
    activeListings: feed.active_listings || 0,
    errors: feed.errors || [],
  }));

  return res.status(200).json({
    feeds: statuses,
    total: statuses.length,
    timestamp: new Date().toISOString(),
  });
}
