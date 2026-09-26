-- Feed Ingestion Engine — Database Schema
-- Creates tables for feed-sourced listings, sync configs, and API keys.

-- 1. Extend property_listings with feed source tracking columns
ALTER TABLE property_listings
  ADD COLUMN IF NOT EXISTS external_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS feed_source TEXT,
  ADD COLUMN IF NOT EXISTS source_external_id TEXT,
  ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_property_listings_external_id ON property_listings (external_id);
CREATE INDEX IF NOT EXISTS idx_property_listings_feed_source ON property_listings (feed_source);

-- 2. Feed sync configurations (one per agency feed subscription)
CREATE TABLE IF NOT EXISTS feed_sync_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agency_details (id) ON DELETE CASCADE,
  agency_name TEXT,
  feed_url TEXT NOT NULL,
  api_key TEXT,
  format TEXT NOT NULL DEFAULT 'blm', -- blm | rightmove-v3 | jupix | reapit-rps | homedata-json | generic-json
  sync_interval_minutes INTEGER NOT NULL DEFAULT 1440, -- Standard: daily (1440), Premium: 15
  tier TEXT NOT NULL DEFAULT 'standard', -- standard | premium
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  last_sync_status TEXT, -- success | partial | failed | never
  total_listings INTEGER NOT NULL DEFAULT 0,
  active_listings INTEGER NOT NULL DEFAULT 0,
  errors JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feed_sync_configs_agency ON feed_sync_configs (agency_id);
CREATE INDEX IF NOT EXISTS idx_feed_sync_configs_active ON feed_sync_configs (is_active, last_sync_at);

-- 3. Feed API keys (for ingest endpoint authentication)
CREATE TABLE IF NOT EXISTS feed_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  agency_id UUID NOT NULL REFERENCES agency_details (id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'standard', -- standard | premium
  default_format TEXT NOT NULL DEFAULT 'blm',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feed_api_keys_agency ON feed_api_keys (agency_id);
CREATE INDEX IF NOT EXISTS idx_feed_api_keys_key ON feed_api_keys (key);

-- 4. Feed sync logs (audit trail)
CREATE TABLE IF NOT EXISTS feed_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_config_id UUID REFERENCES feed_sync_configs (id) ON DELETE CASCADE,
  agency_id UUID,
  status TEXT NOT NULL, -- success | partial | failed
  imported_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  error_messages JSONB,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_feed_sync_logs_feed ON feed_sync_logs (feed_config_id);
CREATE INDEX IF NOT EXISTS idx_feed_sync_logs_started ON feed_sync_logs (started_at);
