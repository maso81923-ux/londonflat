-- ============================================================
-- LondonFlat — add feed_url to agency_details
-- So admin-saved feed URLs persist (were previously in-memory only).
-- ============================================================
alter table public.agency_details add column if not exists feed_url text;
