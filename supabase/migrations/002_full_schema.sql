-- ============================================================
-- LondonFlat — COMPLETE Supabase schema (all missing tables)
-- Paste this ENTIRE block into Supabase → SQL Editor → Run.
-- Creates the 7 tables the previous team never made.
-- ============================================================

create extension if not exists "pgcrypto";

-- 1) Agencies / estate agents (business profile)
create table if not exists public.agency_details (
  id             text primary key default gen_random_uuid()::text,
  user_id        text,
  company_name   text not null,
  logo_url       text,
  license_number text,
  phone          text,
  office_address text,
  website        text,
  created_at     timestamptz default now(),
  is_verified    boolean default false
);

-- 2) Registered XML/API agency feeds (the feed engine)
create table if not exists public.agency_feeds (
  id            text primary key default gen_random_uuid()::text,
  agency_name   text not null,
  feed_url      text not null,
  feed_type     text not null default 'xml' check (feed_type in ('xml','json')),
  api_key       text,
  tier          text not null default 'standard' check (tier in ('standard','premium')),
  is_active     boolean not null default true,
  last_sync_at  timestamptz,
  created_at    timestamptz not null default now()
);

-- 3) Property listings (the marketplace inventory)
create table if not exists public.property_listings (
  id               text primary key default gen_random_uuid()::text,
  provider_id      text,
  title            text not null,
  description      text,
  price_per_month  numeric,
  price            numeric,
  deposit          numeric,
  address          text,
  borough          text,
  postcode         text,
  type             text check (type in ('room','entire_flat')),
  listing_purpose  text check (listing_purpose in ('rent','sale','buy')),
  property_status  text default 'available' check (property_status in ('available','under_offer','sold','rented')),
  bedrooms         integer,
  bathrooms        integer,
  available_from   text,
  is_bills_included boolean default false,
  amenities        text[] default '{}',
  images           text[] default '{}',
  is_verified      boolean default false,
  latitude         double precision,
  longitude        double precision,
  created_at       timestamptz not null default now()
);

-- 4) Imported listings from agency feeds
create table if not exists public.feed_listings (
  id             text primary key default gen_random_uuid()::text,
  external_id    text not null,
  agency_id      text not null,
  source         text,
  feed_type      text not null default 'xml' check (feed_type in ('xml','json')),
  property_data  jsonb not null default '{}'::jsonb,
  status         text not null default 'available' check (status in ('available','under_offer','sold','rented')),
  borough        text,
  price          numeric,
  bedrooms       integer,
  images         text[] default '{}',
  last_synced_at timestamptz,
  created_at     timestamptz not null default now(),
  constraint feed_listings_agency_external_key unique (agency_id, external_id)
);

-- 5) Services Hub providers (20 lifecycle categories)
create table if not exists public.service_providers (
  id           text primary key default gen_random_uuid()::text,
  name         text not null,
  description  text,
  category     text,
  subcategories text[] default '{}',
  borough      text,
  address      text,
  phone        text,
  email        text,
  website      text,
  logo_url     text,
  is_verified  boolean default false,
  agency_id    text,
  created_at   timestamptz not null default now()
);

-- 6) Viewing / enquiry requests
create table if not exists public.viewing_requests (
  id             text primary key default gen_random_uuid()::text,
  listing_id     text,
  seeker_id      text,
  seeker_name    text,
  seeker_email   text,
  seeker_phone   text,
  preferred_date text,
  preferred_time text,
  message        text,
  status         text default 'pending' check (status in ('pending','confirmed','cancelled')),
  created_at     timestamptz not null default now()
);

-- 7) Web push subscriptions (secondary feature)
create table if not exists public.push_subscriptions (
  endpoint        text primary key,
  keys            jsonb default '{}'::jsonb,
  expiration_time timestamptz,
  created_at      timestamptz not null default now()
);

-- Indexes for the admin dashboard
create index if not exists idx_property_listings_borough on public.property_listings(borough);
create index if not exists idx_property_listings_status  on public.property_listings(property_status);
create index if not exists idx_feed_listings_agency       on public.feed_listings(agency_id);
create index if not exists idx_feed_listings_borough      on public.feed_listings(borough);
create index if not exists idx_service_providers_category on public.service_providers(category);

-- ============================================================
-- Row Level Security: DISABLED so the app's browser (anon/publishable)
-- key can read/write immediately. Re-enable + add policies before
-- opening this to multi-user production.
-- ============================================================
alter table public.agency_details      disable row level security;
alter table public.agency_feeds        disable row level security;
alter table public.property_listings   disable row level security;
alter table public.feed_listings       disable row level security;
alter table public.service_providers   disable row level security;
alter table public.viewing_requests    disable row level security;
alter table public.push_subscriptions  disable row level security;
