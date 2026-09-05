/**
 * LondonFlat — Independent Agency Scraper
 *
 * POST /api/scrape
 *   body: { agency: string, url: string, sitemap?: string, limit?: number, persist?: boolean }
 *
 * Pulls active property listings DIRECTLY from an independent estate agency's
 * own public website (no portals, no third-party APIs). Discovery via sitemap.xml
 * (or list-page links), extraction via schema.org JSON-LD + OpenGraph/meta tags,
 * filtered to Greater London postcodes, deduplicated by source URL.
 *
 * Persist=true upserts into feed_listings keyed on (agency_id, external_id=source_url)
 * using the Supabase REST API, so a price/image change updates rather than duplicates.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = 'https://ffqwbtvdemoihuxbmczq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_rFuQxqMcTsb74DkaVa9NCg_Y91O37KV';

// ─── Greater London postcode filter ───────────────────────────────────────
const CORE_LONDON = ['EC', 'WC', 'E', 'N', 'NW', 'SE', 'SW', 'W'];
const OUTER_LONDON = ['BR', 'CR', 'DA', 'EN', 'HA', 'IG', 'KT', 'RM', 'SM', 'TW', 'UB', 'WD'];

function normalizePostcode(pc: string): string {
  return pc.replace(/\s+/g, '').toUpperCase();
}
function postcodeArea(pc: string): string | null {
  const m = normalizePostcode(pc).match(/^([A-Z]{1,2})\d/);
  return m ? m[1] : null;
}
function isGreaterLondon(pc: string | null | undefined): boolean {
  if (!pc) return false;
  const area = postcodeArea(pc);
  if (!area) return false;
  return CORE_LONDON.includes(area) || OUTER_LONDON.includes(area);
}
function firstPostcode(...vals: (string | null | undefined)[]): string | null {
  const re = /\b(GIR\s?0AA|[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2})\b/gi;
  for (const v of vals) {
    if (!v) continue;
    const m = String(v).match(re);
    if (m) return m[0];
  }
  return null;
}

// ─── JSON-LD extraction ───────────────────────────────────────────────────
function extractJsonLd(html: string): Record<string, any>[] {
  const out: Record<string, any>[] = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      const parsed = JSON.parse(m[1]);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      out.push(...arr);
    } catch {
      /* skip malformed */
    }
  }
  return out;
}

function metaContent(html: string, prop: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']*)["']|<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${prop}["']`,
    'i'
  );
  const m = html.match(re);
  return m ? (m[1] || m[2]) : null;
}

function ogImage(html: string): string | null {
  return metaContent(html, 'og:image') || metaContent(html, 'twitter:image');
}

function pickImages(jsonld: any, html: string): string[] {
  const imgs: string[] = [];
  const candidates: any[] = Array.isArray(jsonld.image)
    ? jsonld.image
    : jsonld.image
      ? [jsonld.image]
      : [];
  for (const c of candidates) {
    if (typeof c === 'string') imgs.push(c);
    else if (c && typeof c === 'object' && c.url) imgs.push(c.url);
  }
  const og = ogImage(html);
  if (og && !imgs.includes(og)) imgs.push(og);
  return imgs.filter((u) => u && u.startsWith('http'));
}

function pickPrice(jsonld: any, html: string): number | null {
  const val =
    jsonld?.offers?.price ??
    jsonld?.price ??
    jsonld?.priceSpecification?.price ??
    jsonld?.offers?.priceSpecification?.price ??
    metaContent(html, 'og:price:amount') ??
    metaContent(html, 'product:price:amount');
  if (val == null) return null;
  const n = parseFloat(String(val).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function pickTitle(jsonld: any, html: string): string {
  return (
    jsonld?.name ||
    jsonld?.headline ||
    metaContent(html, 'og:title') ||
    (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').trim() ||
    ''
  );
}

function pickDescription(jsonld: any, html: string): string {
  return (
    jsonld?.description ||
    metaContent(html, 'og:description') ||
    metaContent(html, 'description') ||
    ''
  );
}

function pickAddressPostcode(jsonld: any, html: string): string | null {
  const fromLd =
    jsonld?.address?.postalCode ||
    jsonld?.address?.postCode ||
    jsonld?.address?.postal_code ||
    null;
  return firstPostcode(fromLd, jsonld?.name, jsonld?.description, html);
}

// ─── Property-page detection for link discovery ───────────────────────────
const PROPERTY_HINT = /(property|properties|letting|lettings|rent|rental|for-sale|sale|flat|apartment|house|room|studio|to-let|buy)/i;

// ─── Per-listing extraction ───────────────────────────────────────────────
interface ScrapedListing {
  external_id: string;
  source_url: string;
  title: string;
  description: string;
  price: number | null;
  images: string[];
  postcode: string | null;
  borough: string | null;
  is_london: boolean;
}

function extractListing(html: string, url: string): ScrapedListing {
  const jsonlds = extractJsonLd(html);
  const types = ['RealEstateListing', 'Apartment', 'House', 'Residence', 'Product', 'Offer'];
  let ld: any = jsonlds.find((j) => {
    const t = j['@type'];
    return (Array.isArray(t) ? t : [t]).some((x: string) => types.includes(x));
  }) || jsonlds[0] || {};

  const postcode = pickAddressPostcode(ld, html);

  return {
    external_id: url,
    source_url: url,
    title: pickTitle(ld, html),
    description: pickDescription(ld, html),
    price: pickPrice(ld, html),
    images: pickImages(ld, html),
    postcode,
    borough: ld?.address?.addressLocality || ld?.address?.addressRegion || null,
    is_london: isGreaterLondon(postcode),
  };
}

// ─── Discovery ────────────────────────────────────────────────────────────
async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'user-agent': 'LondonFlatBot/1.0 (+https://www.londonflat.uk)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

async function discoverUrls(siteUrl: string, sitemapUrl?: string): Promise<string[]> {
  let xml = '';
  try {
    xml = await fetchText(sitemapUrl || new URL('/sitemap.xml', siteUrl).toString());
  } catch {
    // fall through to list-page discovery
  }
  if (xml) {
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((m) => m[1].trim());
    const props = locs.filter((u) => PROPERTY_HINT.test(u));
    if (props.length) return props;
  }
  // List-page link discovery
  const html = await fetchText(siteUrl);
  const hrefs = [...html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>/gi)].map((m) => m[1]);
  return hrefs
    .map((h) => {
      try {
        return new URL(h, siteUrl).toString();
      } catch {
        return null;
      }
    })
    .filter((u): u is string => !!u && PROPERTY_HINT.test(u));
}

// ─── Supabase persist (upsert — update on price/image change) ─────────────
async function persistListings(agencyName: string, listings: ScrapedListing[]): Promise<number> {
  let persisted = 0;
  for (const l of listings) {
    const row = {
      agency_id: agencyName,
      external_id: l.source_url,
      source: 'website-scrape',
      feed_type: 'json',
      property_data: {
        title: l.title,
        description: l.description,
        price: l.price,
        images: l.images,
        postcode: l.postcode,
        borough: l.borough,
      },
      borough: l.borough,
      price: l.price,
      images: l.images,
      status: 'available',
      last_synced_at: new Date().toISOString(),
    };
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/feed_listings`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify([row]),
      });
      if (res.ok) persisted++;
    } catch {
      /* skip */
    }
  }
  return persisted;
}

// ─── Handler ──────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  const { agency, url, sitemap, limit = 20, persist = false } = req.body || {};
  if (!agency || !url) {
    return res.status(400).json({ error: 'agency and url are required' });
  }

  try {
    const urls = (await discoverUrls(url, sitemap)).slice(0, Math.min(limit, 50));
    const listings: ScrapedListing[] = [];
    for (const u of urls) {
      try {
        const html = await fetchText(u);
        listings.push(extractListing(html, u));
      } catch {
        /* skip unreachable page */
      }
    }

    // Deduplicate by source URL (in-run)
    const seen = new Set<string>();
    const deduped = listings.filter((l) => {
      if (seen.has(l.source_url)) return false;
      seen.add(l.source_url);
      return true;
    });

    // Greater London filter
    const london = deduped.filter((l) => l.is_london);

    let persisted = 0;
    if (persist) persisted = await persistListings(agency, london);

    return res.status(200).json({
      agency,
      discovered: urls.length,
      scraped: deduped.length,
      london_count: london.length,
      persisted,
      results: london,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'scrape failed' });
  }
}
