import type { PropertyListing, UserProfile, ViewingRequest, AgencyDetails, RequestStatus, ServiceProvider, ServiceCategory } from './schema';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

// Static Mock Users
const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-apex',
    email: 'info@apexlettings.co.uk',
    full_name: 'Arthur Pendelton (Apex Lettings)',
    role: 'agency',
    phone: '+44 20 7946 0192',
    avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user-prestige',
    email: 'contact@prestigeproperties.com',
    full_name: 'Elena Rostova (Prestige Properties)',
    role: 'agency',
    phone: '+44 20 7946 0855',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    created_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user-sarah',
    email: 'sarah.j@gmail.com',
    full_name: 'Sarah Jenkins',
    role: 'landlord',
    phone: '+44 7700 900077',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    created_at: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user-seeker',
    email: 'alex.flatseeker@gmail.com',
    full_name: 'Alex Mercer',
    role: 'seeker',
    phone: '+44 7700 900543',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Static Mock Agencies
const INITIAL_AGENCIES: AgencyDetails[] = [
  {
    id: 'agency-apex',
    user_id: 'user-apex',
    company_name: 'Apex London Living',
    logo_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=150&q=80',
    license_number: 'LN/2021/08492',
    phone: '+44 20 7946 0192',
    office_address: '14 Berkeley Square, Mayfair, London, W1J 6ER',
    website: 'https://apex-london-flat.uk',
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    is_verified: true
  },
  {
    id: 'agency-prestige',
    user_id: 'user-prestige',
    company_name: 'Prestige Properties London',
    logo_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=150&q=80',
    license_number: 'LN/2019/33104',
    phone: '+44 20 7946 0855',
    office_address: '88 Canary Wharf Tower, London, E14 5AA',
    website: 'https://prestige-londonflat.uk',
    created_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
    is_verified: true
  }
];

// Static Mock Property Listings
const INITIAL_LISTINGS: PropertyListing[] = [
  {
    id: 'listing-1',
    provider_id: 'user-apex',
    title: 'Luxury Double Room in Knightsbridge Duplex Flat',
    description: 'A spectacular, spacious double bedroom available in an executive duplex apartment in the heart of Knightsbridge. This premium property features a high-end shared marble kitchen, underfloor heating, and a private balcony overlooking quiet residential gardens. Only a 3-minute walk to Harrods and Knightsbridge Station. Sharing with two quiet, respectful finance professionals.',
    price_per_month: 1650,
    deposit: 1900,
    address: '22 Hans Place, Knightsbridge',
    borough: 'Kensington & Chelsea',
    postcode: 'SW1X 0EP',
    type: 'room',
    listing_purpose: 'rent',
    property_status: 'available',
    bedrooms: 3,
    bathrooms: 2,
    available_from: '2025-07-01',
    is_bills_included: true,
    amenities: ['Superfast Wifi', 'Underfloor Heating', 'Weekly Cleaner', '24/7 Concierge', 'Balcony', 'Washing Machine'],
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80'
    ],
    is_verified: true,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'listing-2',
    provider_id: 'user-prestige',
    title: 'Sleek Modern 1-Bedroom Apartment in Shoreditch',
    description: 'This ultra-modern 1-bedroom flat in a boutique development offers the pinnacle of Shoreditch living. Features floor-to-ceiling industrial-style windows, exposed brickwork, custom integrated kitchen appliances, and private secure bike storage. Exceptionally quiet while being steps away from the trendiest bars, cafes, and Old Street Station (Northern Line).',
    price_per_month: 2400,
    deposit: 2400,
    address: '88 Tabernacle Street, Shoreditch',
    borough: 'Hackney',
    postcode: 'EC2A 4AA',
    type: 'entire_flat',
    listing_purpose: 'rent',
    property_status: 'available',
    bedrooms: 1,
    bathrooms: 1,
    available_from: '2025-06-25',
    is_bills_included: false,
    amenities: ['Integrated Kitchen', 'Secure Bike Storage', 'Hyperoptic Broadband', 'Dishwasher', 'Roof Terrace Access'],
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502005229762-fc1b2b812ca5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672012214-27dccd68155b?auto=format&fit=crop&w=800&q=80'
    ],
    is_verified: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'listing-3',
    provider_id: 'user-sarah',
    title: 'Elegant Double Ensuite Room near Camden Lock',
    description: 'Beautiful double ensuite room in a large, bright private Victorian terrace home. Quietly situated on a lovely tree-lined street just behind Camden Market. You will share this clean, premium home with me (the homeowner, an interior designer) and one very small, well-behaved hypo-allergenic poodle. Bills are all-inclusive, and includes professional deep-cleaning of shared spaces fortnightly.',
    price_per_month: 1100,
    deposit: 1100,
    address: '14 Hartland Road, Camden Lock',
    borough: 'Camden',
    postcode: 'NW1 8DJ',
    type: 'room',
    listing_purpose: 'rent',
    property_status: 'available',
    bedrooms: 2,
    bathrooms: 2,
    available_from: '2025-07-15',
    is_bills_included: true,
    amenities: ['Private Ensuite', 'All Bills Included', 'Fortnightly Cleaner', 'Victorian Fireplace', 'Private Garden Patio', 'Fiber Wifi'],
    images: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
    ],
    is_verified: true,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'listing-sale-1',
    provider_id: 'user-apex',
    title: 'Luxury 3-Bedroom Penthouse in Marylebone',
    description: 'An exquisite 3-bedroom penthouse offering unparalleled views of the London skyline. This brand-new residence features bespoke finishes, a private terrace, and access to 5-star residential amenities.',
    price: 3850000,
    deposit: 0,
    address: '42 Chiltern Street, Marylebone',
    borough: 'Westminster',
    postcode: 'W1U 7PR',
    type: 'entire_flat',
    listing_purpose: 'sale',
    property_status: 'available',
    bedrooms: 3,
    bathrooms: 3.5,
    available_from: '2025-06-01',
    is_bills_included: false,
    amenities: ['Private Terrace', '24/7 Concierge', 'Valet Parking', 'Resident Gym', 'Climate Control'],
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'
    ],
    is_verified: true,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'listing-sale-2',
    provider_id: 'user-prestige',
    title: 'Modern 2-Bedroom Apartment in Battersea Power Station',
    description: 'Live in an icon. This stunning 2-bedroom apartment in the historic Battersea Power Station development offers modern luxury with historic charm.',
    price: 1450000,
    deposit: 0,
    address: 'Circus West Village, Battersea',
    borough: 'Wandsworth',
    postcode: 'SW11 8EZ',
    type: 'entire_flat',
    listing_purpose: 'sale',
    property_status: 'under_offer',
    bedrooms: 2,
    bathrooms: 2,
    available_from: '2025-07-01',
    is_bills_included: false,
    amenities: ['River Views', 'Roof Garden', 'Underfloor Heating', 'On-site Cinema', '24-hour Security'],
    images: [
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80'
    ],
    is_verified: true,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_SERVICE_PROVIDERS: ServiceProvider[] = [
  {
    id: 'service-1',
    name: 'London Handyman Pro',
    description: 'Expert home repairs, furniture assembly, and general maintenance for London homes.',
    category: 'maintenance-tradesmen',
    subcategories: ['Handyman', 'Repairs', 'Assembly'],
    borough: 'Hackney',
    address: '123 Mare Street, London E8 3RH',
    phone: '+44 20 8123 4567',
    email: 'hello@londonhandyman.pro',
    website: 'https://londonhandyman.pro',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'service-2',
    name: 'Elite Painters & Decorators',
    description: 'High-end interior and exterior painting and decorating services for premium properties.',
    category: 'maintenance-tradesmen',
    subcategories: ['Painting', 'Decorating', 'Wallpapering'],
    borough: 'Kensington & Chelsea',
    address: '45 King\'s Road, Chelsea, SW3 4UD',
    phone: '+44 20 7987 6543',
    email: 'info@elitepainters.london',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'service-3',
    name: 'Sterling Notary Services',
    description: 'Professional notary public and legal documentation services in the City of London.',
    category: 'legal-financial',
    subcategories: ['Notary', 'Legal Docs', 'Apostille'],
    borough: 'City of London',
    address: '10 St Paul\'s Churchyard, EC4M 8AL',
    phone: '+44 20 3456 7890',
    email: 'contact@sterlingnotary.co.uk',
    website: 'https://sterlingnotary.co.uk',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'service-4',
    name: 'Barclays Premier Banking — Canary Wharf',
    description: 'Premium banking and financial services for high-net-worth individuals.',
    category: 'legal-financial',
    subcategories: ['Banking', 'Wealth Management', 'Mortgages'],
    borough: 'Tower Hamlets',
    address: '1 Churchill Place, Canary Wharf, E14 5HP',
    phone: '+44 20 7116 1000',
    email: 'premier.canarywharf@barclays.com',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'service-5',
    name: 'London White Glove Removals',
    description: 'Specialist removals and storage for fine art, antiques, and luxury furniture.',
    category: 'logistics-daily-life',
    subcategories: ['Removals', 'Storage', 'Fine Art Packing'],
    borough: 'Islington',
    address: '88 Upper Street, London N1 0NP',
    phone: '+44 20 5678 9012',
    email: 'move@whitegloveremovals.london',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'service-6',
    name: 'Sparkle Clean London',
    description: 'Eco-friendly premium cleaning services for flats and luxury residences.',
    category: 'logistics-daily-life',
    subcategories: ['Cleaning', 'Eco-friendly', 'Deep Clean'],
    borough: 'Camden',
    address: '15 Parkway, Camden Town, NW1 7PG',
    phone: '+44 20 4321 0987',
    email: 'sparkle@cleanlondon.com',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'service-7',
    name: 'SecureView Surveillance London',
    description: 'Advanced home security, CCTV, and smart alarm systems installation and monitoring.',
    category: 'safety-care',
    subcategories: ['Security', 'CCTV', 'Smart Alarms'],
    borough: 'Southwark',
    address: '25 The Shard, London Bridge Street, SE1 9SG',
    phone: '+44 20 9012 3456',
    email: 'secure@viewsurveillance.co.uk',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'service-8',
    name: 'HomeCare Angels',
    description: 'Premium home care and companionship services for elderly residents in London.',
    category: 'safety-care',
    subcategories: ['Home Care', 'Elderly Care', 'Companionship'],
    borough: 'Greenwich',
    address: '5 Greenwich High Road, SE10 8NW',
    phone: '+44 20 6789 0123',
    email: 'care@homecareangels.co.uk',
    is_verified: true,
    created_at: new Date().toISOString()
  }
];

const INITIAL_REQUESTS: ViewingRequest[] = [
  {
    id: 'req-1',
    listing_id: 'listing-1',
    seeker_id: 'user-seeker',
    seeker_name: 'Alex Mercer',
    seeker_email: 'alex.flatseeker@gmail.com',
    seeker_phone: '+44 7700 900543',
    preferred_date: '2025-06-20',
    preferred_time: '14:30',
    message: 'Hello, I am a tech consultant moving to London from New York. Your knightsbridge room looks absolutely stunning. I would love to schedule a viewing!',
    status: 'pending',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Initialize database in localStorage
const loadFromStorage = <T>(key: string, defaults: T): T => {
  if (typeof window === 'undefined') return defaults;
  const data = localStorage.getItem(`londonflat_${key}`);
  if (!data) {
    localStorage.setItem(`londonflat_${key}`, JSON.stringify(defaults));
    return defaults;
  }
  return JSON.parse(data);
};

const saveToStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`londonflat_${key}`, JSON.stringify(value));
};

export class MockDatabase {
  private users: UserProfile[] = [];
  private agencies: AgencyDetails[] = [];
  private listings: PropertyListing[] = [];
  private requests: ViewingRequest[] = [];
  private serviceProviders: ServiceProvider[] = [];
  private currentUser: UserProfile | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.users = loadFromStorage('users', INITIAL_USERS);
      this.agencies = loadFromStorage('agencies', INITIAL_AGENCIES);
      this.listings = loadFromStorage('listings', INITIAL_LISTINGS);
      this.requests = loadFromStorage('requests', INITIAL_REQUESTS);
      this.serviceProviders = loadFromStorage('service_providers', INITIAL_SERVICE_PROVIDERS);
      
      const loggedIn = localStorage.getItem('londonflat_current_user');
      if (loggedIn) {
        this.currentUser = JSON.parse(loggedIn);
      }
    } else {
      this.users = INITIAL_USERS;
      this.agencies = INITIAL_AGENCIES;
      this.listings = INITIAL_LISTINGS;
      this.requests = INITIAL_REQUESTS;
      this.serviceProviders = INITIAL_SERVICE_PROVIDERS;
    }
  }

  // --- Auth APIs ---
  getCurrentUser() {
    return this.currentUser;
  }

  login(email: string): UserProfile | null {
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      this.currentUser = user;
      if (typeof window !== 'undefined') {
        localStorage.setItem('londonflat_current_user', JSON.stringify(user));
      }
      return user;
    }
    return null;
  }

  logout() {
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('londonflat_current_user');
    }
  }

  registerUser(fullName: string, email: string, role: 'seeker' | 'agency' | 'landlord', phone?: string): UserProfile {
    // Check duplicate
    const existing = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('User with this email already exists.');
    }

    const newUser: UserProfile = {
      id: `user-${generateId()}`,
      email,
      full_name: fullName,
      role,
      phone,
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
      created_at: new Date().toISOString()
    };

    this.users.push(newUser);
    saveToStorage('users', this.users);

    this.currentUser = newUser;
    if (typeof window !== 'undefined') {
      localStorage.setItem('londonflat_current_user', JSON.stringify(newUser));
    }

    return newUser;
  }

  registerAgency(userId: string, companyName: string, licenseNumber: string, phone: string, officeAddress: string, website?: string): AgencyDetails {
    const newAgency: AgencyDetails = {
      id: `agency-${generateId()}`,
      user_id: userId,
      company_name: companyName,
      logo_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(companyName)}`,
      license_number: licenseNumber,
      phone,
      office_address: officeAddress,
      website,
      created_at: new Date().toISOString(),
      is_verified: true // Auto-verified for premium feel in mock environment
    };

    this.agencies.push(newAgency);
    saveToStorage('agencies', this.agencies);
    return newAgency;
  }

  getAgencyByUserId(userId: string): AgencyDetails | undefined {
    return this.agencies.find(a => a.user_id === userId);
  }

  // --- Property Listing APIs ---
  getListings(): PropertyListing[] {
    return [...this.listings].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  getListingById(id: string): PropertyListing | undefined {
    return this.listings.find(l => l.id === id);
  }

  getProviderByListingId(providerId: string): { name: string; avatar?: string; agencyName?: string; phone?: string; type: 'agency' | 'landlord' } {
    const user = this.users.find(u => u.id === providerId);
    if (!user) {
      return { name: 'Unknown Landlord', type: 'landlord' };
    }

    if (user.role === 'agency') {
      const agency = this.agencies.find(a => a.user_id === providerId);
      return {
        name: user.full_name,
        avatar: user.avatar_url,
        agencyName: agency?.company_name || 'Premium Agency Partner',
        phone: agency?.phone || user.phone,
        type: 'agency'
      };
    }

    return {
      name: user.full_name,
      avatar: user.avatar_url,
      phone: user.phone,
      type: 'landlord'
    };
  }

  createListing(listingData: Omit<PropertyListing, 'id' | 'is_verified' | 'created_at'>): PropertyListing {
    const newListing: PropertyListing = {
      ...listingData,
      id: `listing-${generateId()}`,
      is_verified: false, // Default to false, can be upgraded via fee
      created_at: new Date().toISOString()
    };

    this.listings.push(newListing);
    saveToStorage('listings', this.listings);
    return newListing;
  }

  verifyListing(id: string) {
    const listing = this.listings.find(l => l.id === id);
    if (listing) {
      listing.is_verified = true;
      saveToStorage('listings', this.listings);
    }
  }

  deleteListing(id: string) {
    this.listings = this.listings.filter(l => l.id !== id);
    saveToStorage('listings', this.listings);
  }

  // --- Service Provider APIs ---
  getServiceProviders(): ServiceProvider[] {
    return this.serviceProviders;
  }

  getServiceProvidersByCategory(category: ServiceCategory): ServiceProvider[] {
    return this.serviceProviders.filter(s => s.category === category);
  }

  getServiceProvidersByBorough(borough: string): ServiceProvider[] {
    return this.serviceProviders.filter(s => s.borough.toLowerCase() === borough.toLowerCase());
  }

  // --- Viewing Request APIs ---
  getViewingRequests(): ViewingRequest[] {
    return this.requests;
  }

  createViewingRequest(requestData: Omit<ViewingRequest, 'id' | 'status' | 'created_at'>): ViewingRequest {
    const newRequest: ViewingRequest = {
      ...requestData,
      id: `req-${generateId()}`,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    this.requests.push(newRequest);
    saveToStorage('requests', this.requests);
    return newRequest;
  }

  updateViewingRequestStatus(id: string, status: RequestStatus): void {
    const req = this.requests.find(r => r.id === id);
    if (req) {
      req.status = status;
      saveToStorage('requests', this.requests);
    }
  }

  getViewingRequestsForProvider(providerId: string): (ViewingRequest & { propertyTitle: string })[] {
    // 1. Find all properties owned by this provider
    const providerListingIds = this.listings
      .filter(l => l.provider_id === providerId)
      .map(l => l.id);

    // 2. Filter requests belonging to these properties
    return this.requests
      .filter(r => providerListingIds.includes(r.listing_id))
      .map(r => {
        const listing = this.listings.find(l => l.id === r.listing_id);
        return {
          ...r,
          propertyTitle: listing?.title || 'Unknown Property'
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  getViewingRequestsForSeeker(seekerId: string): (ViewingRequest & { propertyTitle: string; propertyImage: string; borough: string; price: number })[] {
    return this.requests
      .filter(r => r.seeker_id === seekerId)
      .map(r => {
        const listing = this.listings.find(l => l.id === r.listing_id);
        return {
          ...r,
          propertyTitle: listing?.title || 'Unknown Property',
          propertyImage: listing?.images[0] || '',
          borough: listing?.borough || '',
          price: listing?.listing_purpose === 'sale' ? (listing?.price || 0) : (listing?.price_per_month || 0)
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
}

// Export a single database instance
export const db = new MockDatabase();
export default db;
