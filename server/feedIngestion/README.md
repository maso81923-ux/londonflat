# Feed Ingestion Engine

Automated property feed ingestion for LondonFlat's Agency XML/API Feed Subscription
(Standard £1,500/mo — daily sync; Premium £2,500/mo — real-time sync).

## Architecture

```
server/feedIngestion/          # Core ingestion logic (Node/serverless runtime)
  ├── types.ts                 # FeedFormat, FeedSyncConfig, FeedSourceListing, helpers
  ├── fieldMapper.ts           # FeedSourceListing → PropertyListing + validation
  ├── xmlParser.ts             # BLM, Rightmove V3, Jupix, Reapit RPS XML parsing
  ├── jsonParser.ts            # Homedata & generic JSON parsing
  └── syncEngine.ts            # Polling, parsing orchestration, Supabase upserts

api/                           # Vercel serverless endpoints
  ├── ingest.ts                # POST /api/ingest — push feed payloads (API key auth)
  ├── ingest/status.ts         # GET  /api/ingest/status — feed health monitoring
  └── sync.ts                  # GET/POST /api/sync — cron-triggered polling of due feeds

supabase/migrations/           # SQL schema
  └── 20260803_feed_ingestion.sql   # feed_sync_configs, feed_api_keys, feed_sync_logs
```

## Supported Feed Formats

| Format        | Detection            | Key fields                                            |
|---------------|----------------------|-------------------------------------------------------|
| `blm`         | default / `<property>` | BLM standard: `<price>`, `<bedrooms>`, `<feature>`  |
| `rightmove-v3`| `rightmove` in root  | Rightmove ADF: `<agent_ref>`, `<price_frequency>`    |
| `jupix`       | `jupix` in root      | `<Property>` blocks, `<RentalPrice>`/`<SalePrice>`   |
| `reapit-rps`  | `reapit`/`<rps`      | `<Reference>`, `<Rent>`/`<Price>`, `<Town>`          |
| `homedata-json` | JSON content-type  | Homedata REST: `property_id`, `price_type`           |
| `generic-json`  | JSON content-type  | Generic: `{ properties: [...] }` / `{ data: [...] }` |

## API Endpoints

### POST /api/ingest
Push a feed payload (raw XML or JSON) to import listings immediately.

```
Authorization: Api-Key <KEY>   # or X-API-Key: <KEY>
Content-Type: application/xml | application/json

Body: XML string, JSON object, or JSON array
```

Response: `{ success, imported, failed, errors[], timestamp }`

### GET /api/ingest/status?feedId=&agencyId=
Returns per-feed health: last sync time, status, listing counts, errors.

### GET /api/sync
Poll all feeds due for sync (Standard daily / Premium every 15 min).
Protected by `CRON_SECRET` env var (`Authorization: Bearer <CRON_SECRET>`).

**Vercel Cron schedule** (recommended, set in Vercel dashboard):
- `0 3 * * *` → daily Standard-tier sync
- `*/15 * * * *` → Premium-tier real-time sync

## Auth Model

`Authorization: Api-Key <KEY>` (owner requirement) — the ingest endpoint validates
the key against the `feed_api_keys` table. Each key is bound to an `agency_id`.

## Field Mapping

`fieldMapper.ts` normalizes all source formats into the canonical `PropertyListing`
shape: rent/sale price split (`price_per_month` vs `price`), borough normalization,
property type (`room` vs `entire_flat`), and status mapping.

## Environment Variables

| Var | Purpose |
|-----|---------|
| `VITE_SUPABASE_URL` / `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_SERVICE_KEY` | Service role key (server-side) |
| `CRON_SECRET` | Secret protecting the `/api/sync` cron endpoint |
