-- ============================================================================
-- LondonFlat — Row Level Security remediation
-- Supabase project: londonflat (ffqwbtvdemoihuxbmczq)
--
-- WHY THIS EXISTS
--   Supabase raised two CRITICAL advisories on 31 Oct 2026:
--     * rls_disabled_in_public      — every public table was readable/writable
--                                     with the publishable (anon) key that is
--                                     shipped in the browser bundle.
--     * sensitive_columns_exposed   — user_profiles.email/phone/full_name,
--                                     viewing_requests.seeker_email/phone/name
--                                     and push_subscriptions.endpoint/keys were
--                                     world-readable, and the same key could
--                                     PATCH/DELETE those rows.
--
--   Root cause: supabase/migrations/002_full_schema.sql explicitly ran
--     alter table ... disable row level security;
--   so that the browser (anon/publishable) key could read and write directly.
--
-- WHAT THIS SCRIPT DOES
--   Enables RLS on all 8 tables and grants the minimum the live site needs.
--   It is POLICY-ONLY: no row data is inserted, updated or deleted, and no
--   existing table/column is altered. The 198 service_providers rows, the 8
--   property_listings rows and the 2 agency_details rows stay exactly as they
--   are.
--
--   Safe to run more than once (every CREATE POLICY is preceded by
--   DROP POLICY IF EXISTS).
--
-- HOW TO RUN
--   Supabase dashboard -> project "londonflat" -> SQL Editor -> New query ->
--   paste this whole file -> Run. Then re-read the VERIFY section at the end.
--
-- ACCESS MATRIX (summary)
--   table               anon SELECT  anon INSERT  anon UPDATE/DELETE  authenticated
--   service_providers   YES (public)  no           no                 own agency r/w
--   property_listings   YES (public)  no           no                 own listings r/w
--   feed_listings       YES (public)  no           no                 agency sync r/w
--   agency_details      no (view)     no           no                 own row r/w
--   agency_feeds        no            no           no                 own feed r/w
--   user_profiles       no            no           no                 own row r/w
--   viewing_requests    no            YES          no                 seeker/landlord read
--   push_subscriptions  no            YES          no                 service role only
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- 0. Make sure the roles exist and the tables are reachable by PostgREST.
--    (Supabase projects always have anon/authenticated; this is a no-op there.)
-- ----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

-- ============================================================================
-- 1. service_providers — the public Services Hub (19 categories, 198 rows)
--    Public site: ServicesPage.tsx -> db.getServiceProviders*() -> anon SELECT.
--    Writes belong to the agency that owns the slot.
-- ============================================================================
alter table public.service_providers enable row level security;

-- Serves the public Services Hub page: anyone may read provider business info.
drop policy if exists service_providers_public_read on public.service_providers;
create policy service_providers_public_read
  on public.service_providers
  for select
  to anon, authenticated
  using (true);

-- Serves a signed-in agency adding a new provider listing to its own slot.
drop policy if exists service_providers_agency_insert on public.service_providers;
create policy service_providers_agency_insert
  on public.service_providers
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.agency_details a
      where a.id = service_providers.agency_id
        and a.user_id = auth.uid()::text
    )
  );

-- Serves a signed-in agency editing a provider it owns.
drop policy if exists service_providers_agency_update on public.service_providers;
create policy service_providers_agency_update
  on public.service_providers
  for update
  to authenticated
  using (
    exists (
      select 1 from public.agency_details a
      where a.id = service_providers.agency_id
        and a.user_id = auth.uid()::text
    )
  )
  with check (
    exists (
      select 1 from public.agency_details a
      where a.id = service_providers.agency_id
        and a.user_id = auth.uid()::text
    )
  );

-- Serves a signed-in agency removing a provider it owns.
drop policy if exists service_providers_agency_delete on public.service_providers;
create policy service_providers_agency_delete
  on public.service_providers
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.agency_details a
      where a.id = service_providers.agency_id
        and a.user_id = auth.uid()::text
    )
  );

-- ============================================================================
-- 2. property_listings — the marketplace inventory (8 rows)
--    Public site: ListingsPage / HomePage / ListingDetailsPage -> anon SELECT.
--    Writes belong to the provider who published the listing.
-- ============================================================================
alter table public.property_listings enable row level security;

-- Serves the public listings grid, homepage featured flats and detail pages.
drop policy if exists property_listings_public_read on public.property_listings;
create policy property_listings_public_read
  on public.property_listings
  for select
  to anon, authenticated
  using (true);

-- Serves a signed-in landlord/agency publishing a listing of its own.
drop policy if exists property_listings_owner_insert on public.property_listings;
create policy property_listings_owner_insert
  on public.property_listings
  for insert
  to authenticated
  with check (provider_id = auth.uid()::text);

-- Serves a signed-in provider editing its own listing.
drop policy if exists property_listings_owner_update on public.property_listings;
create policy property_listings_owner_update
  on public.property_listings
  for update
  to authenticated
  using (provider_id = auth.uid()::text)
  with check (provider_id = auth.uid()::text);

-- Serves a signed-in provider withdrawing its own listing.
drop policy if exists property_listings_owner_delete on public.property_listings;
create policy property_listings_owner_delete
  on public.property_listings
  for delete
  to authenticated
  using (provider_id = auth.uid()::text);

-- ============================================================================
-- 3. feed_listings — syndicated XML/API inventory (currently 0 rows)
--    Public site reads it alongside property_listings.
--    NOTE: api/scrape.ts currently upserts into this table with the PUBLISHABLE
--    key. That path now fails (insert-only is not granted to anon). It is an
--    internal ingestion endpoint, not a public page: move it to a server-side
--    secret key before using /api/scrape?persist=true again. See the report.
-- ============================================================================
alter table public.feed_listings enable row level security;

-- Serves the public listings grid for syndicated agency inventory.
drop policy if exists feed_listings_public_read on public.feed_listings;
create policy feed_listings_public_read
  on public.feed_listings
  for select
  to anon, authenticated
  using (true);

-- Serves the feed ingestion engine writing syndicated rows (admin/agency sync).
drop policy if exists feed_listings_engine_insert on public.feed_listings;
create policy feed_listings_engine_insert
  on public.feed_listings
  for insert
  to authenticated
  with check (true);

-- Serves the feed ingestion engine refreshing an existing syndicated row.
drop policy if exists feed_listings_engine_update on public.feed_listings;
create policy feed_listings_engine_update
  on public.feed_listings
  for update
  to authenticated
  using (true)
  with check (true);

-- Serves the feed ingestion engine pruning rows that left the agency feed.
drop policy if exists feed_listings_engine_delete on public.feed_listings;
create policy feed_listings_engine_delete
  on public.feed_listings
  for delete
  to authenticated
  using (true);

-- ============================================================================
-- 4. agency_feeds — registered feeds. HOLDS api_key: never exposed to anon.
--    Only the agency that owns the feed (matched on company_name) may read it.
-- ============================================================================
alter table public.agency_feeds enable row level security;

-- Serves the agency dashboard showing that agency its own feed URL + sync time.
drop policy if exists agency_feeds_owner_read on public.agency_feeds;
create policy agency_feeds_owner_read
  on public.agency_feeds
  for select
  to authenticated
  using (
    exists (
      select 1 from public.agency_details a
      where a.company_name = agency_feeds.agency_name
        and a.user_id = auth.uid()::text
    )
  );

-- Serves an agency registering its own XML/API feed.
drop policy if exists agency_feeds_owner_insert on public.agency_feeds;
create policy agency_feeds_owner_insert
  on public.agency_feeds
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.agency_details a
      where a.company_name = agency_feeds.agency_name
        and a.user_id = auth.uid()::text
    )
  );

-- Serves an agency changing its own feed URL / marking a sync.
drop policy if exists agency_feeds_owner_update on public.agency_feeds;
create policy agency_feeds_owner_update
  on public.agency_feeds
  for update
  to authenticated
  using (
    exists (
      select 1 from public.agency_details a
      where a.company_name = agency_feeds.agency_name
        and a.user_id = auth.uid()::text
    )
  )
  with check (
    exists (
      select 1 from public.agency_details a
      where a.company_name = agency_feeds.agency_name
        and a.user_id = auth.uid()::text
    )
  );

-- ============================================================================
-- 5. agency_details — agency business profile (2 rows)
--    No anon access: it carries user_id (the account it belongs to). The public
--    listing page reads the safe columns through public_agency_directory below.
-- ============================================================================
alter table public.agency_details enable row level security;

-- Serves the signed-in agency viewing its own business profile.
drop policy if exists agency_details_owner_read on public.agency_details;
create policy agency_details_owner_read
  on public.agency_details
  for select
  to authenticated
  using (user_id = auth.uid()::text);

-- Serves agency registration creating its own profile row.
drop policy if exists agency_details_owner_insert on public.agency_details;
create policy agency_details_owner_insert
  on public.agency_details
  for insert
  to authenticated
  with check (user_id = auth.uid()::text);

-- Serves the signed-in agency editing its own business profile.
drop policy if exists agency_details_owner_update on public.agency_details;
create policy agency_details_owner_update
  on public.agency_details
  for update
  to authenticated
  using (user_id = auth.uid()::text)
  with check (user_id = auth.uid()::text);

-- ============================================================================
-- 6. user_profiles — PII (email, full_name, phone). Never readable by anon.
--    A user may only read and edit their own row.
-- ============================================================================
alter table public.user_profiles enable row level security;

-- Serves the signed-in user loading their own profile (getCurrentUser).
drop policy if exists user_profiles_self_read on public.user_profiles;
create policy user_profiles_self_read
  on public.user_profiles
  for select
  to authenticated
  using (id = auth.uid()::text);

-- Serves registration creating the profile row for the new account.
drop policy if exists user_profiles_self_insert on public.user_profiles;
create policy user_profiles_self_insert
  on public.user_profiles
  for insert
  to authenticated
  with check (id = auth.uid()::text);

-- Serves the signed-in user editing their own profile.
drop policy if exists user_profiles_self_update on public.user_profiles;
create policy user_profiles_self_update
  on public.user_profiles
  for update
  to authenticated
  using (id = auth.uid()::text)
  with check (id = auth.uid()::text);

-- Serves UK GDPR erasure: a user deleting their own profile.
drop policy if exists user_profiles_self_delete on public.user_profiles;
create policy user_profiles_self_delete
  on public.user_profiles
  for delete
  to authenticated
  using (id = auth.uid()::text);

-- ============================================================================
-- 7. viewing_requests — PII (seeker_name, seeker_email, seeker_phone, message)
--    A visitor must be able to SUBMIT one, and must never be able to READ one.
-- ============================================================================
alter table public.viewing_requests enable row level security;

-- Serves the "Request a viewing" form on ListingDetailsPage: insert only.
-- No SELECT policy is granted to anon, so a submitter cannot read it back and
-- cannot read anybody else's request.
drop policy if exists viewing_requests_public_insert on public.viewing_requests;
create policy viewing_requests_public_insert
  on public.viewing_requests
  for insert
  to anon, authenticated
  with check (true);

-- Serves a signed-in seeker reading their own requests (dashboard).
drop policy if exists viewing_requests_seeker_read on public.viewing_requests;
create policy viewing_requests_seeker_read
  on public.viewing_requests
  for select
  to authenticated
  using (seeker_id = auth.uid()::text);

-- Serves a signed-in provider reading requests made against its own listings.
drop policy if exists viewing_requests_provider_read on public.viewing_requests;
create policy viewing_requests_provider_read
  on public.viewing_requests
  for select
  to authenticated
  using (
    exists (
      select 1 from public.property_listings p
      where p.id = viewing_requests.listing_id
        and p.provider_id = auth.uid()::text
    )
  );

-- Serves a signed-in provider confirming/cancelling a request on its listing.
drop policy if exists viewing_requests_provider_update on public.viewing_requests;
create policy viewing_requests_provider_update
  on public.viewing_requests
  for update
  to authenticated
  using (
    exists (
      select 1 from public.property_listings p
      where p.id = viewing_requests.listing_id
        and p.provider_id = auth.uid()::text
    )
  )
  with check (
    exists (
      select 1 from public.property_listings p
      where p.id = viewing_requests.listing_id
        and p.provider_id = auth.uid()::text
    )
  );

-- ============================================================================
-- 8. push_subscriptions — holds endpoint + keys (push credentials).
--    A browser may register its own subscription; nothing may read them back
--    except the server-side secret key (service role bypasses RLS).
-- ============================================================================
alter table public.push_subscriptions enable row level security;

-- Serves PushNotificationManager registering this browser's subscription.
-- Insert only: no SELECT policy exists for anon, so subscriptions cannot be
-- enumerated or read back.
drop policy if exists push_subscriptions_public_insert on public.push_subscriptions;
create policy push_subscriptions_public_insert
  on public.push_subscriptions
  for insert
  to anon, authenticated
  with check (true);

-- ============================================================================
-- 9. Public read views for the two tables anon may no longer touch directly.
--    They expose only business-safe columns (no email, no phone of a private
--    landlord, no user_id, no api_key) and are owned by the table owner, so
--    they bypass the table RLS by design.
--    They change no data; the app can adopt them when it is ready (the current
--    browser code still queries the base tables and degrades gracefully).
-- ============================================================================

-- Serves the "let by / listed by" block on a public listing detail page.
create or replace view public.public_provider_profiles as
  select id, full_name, avatar_url, role, created_at
  from public.user_profiles;

-- Serves the agency name / business contact block on a public listing page.
create or replace view public.public_agency_directory as
  select id, company_name, logo_url, phone, website, office_address, is_verified, created_at
  from public.agency_details;

revoke all on public.public_provider_profiles from anon, authenticated;
revoke all on public.public_agency_directory  from anon, authenticated;
grant select on public.public_provider_profiles to anon, authenticated;
grant select on public.public_agency_directory  to anon, authenticated;

commit;

-- ============================================================================
-- VERIFY — run these after the script has committed.
-- ============================================================================

-- 1. Every table should report rowsecurity = true (8 rows expected).
-- select tablename, rowsecurity from pg_tables
--  where schemaname = 'public'
--    and tablename in ('push_subscriptions','service_providers','viewing_requests',
--                      'feed_listings','user_profiles','property_listings',
--                      'agency_feeds','agency_details')
--  order by tablename;

-- 2. Every policy this script created (should be 26 rows).
-- select tablename, policyname, cmd, roles from pg_policies
--  where schemaname = 'public' order by tablename, policyname;

-- 3. From a shell, with the PUBLISHABLE key only (must now fail or be empty):
--    curl -s -o /dev/null -w '%{http_code}\n' \
--      "https://ffqwbtvdemoihuxbmczq.supabase.co/rest/v1/user_profiles?select=email&limit=3" \
--      -H "apikey: <PUBLISHABLE_KEY>" -H "Authorization: Bearer <PUBLISHABLE_KEY>"
--    expect: [] (HTTP 200) — zero rows, never a list of emails.
--
-- 4. Same key, public reads must still work:
--    /rest/v1/service_providers?select=id,name&limit=3   -> rows (198 available)
--    /rest/v1/property_listings?select=id,title&limit=3  -> rows (8 available)
