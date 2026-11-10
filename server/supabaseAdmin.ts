/**
 * Server-side Supabase access for the feed ingestion engine.
 *
 * SERVER ONLY. This module is imported exclusively by the Vercel functions in
 * /api — never by anything under /src that the browser bundle pulls in. The key
 * is read from process.env at call time, so it is never inlined into client
 * code and never committed to the repo.
 *
 * The service-role key bypasses Row Level Security, which is why the ingestion
 * engine can write feed_listings / agency_feeds while the browser cannot.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://qpmgaejnvxgrzrdxpitt.supabase.co';

/** Message returned when the server key has not been configured. */
export const NOT_CONFIGURED_MESSAGE = 'feed ingestion not configured';

export const NOT_CONFIGURED_DETAIL =
  'Set SUPABASE_SERVICE_ROLE_KEY in the hosting environment (Vercel → Settings → ' +
  'Environment Variables) to enable feed ingestion. It is never committed to the repo.';

/**
 * The service-role key, or null when the environment does not define it.
 * SUPABASE_SERVICE_ROLE_KEY is the documented name; SUPABASE_SECRET_KEY is
 * accepted as a fallback for hosts that use the newer naming.
 */
export function getServiceRoleKey(): string | null {
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    '';
  const trimmed = key.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function isIngestionConfigured(): boolean {
  return getServiceRoleKey() !== null;
}

/**
 * Create a service-role client. Call this INSIDE a request handler, never at
 * module scope, so the key is resolved per invocation and the module stays
 * safe to import.
 *
 * Returns null when the key is absent — callers must then fail closed with a
 * 503 and must not fall back to the publishable key.
 */
export function createServiceClient(): SupabaseClient | null {
  const key = getServiceRoleKey();
  if (!key) return null;

  const url = (process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL).trim();

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
