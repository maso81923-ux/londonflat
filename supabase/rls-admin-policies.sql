-- ============================================================================
-- LondonFlat — admin read policies (restores the admin panel under RLS)
--
-- Project: qpmgaejnvxgrzrdxpitt
-- Run this ENTIRE block in Supabase → SQL Editor → Run, after
-- supabase/rls-policies.sql. It is idempotent: safe to run again.
--
-- WHY: the admin panel reads user_profiles, agency_details, agency_feeds and
-- push_subscriptions from the browser with the signed-in admin's own session.
-- rls-policies.sql correctly denies those reads to everyone except the row
-- owner, so the panel came back empty. These policies add ONE more permissive
-- path: a signed-in user whose own user_profiles.role = 'admin'. Nothing is
-- loosened for anyone else — no `using (true)` on any of these tables, and the
-- existing owner policies are untouched.
--
-- The service-role key is NOT needed for the admin panel: it reads through the
-- admin's own login. (Feed ingestion still uses the server-side key — see
-- docs/feed-and-admin.md.)
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- is_admin() — role lookup for the current session
--
-- A policy ON user_profiles that queries user_profiles would recurse
-- ("infinite recursion detected in policy for relation user_profiles").
-- A SECURITY DEFINER function is evaluated as its owner (postgres, which owns
-- the table), so it reads the role without re-entering the policy.
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_profiles p
    where p.id = auth.uid()::text
      and p.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;

comment on function public.is_admin() is
  'True when the signed-in user is an admin. Used by the admin RLS policies; SECURITY DEFINER so it does not recurse through user_profiles RLS.';

-- ----------------------------------------------------------------------------
-- 1. user_profiles — admin panel user list (getAllUsers)
-- ----------------------------------------------------------------------------
drop policy if exists user_profiles_admin_read on public.user_profiles;
create policy user_profiles_admin_read
  on public.user_profiles
  for select
  to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- 2. agency_details — admin panel agency list (getAllAgencies)
-- ----------------------------------------------------------------------------
drop policy if exists agency_details_admin_read on public.agency_details;
create policy agency_details_admin_read
  on public.agency_details
  for select
  to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- 3. agency_feeds — admin feed management (getAgencyFeeds)
--    Read plus register/edit: an admin wires up an agency's feed URL from the
--    panel (updateAgencyFeedUrl). Holds api_key, so this stays admin-only.
-- ----------------------------------------------------------------------------
drop policy if exists agency_feeds_admin_read on public.agency_feeds;
create policy agency_feeds_admin_read
  on public.agency_feeds
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists agency_feeds_admin_insert on public.agency_feeds;
create policy agency_feeds_admin_insert
  on public.agency_feeds
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists agency_feeds_admin_update on public.agency_feeds;
create policy agency_feeds_admin_update
  on public.agency_feeds
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- 4. push_subscriptions — admin panel subscription list (getPushSubscriptions)
--    Read only: endpoints and keys stay writeable by the browser that owns
--    them (push_subscriptions_public_insert), and readable by admins only.
-- ----------------------------------------------------------------------------
drop policy if exists push_subscriptions_admin_read on public.push_subscriptions;
create policy push_subscriptions_admin_read
  on public.push_subscriptions
  for select
  to authenticated
  using (public.is_admin());

commit;

-- ============================================================================
-- VERIFY — run after the block above has committed.
-- ============================================================================

-- 1. The function exists and is SECURITY DEFINER (prosecdef must be true).
select proname, prosecdef, proconfig
from pg_proc
where pronamespace = 'public'::regnamespace
  and proname = 'is_admin';

-- 2. The six admin policies exist (6 rows expected).
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and policyname like '%\_admin\_%'
order by tablename, policyname;

-- 3. RLS is still on for every table (8 rows, all rowsecurity = true).
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;

-- 4. From a shell, with the PUBLISHABLE key only, these must still be empty
--    (proves the policies did not open anything to anon):
--      curl "https://qpmgaejnvxgrzrdxpitt.supabase.co/rest/v1/user_profiles?select=id" \
--        -H "apikey: <publishable key>" -H "Authorization: Bearer <publishable key>"
--    -> []

-- ============================================================================
-- ONE MORE STEP — the panel needs an admin account to sign in with.
-- No row in user_profiles has role = 'admin' yet. Either promote an existing
-- account or create one, then sign in with it:
--
--   update public.user_profiles set role = 'admin' where email = 'you@example.com';
--
-- (If the account does not exist yet, register it through the site's sign-up,
-- then run the update. Confirm with:)
--
--   select id, email, role from public.user_profiles where role = 'admin';
-- ============================================================================
