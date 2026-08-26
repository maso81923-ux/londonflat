-- ============================================================
-- LondonFlat — XML/API Feed Ingestion Engine (persistent tables)
-- Paste this ENTIRE block into Supabase → SQL Editor → Run.
-- ============================================================

-- UUID generation (Supabase has this by default; safe to include)
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------
-- 1) agency_feeds — one row per registered agency / landlord feed
-- ------------------------------------------------------------------
create table if not exists public.agency_feeds (
  id            uuid primary key default gen_random_uuid(),
  agency_name   text not null,
  feed_url      text not null,
  feed_type     text not null default 'xml'
                  check (feed_type in ('xml', 'json')),
  api_key       text,
  tier          text not null default 'standard'
                  check (tier in ('standard', 'premium')),
  is_active     boolean not null default true,
  last_sync_at  timestamptz,
  created_at    timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- 2) feed_listings — imported property listings per feed
-- ------------------------------------------------------------------
create table if not exists public.feed_listings (
  id             uuid primary key default gen_random_uuid(),
  external_id    text not null,
  agency_id      uuid not null
                   references public.agency_feeds(id) on delete cascade,
  source         text,
  feed_type      text not null default 'xml'
                   check (feed_type in ('xml', 'json')),
  property_data  jsonb not null default '{}'::jsonb,
  status         text not null default 'available'
                   check (status in ('available', 'under_offer', 'sold', 'rented')),
  borough        text,
  price          numeric,
  bedrooms       integer,
  images         text[] default '{}',
  last_synced_at timestamptz,
  created_at     timestamptz not null default now(),

  -- Required by the engine's upsert (onConflict: 'agency_id,external_id')
  constraint feed_listings_agency_external_key unique (agency_id, external_id)
);

-- Helpful indexes for the admin dashboard
create index if not exists idx_feed_listings_agency  on public.feed_listings(agency_id);
create index if not exists idx_feed_listings_borough on public.feed_listings(borough);
create index if not exists idx_feed_listings_status  on public.feed_listings(status);

-- ------------------------------------------------------------------
-- Row Level Security
-- The app reads/writes with the anon (publishable) key from the browser.
-- For this single-operator admin tool we DISABLE RLS so the engine works
-- immediately after pasting. To harden later (multi-user), enable RLS and
-- add policies granting the appropriate role access to these tables.
-- ------------------------------------------------------------------
alter table public.agency_feeds   disable row level security;
alter table public.feed_listings  disable row level security;
