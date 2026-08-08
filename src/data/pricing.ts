// Pricing products matching the three-pillar revenue model
export interface PricingProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  pillar: 'api-feed' | 'services-hub' | 'placement';
  category?: string;
}

export const API_FEED_PRODUCTS: PricingProduct[] = [
  {
    id: 'api-standard',
    name: 'Standard API License',
    description: 'Automated XML/API feed integration for complete property portfolio synchronisation. Per branch, per month.',
    price: 1500,
    currency: 'GBP',
    interval: 'month',
    pillar: 'api-feed',
  },
  {
    id: 'api-premium',
    name: 'Premium API License',
    description: 'Unlimited automated feed updates + prioritised system indexing within target London Boroughs. Per branch, per month.',
    price: 2500,
    currency: 'GBP',
    interval: 'month',
    pillar: 'api-feed',
  },
];

export const SERVICES_HUB_PRODUCTS: PricingProduct[] = [
  {
    id: 'hub-high-ticket',
    name: 'High-Ticket Category Subscription',
    description: 'Legal & Notaries, Banking & Mortgages, Architecture & Planning, Independent Estate Agents, Surveying & Valuations, Legal Eviction & Case Handling, Interior Design.',
    price: 1200,
    currency: 'GBP',
    interval: 'month',
    pillar: 'services-hub',
    category: 'high-ticket',
  },
  {
    id: 'hub-high-frequency',
    name: 'High-Frequency Category Subscription',
    description: 'Property Maintenance, Painters & Decorators, Electricians, Plumbing & Heating, Physical Property Security, Removals & Transport, Home Surveillance & CCTV, Child & Elderly Care, Cleaning Services, Locksmith Services, Waste Removal, Landscape Gardening.',
    price: 650,
    currency: 'GBP',
    interval: 'month',
    pillar: 'services-hub',
    category: 'high-frequency',
  },
];

export const PLACEMENT_PRODUCTS: PricingProduct[] = [
  {
    id: 'placement-header',
    name: 'Main Platform Header (Krovna Domena)',
    description: 'Exclusive global visual banner placement across primary gateway entry points.',
    price: 4500,
    currency: 'GBP',
    interval: 'month',
    pillar: 'placement',
  },
  {
    id: 'placement-borough',
    name: 'Targeted Borough Sponsorship',
    description: 'Exclusive dedicated industry placement locked to a specific London Borough.',
    price: 1200,
    currency: 'GBP',
    interval: 'month',
    pillar: 'placement',
  },
];

export const ALL_PRODUCTS = [
  ...API_FEED_PRODUCTS,
  ...SERVICES_HUB_PRODUCTS,
  ...PLACEMENT_PRODUCTS,
];
