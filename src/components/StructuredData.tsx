import { useEffect } from 'react';

const SITE_URL = 'https://londonflat.uk';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface StructuredDataProps {
  type: 'BreadcrumbList' | 'Article' | 'FAQPage' | 'ItemList' | 'none';
  breadcrumbs?: BreadcrumbItem[];
  article?: {
    headline: string;
    description: string;
    datePublished: string;
    author: string;
    url: string;
  };
  faqs?: Array<{ question: string; answer: string }>;
  items?: Array<{ name: string; url: string }>;
}

export function StructuredData({ type, breadcrumbs, article, faqs, items }: StructuredDataProps) {
  useEffect(() => {
    let jsonLd = '';

    switch (type) {
      case 'BreadcrumbList':
        if (breadcrumbs && breadcrumbs.length > 0) {
          jsonLd = JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbs.map((item, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: item.name,
              item: `${SITE_URL}${item.url}`,
            })),
          });
        }
        break;

      case 'Article':
        if (article) {
          jsonLd = JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: article.headline,
            description: article.description,
            datePublished: article.datePublished,
            author: { '@type': 'Organization', name: article.author },
            publisher: {
              '@type': 'Organization',
              name: 'LondonFlat',
              url: SITE_URL,
            },
            mainEntityOfPage: { '@type': 'WebPage', '@id': article.url },
          });
        }
        break;

      case 'FAQPage':
        if (faqs && faqs.length > 0) {
          jsonLd = JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((f) => ({
              '@type': 'Question',
              name: f.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: f.answer,
              },
            })),
          });
        }
        break;

      case 'ItemList':
        if (items && items.length > 0) {
          jsonLd = JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: items.map((item, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              url: `${SITE_URL}${item.url}`,
              name: item.name,
            })),
          });
        }
        break;
    }

    if (jsonLd) {
      const scriptId = `ld-json-${type.toLowerCase()}`;
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = scriptId;
        document.head.appendChild(script);
      }
      script.textContent = jsonLd;
    }

    return () => {
      const scriptId = `ld-json-${type.toLowerCase()}`;
      const script = document.getElementById(scriptId);
      if (script) script.remove();
    };
  }, [type, JSON.stringify(breadcrumbs), JSON.stringify(article), JSON.stringify(faqs), JSON.stringify(items)]);

  return null;
}
