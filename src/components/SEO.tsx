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
}

export function SEO({ title, description, image, path, type = 'website' }: SEOProps) {
  const pageTitle = title ? `${title} | LondonFlat` : SITE_NAME;
  const desc = description || DEFAULT_DESC;
  const url = path ? `${SITE_URL}${path}` : SITE_URL;
  const ogImage = image || `${SITE_URL}/og-image.png`;

  useEffect(() => {
    // Update document title
    document.title = pageTitle;

    // Helper to set or update a meta tag
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

    // Standard meta
    setMeta('description', desc);
    setMeta('keywords', 'London flats, London rooms, London flat share, premium rentals, letting agencies London, property marketplace UK, flats to rent London');
    setMeta('og:title', pageTitle, true);
    setMeta('og:description', desc, true);
    setMeta('og:url', url, true);
    setMeta('og:image', ogImage, true);
    setMeta('og:type', type, true);
    setMeta('og:site_name', SITE_NAME, true);

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', pageTitle);
    setMeta('twitter:description', desc);
    setMeta('twitter:image', ogImage);

    // Canonical URL
    const existingLink = document.querySelector('link[rel="canonical"]');
    if (existingLink) {
      existingLink.setAttribute('href', url);
    } else {
      const link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', url);
      document.head.appendChild(link);
    }

    // Cleanup on unmount / re-render
    return () => {
      // We don't remove meta tags on cleanup — next SEO will overwrite them
    };
  }, [pageTitle, desc, url, ogImage, type]);

  return null; // This component does not render anything
}