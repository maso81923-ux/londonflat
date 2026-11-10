# Admin panel and agency feed tools

How the admin panel and the XML/API feed engine run against the RLS-protected
Supabase project (`qpmgaejnvxgrzrdxpitt`), and what each part needs.

## 1. The environment variable

| Name | Used by | Where it is set |
| --- | --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | `api/ingest.ts`, `api/sync.ts`, `api/scrape.ts` | The hosting environment (Vercel → Project → Settings → Environment Variables), as a **secret**, for Production and Preview. Never in the repo, never in client code. |

`SUPABASE_SECRET_KEY` is accepted as a fallback name if the host uses the newer
Supabase naming. `SUPABASE_URL` is optional and defaults to
`https://qpmgaejnvxgrzrdxpitt.supabase.co`.

The key is read from `process.env` **inside the request handler**
(`server/supabaseAdmin.ts` → `createServiceClient()`), so it is never bundled
into the browser build. Nothing under `src/` imports that module.

Rotating the key: change it in Supabase → Project Settings → API keys, then
update the environment variable in the host and redeploy. Nothing in the repo
changes.

## 2. What fails without it

All three endpoints **fail closed** with HTTP 503 and
`{"error": "feed ingestion not configured"}`. None of them falls back to the
publishable key — that key cannot write the protected tables any more.

- `POST /api/ingest` — 503 before anything is written.
- `GET /api/sync` — 503 before any feed is read.
- `POST /api/scrape` with `"persist": true` — 503 before anything is written.
  **Read-only scraping still works without the key**: `POST /api/scrape` without
  `persist` parses the agency's site and returns the listings it found, so an
  agency can preview a feed before it is wired up.

The public site is unaffected either way — it only ever reads through the
publishable key.

## 3. What works without it

- The whole public site: homepage, listings, borough guides, Services Hub,
  rights hub, legal pages.
- The **admin panel**, which needs no key at all (see below).
- Read-only feed preview (`/api/scrape` without `persist`).

## 4. Admin panel sign-in

The admin panel reads `user_profiles`, `agency_details`, `agency_feeds` and
`push_subscriptions` **through the admin's own login**, authorised by the admin
RLS policies in `supabase/rls-admin-policies.sql`. No secret key is involved.

To make it work:

1. Run `supabase/rls-admin-policies.sql` in Supabase → SQL Editor (after
   `supabase/rls-policies.sql`). It is idempotent.
2. Give an account `role = 'admin'`:

   ```sql
   update public.user_profiles set role = 'admin' where email = 'you@example.com';
   ```

3. Sign in on the site with that account and open the admin panel.

No account has `role = 'admin'` yet, so step 2 is required — without it the
panel is reachable but every query comes back empty (RLS returns no rows for a
non-admin).

The policies add exactly one extra path (a signed-in user whose own
`user_profiles.role = 'admin'`); every other policy is unchanged, and no
sensitive table gained a `using (true)`.

## 5. How the feed engine works

1. An agency's feed is registered as a row in `agency_feeds`
   (`agency_name`, `feed_url`, `feed_type` = `xml` | `json`, `api_key`, `tier`).
   An admin can set the feed URL from the admin panel.
2. `POST /api/ingest` — the agency pushes a feed. Auth is the `X-API-Key` header
   matched against `agency_feeds.api_key`; parsed listings are upserted into
   `feed_listings` on `(agency_id, external_id)`.
3. `GET /api/sync` — pulls every active `agency_feeds` row (or one with
   `?feed_id=<uuid>`), fetches the XML/JSON feed, upserts into `feed_listings`,
   and stamps `last_sync_at`. Suitable for a Vercel Cron Job.
4. `POST /api/scrape` — independent agencies without a feed: scrapes their own
   website, filters to Greater London postcodes, and with `"persist": true`
   registers the agency in `agency_feeds` (if new) and upserts the listings.

All writes go through the service-role client, which bypasses RLS by design.
The browser never writes these tables.
