/**
 * Sync Engine — Polling mechanism for feed URLs.
 * Standard tier: daily sync (1440 min interval)
 * Premium tier: real-time ready (15 min interval)
 *
 * This module runs as a Vercel serverless function triggered by a cron schedule.
 * It fetches each active feed, parses it, maps fields, and upserts into Supabase.
 */

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { FeedSyncConfig, FeedSourceListing, IngestionResult, FeedHealthStatus } from './types';
import { parseXmlFeed } from './xmlParser';
import { parseJsonFeed } from './jsonParser';
import { mapToPropertyListing, validateMappedListing } from './fieldMapper';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://ffqwbtvdemoihuxbmczq.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

/**
 * Get a Supabase client (uses service role key on server, anon key on client).
 */
export function getSupabaseClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '');
}

/**
 * Fetch a remote feed URL (XML or JSON).
 */
async function fetchFeed(config: FeedSyncConfig): Promise<{ contentType: string; body: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(config.feedUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/xml, application/json, text/xml, */*',
        'User-Agent': 'LondonFlat-FeedSync/1.0',
        ...(config.apiKey ? { 'Authorization': `Api-Key ${config.apiKey}` } : {}),
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Feed fetch failed with status ${response.status}`);
    }

    const body = await response.text();
    const contentType = response.headers.get('content-type') || '';
    return { contentType, body };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Parse a feed body (auto-detect XML vs JSON) into FeedSourceListing[].
 */
export function parseFeedBody(body: string, contentType: string, format: FeedSyncConfig['format']): FeedSourceListing[] {
  const trimmed = body.trim();
  if (!trimmed) return [];

  // Auto-detect JSON if content-type says so or body starts with { or [
  const looksJson = contentType.includes('json') || trimmed.startsWith('{') || trimmed.startsWith('[');
  if (looksJson) {
    let payload: unknown;
    try {
      payload = JSON.parse(trimmed);
    } catch (e) {
      throw new Error(`Invalid JSON feed: ${(e as Error).message}`);
    }
    return parseJsonFeed(payload, format as any);
  }

  return parseXmlFeed(trimmed, format as any);
}

/**
 * Upsert listings into Supabase `property_listings` table.
 * Uses upsert on external_id (feed_ref) so re-syncs update rather than duplicate.
 */
async function upsertListings(
  supabase: SupabaseClient,
  providerId: string,
  listings: FeedSourceListing[],
): Promise<IngestionResult> {
  const result: IngestionResult = {
    success: true,
    imported: 0,
    updated: 0,
    failed: 0,
    errors: [],
    timestamp: new Date().toISOString(),
  };

  for (const source of listings) {
    try {
      const mapped = mapToPropertyListing(source, providerId);
      const validationError = validateMappedListing(mapped);
      if (validationError) {
        result.failed++;
        result.errors.push(`Validation failed for "${source.title || source.externalId}": ${validationError}`);
        continue;
      }

      const record = {
        ...mapped,
        // Upsert key — source external id + provider
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
        result.failed++;
        result.errors.push(`Supabase upsert failed for "${source.title || source.externalId}": ${error.message}`);
      } else {
        result.imported++;
      }
    } catch (err: any) {
      result.failed++;
      result.errors.push(`Processing failed for "${source.title || source.externalId}": ${err.message}`);
    }
  }

  result.success = result.failed === 0 || result.imported > 0;
  return result;
}

/**
 * Sync a single feed configuration.
 */
export async function syncFeed(config: FeedSyncConfig): Promise<IngestionResult> {
  const supabase = getSupabaseClient();
  const result: IngestionResult = {
    success: false,
    imported: 0,
    updated: 0,
    failed: 0,
    errors: [],
    timestamp: new Date().toISOString(),
  };

  try {
    const { contentType, body } = await fetchFeed(config);
    const listings = parseFeedBody(body, contentType, config.format);

    if (listings.length === 0) {
      result.errors.push('Feed returned zero listings');
      return result;
    }

    // Get providerId from agency -> user_id mapping
    const { data: agency } = await supabase
      .from('agency_details')
      .select('user_id')
      .eq('id', config.agencyId)
      .single();

    const providerId = agency?.user_id || config.agencyId;

    const upsertResult = await upsertListings(supabase, providerId, listings);
    Object.assign(result, upsertResult);
    result.success = upsertResult.success;

    // Update last_sync_at in feed_sync_configs
    await supabase
      .from('feed_sync_configs')
      .update({ last_sync_at: new Date().toISOString(), last_sync_status: result.success ? 'success' : 'partial' })
      .eq('id', config.id);

  } catch (err: any) {
    result.failed++;
    result.errors.push(`Sync failed: ${err.message}`);
    // Mark feed as failed
    const supabase = getSupabaseClient();
    await supabase
      .from('feed_sync_configs')
      .update({ last_sync_status: 'failed' })
      .eq('id', config.id);
  }

  return result;
}

/**
 * Sync all active feeds due for sync (based on syncIntervalMinutes).
 */
export async function syncAllDueFeeds(): Promise<{ total: number; results: IngestionResult[] }> {
  const supabase = getSupabaseClient();
  const { data: feeds, error } = await supabase
    .from('feed_sync_configs')
    .select('*')
    .eq('is_active', true);

  if (error) {
    throw new Error(`Failed to load feed configs: ${error.message}`);
  }

  const dueFeeds = (feeds || []).filter((feed: any) => {
    if (!feed.last_sync_at) return true; // Never synced
    const elapsed = Date.now() - new Date(feed.last_sync_at).getTime();
    const interval = (feed.sync_interval_minutes || 1440) * 60 * 1000;
    return elapsed >= interval;
  });

  const results: IngestionResult[] = [];
  for (const feed of dueFeeds) {
    const config: FeedSyncConfig = {
      id: feed.id,
      agencyId: feed.agency_id,
      feedUrl: feed.feed_url,
      apiKey: feed.api_key || '',
      format: feed.format || 'blm',
      syncIntervalMinutes: feed.sync_interval_minutes || 1440,
      tier: feed.tier || 'standard',
      lastSyncAt: feed.last_sync_at,
      isActive: feed.is_active,
      createdAt: feed.created_at,
    };
    results.push(await syncFeed(config));
  }

  return { total: dueFeeds.length, results };
}

/**
 * Get health status for a single feed or all feeds.
 */
export async function getFeedHealth(feedId?: string): Promise<FeedHealthStatus[]> {
  const supabase = getSupabaseClient();
  let query = supabase.from('feed_sync_configs').select('*');
  if (feedId) query = query.eq('id', feedId);
  const { data: feeds, error } = await query;

  if (error) throw new Error(`Failed to load feed status: ${error.message}`);

  return (feeds || []).map((feed: any) => ({
    feedId: feed.id,
    agencyId: feed.agency_id,
    agencyName: feed.agency_name || '',
    feedUrl: feed.feed_url,
    format: feed.format || 'blm',
    tier: feed.tier || 'standard',
    lastSyncAt: feed.last_sync_at || null,
    lastSyncStatus: feed.last_sync_status || 'never',
    totalListings: feed.total_listings || 0,
    activeListings: feed.active_listings || 0,
    errors: feed.errors || [],
  }));
}
