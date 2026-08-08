import { useEffect } from 'react';

const SITE_NAME = 'LondonFlat — Premium London Living';
const SITE_URL = 'https://londonflat.uk';
const DEFAULT_DESC = 'The premier marketplace for high-performance real estate and flat-sharing in Greater London. Find verified premium flats, rooms, and apartments from trusted letting agencies and private landlords.';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
  type?: 'website' | 'article' | 'product';
  keywords?: string;
  publishedTime?: string;
  author?: string;
}

// Page-specific keyword sets
const KEYWORD_SETS: Record<string, string> = {
  home: 'London flats, London rooms, London flat share, premium rentals, letting agencies London, property marketplace UK, flats to rent London, London property',
  listings: 'London flats to rent, rooms to rent London, London property for sale, premium London apartments, flat share London, letting agents London',
  services: 'London property services, London handyman, London solicitors property, London removals, London locksmith, London cleaning services, London electrician',
  'moving-checklist': 'London moving checklist, moving house London tips, London removals guide, moving out checklist UK',
  'borough-guide': 'London area guide, London property prices by borough, London renting guide, London neighbourhood guide',
  rights: 'tenant rights UK, section 21 eviction, section 8 notice, deposit protection UK, landlord repair obligations, HMO licensing London, rent increase rules',
};

export function SEO({ title, description, image, path, type = 'website', keywords, publishedTime, author }: SEOProps) {
  const pageTitle = title ? `${title} | LondonFlat` : SITE_NAME;
  const desc = description || DEFAULT_DESC;
  const url = path ? `${SITE_URL}${path}` : SITE_URL;
  const ogImage = image || `${SITE_URL}/og-image.png`;

  useEffect(() => {
    document.title = pageTitle;

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const removeMeta = (name: string, property = false) => {
      const attr = property ? 'property' : 'name';
      const el = document.querySelector(`meta[${attr}="${name}"]`);
      if (el) el.remove();
    };

    // Standard meta
    setMeta('description', desc);

    // Page-specific or default keywords
    const kw = keywords || KEYWORD_SETS[type] || KEYWORD_SETS.home;
    setMeta('keywords', kw);

    // Open Graph
    setMeta('og:title', pageTitle, true);
    setMeta('og:description', desc, true);
    setMeta('og:url', url, true);
    setMeta('og:image', ogImage, true);
    setMeta('og:type', type, true);
    setMeta('og:site_name', SITE_NAME, true);
    if (publishedTime && type === 'article') {
      setMeta('og:article:published_time', publishedTime, true);
    }

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', pageTitle);
    setMeta('twitter:description', desc);
    setMeta('twitter:image', ogImage);

    // Canonical URL
    let existingLink = document.querySelector('link[rel="canonical"]');
    if (existingLink) {
      existingLink.setAttribute('href', url);
    } else {
      const link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', url);
      document.head.appendChild(link);
    }

    // Article-specific metadata
    if (type === 'article') {
      if (publishedTime) {
        setMeta('article:published_time', publishedTime);
      }
      if (author) {
        const authorLink = document.querySelector('link[rel="author"]');
        if (!authorLink) {
          const link = document.createElement('link');
          link.setAttribute('rel', 'author');
          link.setAttribute('href', author);
          document.head.appendChild(link);
        }
      }
    } else {
      removeMeta('article:published_time');
    }
  }, [pageTitle, desc, url, ogImage, type, keywords, publishedTime, author]);

  return null;
}
