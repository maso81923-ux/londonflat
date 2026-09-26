/**
 * XML Feed Parser
 * Supports BLM standard, Rightmove V3, Jupix export, and Reapit RPS feed formats.
 * Uses a lightweight regex-based XML tag extractor (no external deps for serverless).
 */

import type { FeedSourceListing, FeedFormat } from './types';

/**
 * Detect feed format from root element / namespace hints in raw XML.
 */
export function detectXmlFormat(xml: string): FeedFormat {
  const lower = xml.toLowerCase();
  if (lower.includes('rightmove') || lower.includes('<oversea') || lower.includes('rightmoveadf')) {
    return 'rightmove-v3';
  }
  if (lower.includes('jupix') || lower.includes('<jupix')) {
    return 'jupix';
  }
  if (lower.includes('reapit') || lower.includes('<rps') || lower.includes('reapit-rps')) {
    return 'reapit-rps';
  }
  if (lower.includes('<blm') || lower.includes('blm') || lower.includes('<property>')) {
    return 'blm';
  }
  return 'blm';
}

/**
 * Extract a single named tag's inner text (first match).
 */
function extractTag(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = xml.match(re);
  if (!m) return '';
  return decodeXmlEntities(m[1].trim());
}

/**
 * Extract all occurrences of a tag's inner text.
 */
function extractTags(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
  const results: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    results.push(decodeXmlEntities(m[1].trim()));
  }
  return results;
}

/**
 * Extract an attribute value from the first matching tag.
 */
function extractAttr(xml: string, tag: string, attr: string): string {
  const re = new RegExp(`<${tag}[^>]*\\b${attr}\\s*=\\s*["']([^"']*)["']`, 'i');
  const m = xml.match(re);
  return m ? m[1] : '';
}

function decodeXmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
}

function toNumber(v: string): number {
  const n = parseFloat(v.replace(/[^0-9.\-]/g, ''));
  return isNaN(n) ? 0 : n;
}

function toBool(v: string): boolean {
  const s = v.trim().toLowerCase();
  return s === 'true' || s === 'yes' || s === '1' || s === 'y';
}

/**
 * Split raw XML into individual property blocks (BLM/Rightmove style `<property>` elements).
 */
function splitPropertyBlocks(xml: string): string[] {
  const blocks: string[] = [];
  const re = /<property[\s>][\s\S]*?<\/property>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    blocks.push(m[0]);
  }
  // Fallback: if no <property> blocks, treat whole XML as one record (single-property feeds)
  if (blocks.length === 0) {
    const single = /<(?:property|listing|unit)[\s>][\s\S]*/i.exec(xml);
    blocks.push(single ? single[0] : xml);
  }
  return blocks;
}

/**
 * Parse BLM standard XML into FeedSourceListing[].
 */
function parseBlm(xml: string): FeedSourceListing[] {
  return splitPropertyBlocks(xml).map((block, i) => {
    const agentRef = extractTag(block, 'agent_ref') || extractTag(block, 'reference');
    const typeRaw = extractTag(block, 'type') || extractTag(block, 'property_type') || 'flat';
    return {
      externalId: extractTag(block, 'property_id') || extractTag(block, 'id') || `blm-${i}-${agentRef}`,
      title: extractTag(block, 'title') || extractTag(block, 'summary'),
      description: extractTag(block, 'description') || extractTag(block, 'details'),
      price: toNumber(extractTag(block, 'price') || extractTag(block, 'rent') || extractTag(block, 'price_per_month')),
      priceType: (extractTag(block, 'price_type') as any) || 'pcm',
      deposit: toNumber(extractTag(block, 'deposit')),
      addressLine1: extractTag(block, 'address_1') || extractTag(block, 'address_line1'),
      addressLine2: extractTag(block, 'address_2') || extractTag(block, 'address_line2'),
      city: extractTag(block, 'town') || extractTag(block, 'city'),
      borough: extractTag(block, 'borough'),
      postcode: extractTag(block, 'postcode') || extractTag(block, 'post_code'),
      propertyType: typeRaw,
      bedrooms: toNumber(extractTag(block, 'bedrooms') || extractTag(block, 'beds')),
      bathrooms: toNumber(extractTag(block, 'bathrooms') || extractTag(block, 'baths')),
      availableDate: extractTag(block, 'available_date') || extractTag(block, 'available'),
      billsIncluded: toBool(extractTag(block, 'bills_included')),
      features: extractTags(block, 'feature').filter(Boolean),
      images: extractTags(block, 'image').filter(Boolean).map(u => u.replace(/^url=/i, '')),
      latitude: toNumber(extractTag(block, 'latitude') || extractTag(block, 'lat')),
      longitude: toNumber(extractTag(block, 'longitude') || extractTag(block, 'lng')),
      status: extractTag(block, 'status') || 'available',
      agencyRef: agentRef,
      agencyName: extractTag(block, 'agent_name') || extractTag(block, 'agency_name'),
      agencyPhone: extractTag(block, 'agent_phone') || extractTag(block, 'agency_phone'),
      agencyEmail: extractTag(block, 'agent_email') || extractTag(block, 'agency_email'),
      agencyLogo: extractTag(block, 'agent_logo') || extractTag(block, 'agency_logo'),
      _sourceFormat: 'blm',
      _rawData: block,
    };
  });
}

/**
 * Parse Rightmove V3 (Rightmove ADF) XML.
 * Rightmove uses `<property>` blocks with `<price>` in pcm and a distinctive field set.
 */
function parseRightmove(xml: string): FeedSourceListing[] {
  return splitPropertyBlocks(xml).map((block, i) => {
    const agentRef = extractTag(block, 'agent_ref') || extractTag(block, 'reference');
    return {
      externalId: extractTag(block, 'agent_ref') || extractTag(block, 'property_id') || `rm-${i}`,
      title: extractTag(block, 'title') || extractTag(block, 'summary_description'),
      description: extractTag(block, 'description') || extractTag(block, 'full_description'),
      price: toNumber(extractTag(block, 'price') || extractTag(block, 'rent')),
      priceType: (extractTag(block, 'price_frequency') === 'per_month' ? 'pcm' : 'pcm') as any,
      deposit: toNumber(extractTag(block, 'deposit')),
      addressLine1: extractTag(block, 'address_1') || extractTag(block, 'address_line_1'),
      addressLine2: extractTag(block, 'address_2') || extractTag(block, 'address_line_2'),
      city: extractTag(block, 'town') || extractTag(block, 'city'),
      borough: extractTag(block, 'borough'),
      postcode: extractTag(block, 'postcode') || extractTag(block, 'postcode_1'),
      propertyType: extractTag(block, 'property_type') || 'flat',
      bedrooms: toNumber(extractTag(block, 'bedrooms')),
      bathrooms: toNumber(extractTag(block, 'bathrooms')),
      availableDate: extractTag(block, 'available_date') || extractTag(block, 'let_available_date'),
      billsIncluded: toBool(extractTag(block, 'bills_included')),
      features: extractTags(block, 'feature').filter(Boolean),
      images: extractTags(block, 'image').filter(Boolean).map(u => u.replace(/^url=/i, '')),
      latitude: toNumber(extractTag(block, 'latitude')),
      longitude: toNumber(extractTag(block, 'longitude')),
      status: extractTag(block, 'status') || 'available',
      agencyRef: agentRef,
      agencyName: extractTag(block, 'agent_name'),
      agencyPhone: extractTag(block, 'agent_phone'),
      agencyEmail: extractTag(block, 'agent_email'),
      agencyLogo: extractTag(block, 'agent_logo'),
      _sourceFormat: 'rightmove-v3',
      _rawData: block,
    };
  });
}

/**
 * Parse Jupix export XML.
 * Jupix uses `<Property>` blocks with `<RentalPrice>` / `<SalePrice>`.
 */
function parseJupix(xml: string): FeedSourceListing[] {
  // Jupix blocks may use <Property> (capital P)
  const re = /<Property[\s>][\s\S]*?<\/Property>/gi;
  const blocks: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) blocks.push(m[0]);
  if (blocks.length === 0) blocks.push(xml);

  return blocks.map((block, i) => {
    const rentRaw = extractTag(block, 'RentalPrice') || extractTag(block, 'rent');
    const saleRaw = extractTag(block, 'SalePrice') || extractTag(block, 'price');
    const price = rentRaw ? toNumber(rentRaw) : toNumber(saleRaw);
    const priceType = (rentRaw ? 'pcm' : 'sale_price') as any;
    return {
      externalId: extractTag(block, 'PropertyId') || extractTag(block, 'id') || `jupix-${i}`,
      title: extractTag(block, 'Title') || extractTag(block, 'Address1'),
      description: extractTag(block, 'Description') || extractTag(block, 'Details'),
      price,
      priceType,
      deposit: toNumber(extractTag(block, 'Deposit')),
      addressLine1: extractTag(block, 'Address1') || extractTag(block, 'address_line1'),
      addressLine2: extractTag(block, 'Address2') || extractTag(block, 'address_line2'),
      city: extractTag(block, 'Town') || extractTag(block, 'city'),
      borough: extractTag(block, 'Borough') || extractTag(block, 'borough'),
      postcode: extractTag(block, 'Postcode') || extractTag(block, 'post_code'),
      propertyType: extractTag(block, 'PropertyType') || extractTag(block, 'type') || 'flat',
      bedrooms: toNumber(extractTag(block, 'Bedrooms')),
      bathrooms: toNumber(extractTag(block, 'Bathrooms')),
      availableDate: extractTag(block, 'AvailableDate') || extractTag(block, 'available'),
      billsIncluded: toBool(extractTag(block, 'BillsIncluded')),
      features: extractTags(block, 'Feature').filter(Boolean),
      images: extractTags(block, 'Image').filter(Boolean).map(u => u.replace(/^url=/i, '')),
      latitude: toNumber(extractTag(block, 'Latitude')),
      longitude: toNumber(extractTag(block, 'Longitude')),
      status: extractTag(block, 'Status') || 'available',
      agencyRef: extractTag(block, 'Reference') || extractTag(block, 'agent_ref'),
      agencyName: extractTag(block, 'AgentName') || extractTag(block, 'agency_name'),
      agencyPhone: extractTag(block, 'AgentPhone'),
      agencyEmail: extractTag(block, 'AgentEmail'),
      agencyLogo: extractTag(block, 'AgentLogo'),
      _sourceFormat: 'jupix',
      _rawData: block,
    };
  });
}

/**
 * Parse Reapit RPS XML.
 * Reapit uses `<Property>` blocks with `<Price>`, `<Area>`, `<Town>` etc.
 */
function parseReapit(xml: string): FeedSourceListing[] {
  return splitPropertyBlocks(xml).map((block, i) => {
    const rentRaw = extractTag(block, 'Rent') || extractTag(block, 'rent');
    const saleRaw = extractTag(block, 'Price') || extractTag(block, 'price');
    const price = rentRaw ? toNumber(rentRaw) : toNumber(saleRaw);
    const priceType = (rentRaw ? 'pcm' : 'sale_price') as any;
    return {
      externalId: extractTag(block, 'Reference') || extractTag(block, 'id') || `reapit-${i}`,
      title: extractTag(block, 'Summary') || extractTag(block, 'Address1'),
      description: extractTag(block, 'Description') || extractTag(block, 'FullDescription'),
      price,
      priceType,
      deposit: toNumber(extractTag(block, 'Deposit')),
      addressLine1: extractTag(block, 'Address1') || extractTag(block, 'address_line1'),
      addressLine2: extractTag(block, 'Address2') || extractTag(block, 'address_line2'),
      city: extractTag(block, 'Town') || extractTag(block, 'city'),
      borough: extractTag(block, 'Borough') || extractTag(block, 'borough'),
      postcode: extractTag(block, 'Postcode') || extractTag(block, 'post_code'),
      propertyType: extractTag(block, 'PropertyType') || extractTag(block, 'type') || 'flat',
      bedrooms: toNumber(extractTag(block, 'Bedrooms')),
      bathrooms: toNumber(extractTag(block, 'Bathrooms')),
      availableDate: extractTag(block, 'AvailableDate') || extractTag(block, 'available'),
      billsIncluded: toBool(extractTag(block, 'BillsIncluded')),
      features: extractTags(block, 'Feature').filter(Boolean),
      images: extractTags(block, 'Image').filter(Boolean).map(u => u.replace(/^url=/i, '')),
      latitude: toNumber(extractTag(block, 'Latitude')),
      longitude: toNumber(extractTag(block, 'Longitude')),
      status: extractTag(block, 'Status') || 'available',
      agencyRef: extractTag(block, 'Reference'),
      agencyName: extractTag(block, 'AgentName') || extractTag(block, 'agency_name'),
      agencyPhone: extractTag(block, 'AgentPhone'),
      agencyEmail: extractTag(block, 'AgentEmail'),
      agencyLogo: extractTag(block, 'AgentLogo'),
      _sourceFormat: 'reapit-rps',
      _rawData: block,
    };
  });
}

/**
 * Parse any XML feed — auto-detects format.
 */
export function parseXmlFeed(xml: string, formatOverride?: FeedFormat): FeedSourceListing[] {
  const format = formatOverride || detectXmlFormat(xml);
  switch (format) {
    case 'rightmove-v3':
      return parseRightmove(xml);
    case 'jupix':
      return parseJupix(xml);
    case 'reapit-rps':
      return parseReapit(xml);
    case 'blm':
    default:
      return parseBlm(xml);
  }
}
