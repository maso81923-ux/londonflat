import type { Database } from './DatabaseInterface';
import { 
  type PropertyListing, 
  type UserProfile, 
  type ViewingRequest, 
  type AgencyDetails, 
  type RequestStatus, 
  type ServiceProvider, 
  type ServiceCategory,
  type UserRole 
} from './schema';

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
    id: 'user-admin-instant',
    email: 'admin@londonflat.uk',
    full_name: 'LondonFlat Admin',
    role: 'admin',
    phone: '+44 20 7946 0001',
    avatar_url: 'https://unsplash.com',
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
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
    role: 'admin',
    phone: '+387603158020',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user-admin',
    email: 'admin@londonflat.uk',
    full_name: 'LondonFlat Admin',
    role: 'admin',
    phone: '+44 20 7946 0001',
    avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
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
    latitude: 51.498,
    longitude: -0.163,
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
    latitude: 51.527,
    longitude: -0.084,
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
    latitude: 51.543,
    longitude: -0.146,
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
    latitude: 51.520,
    longitude: -0.155,
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
    latitude: 51.482,
    longitude: -0.144,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_SERVICE_PROVIDERS: ServiceProvider[] = [
  {
    id: 'service-1',
    name: 'London Handyman Pro',
    description: 'Expert home repairs, furniture assembly, and general maintenance for London homes.',
    category: 'property-maintenance',
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
    category: 'painters-decorators',
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
    name: 'Swift Electricians Ltd',
    description: 'NICEIC certified electricians for rewiring, smart home installation, and emergency call-outs.',
    category: 'electricians',
    subcategories: ['Rewiring', 'Smart Home', 'Emergency Call-Out'],
    borough: 'Westminster',
    address: '45 Victoria Street, London SW1H 0HW',
    phone: '+44 20 7222 3344',
    email: 'bookings@swiftelectricians.co.uk',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'service-4',
    name: 'Pimlico Plumbers & Heating',
    description: 'London\'s most trusted plumbing and heating engineers serving premium properties since 1970.',
    category: 'plumbing-heating',
    subcategories: ['Plumbing', 'Boiler Installation', 'Underfloor Heating'],
    borough: 'Southwark',
    address: 'Unit 4, 45 St George Wharf, London SW8 2LE',
    phone: '+44 20 7935 7777',
    email: 'info@pimlicoplumbers.com',
    website: 'https://pimlicoplumbers.com',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'service-5',
    name: 'Sterling Notary Services',
    description: 'Professional notary public and legal documentation services in the City of London.',
    category: 'legal-notaries',
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
    id: 'service-6',
    name: 'Barclays Premier Banking — Canary Wharf',
    description: 'Premium banking and financial services for high-net-worth individuals and property buyers.',
    category: 'banking-mortgages',
    subcategories: ['Banking', 'Wealth Management', 'Mortgages'],
    borough: 'Tower Hamlets',
    address: '1 Churchill Place, Canary Wharf, E14 5HP',
    phone: '+44 20 7116 1000',
    email: 'premier.canarywharf@barclays.com',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'service-7',
    name: 'Lloyd\'s Insurance Brokers',
    description: 'Comprehensive property and landlord insurance through London\'s premier insurance market.',
    category: 'insurance-agencies',
    subcategories: ['Landlord Insurance', 'Building Cover', 'Contents Insurance'],
    borough: 'City of London',
    address: '1 Lime Street, London EC3M 7HA',
    phone: '+44 20 7327 1000',
    email: 'enquiries@lloydsbrokers.co.uk',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'service-8',
    name: 'SecureGuard Property Security',
    description: 'Manned guarding, access control systems, and physical property protection services.',
    category: 'physical-security',
    subcategories: ['Manned Guarding', 'Access Control', 'Patrol Services'],
    borough: 'Westminster',
    address: '32 Grosvenor Gardens, London SW1W 0DH',
    phone: '+44 20 7592 8800',
    email: 'ops@secureguard.co.uk',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'service-9',
    name: 'London White Glove Removals',
    description: 'Specialist removals and storage for fine art, antiques, and luxury furniture.',
    category: 'removals-transport',
    subcategories: ['Removals', 'Storage', 'Fine Art Packing'],
    borough: 'Islington',
    address: '88 Upper Street, London N1 0NP',
    phone: '+44 20 5678 9012',
    email: 'move@whitegloveremovals.london',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'service-10',
    name: 'SecureView Surveillance London',
    description: 'Advanced home security, CCTV, and smart alarm systems installation and monitoring.',
    category: 'surveillance-cctv',
    subcategories: ['CCTV Installation', 'Smart Alarms', '24/7 Monitoring'],
    borough: 'Southwark',
    address: '25 The Shard, London Bridge Street, SE1 9SG',
    phone: '+44 20 9012 3456',
    email: 'secure@viewsurveillance.co.uk',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'service-11',
    name: 'HomeCare Angels',
    description: 'Premium home care and companionship services for elderly and young residents in London.',
    category: 'child-elderly-care',
    subcategories: ['Home Care', 'Elderly Care', 'Companionship', 'Childminding'],
    borough: 'Greenwich',
    address: '5 Greenwich High Road, SE10 8NW',
    phone: '+44 20 6789 0123',
    email: 'care@homecareangels.co.uk',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'service-12',
    name: 'Sparkle Clean London',
    description: 'Eco-friendly premium cleaning services for flats and luxury residences.',
    category: 'cleaning-services',
    subcategories: ['Deep Clean', 'Eco-friendly', 'Regular Maintenance'],
    borough: 'Camden',
    address: '15 Parkway, Camden Town, NW1 7PG',
    phone: '+44 20 4321 0987',
    email: 'sparkle@cleanlondon.com',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'service-13',
    name: 'Foster + Partners Design',
    description: 'World-class architectural design and planning services for London\'s finest properties.',
    category: 'architecture-planning',
    subcategories: ['Architecture', 'Planning Permission', 'Building Regulations'],
    borough: 'Westminster',
    address: '22 Hester Road, Riverside, London SW11 4AN',
    phone: '+44 20 7738 0455',
    email: 'enquiries@fosterdesign.co.uk',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'service-14',
    name: 'Kelly Hoppen Interiors',
    description: 'Luxury interior design and home styling for premium London residences.',
    category: 'interior-design',
    subcategories: ['Interior Design', 'Space Planning', 'Home Styling'],
    borough: 'Kensington & Chelsea',
    address: '15 Elystan Place, Chelsea, London SW3 3LA',
    phone: '+44 20 7351 1100',
    email: 'studio@kellyhoppen.com',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'service-15',
    name: 'The London Gardening Company',
    description: 'Bespoke garden design and landscaping for townhouses and penthouses.',
    category: 'landscape-gardening',
    subcategories: ['Garden Design', 'Landscaping', 'Maintenance'],
    borough: 'Richmond',
    address: '48 Kew Road, Richmond, TW9 2NQ',
    phone: '+44 20 8948 7766',
    email: 'info@londongardening.co.uk',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'service-16',
    name: 'Savills Surveying',
    description: 'RICS-regulated property surveys, valuations, and building inspections across London.',
    category: 'surveying-valuations',
    subcategories: ['Property Surveys', 'Valuations', 'Building Inspections'],
    borough: 'Mayfair',
    address: '33 Margaret Street, London W1G 0JD',
    phone: '+44 20 7499 8644',
    email: 'surveying@savills.com',
    website: 'https://savills.co.uk',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'service-17',
    name: 'London Locksmiths 24/7',
    description: 'Emergency locksmith services, high-security lock installation, and key cutting.',
    category: 'locksmith-services',
    subcategories: ['Emergency Call-Out', 'Security Locks', 'Key Cutting'],
    borough: 'Camden',
    address: '200 Camden High Street, London NW1 8QP',
    phone: '+44 20 7485 9999',
    email: 'emergency@londonlocksmiths.co.uk',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'service-18',
    name: 'EnviroClear Waste Management',
    description: 'Domestic and construction waste removal with London-wide same-day service.',
    category: 'waste-removal',
    subcategories: ['Waste Clearance', 'Skip Hire', 'Recycling'],
    borough: 'Tower Hamlets',
    address: '12 Bow Road, London E3 2AD',
    phone: '+44 20 8980 1234',
    email: 'bookings@enviroclear.london',
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

export class MockDatabase implements Database {
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
      
      // Ensure admin user is always present (localStorage may have stale data from before admin was added)
      if (!this.users.find(u => u.id === 'user-admin')) {
        const adminUser = INITIAL_USERS.find(u => u.id === 'user-admin');
        if (adminUser) {
          this.users.unshift(adminUser);
          saveToStorage('users', this.users);
        }
      }
      
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
  async getCurrentUser() {
    return this.currentUser;
  }

  async login(email: string): Promise<UserProfile | null> {
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

  async logout() {
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('londonflat_current_user');
    }
  }

  async registerUser(fullName: string, email: string, role: UserRole, phone?: string): Promise<UserProfile> {
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

  async registerAgency(userId: string, companyName: string, licenseNumber: string, phone: string, officeAddress: string, website?: string): Promise<AgencyDetails> {
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

  async getAgencyByUserId(userId: string): Promise<AgencyDetails | undefined> {
    return this.agencies.find(a => a.user_id === userId);
  }

  // --- Property Listing APIs ---
  async getListings(): Promise<PropertyListing[]> {
    return [...this.listings].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getListingById(id: string): Promise<PropertyListing | undefined> {
    return this.listings.find(l => l.id === id);
  }

  async getProviderByListingId(providerId: string): Promise<{ name: string; avatar?: string; agencyName?: string; phone?: string; type: 'agency' | 'landlord' }> {
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

  async createListing(listingData: Omit<PropertyListing, 'id' | 'is_verified' | 'created_at'>): Promise<PropertyListing> {
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

  async verifyListing(id: string) {
    const listing = this.listings.find(l => l.id === id);
    if (listing) {
      listing.is_verified = true;
      saveToStorage('listings', this.listings);
    }
  }

  async deleteListing(id: string) {
    this.listings = this.listings.filter(l => l.id !== id);
    saveToStorage('listings', this.listings);
  }

  // --- Service Provider APIs ---
  async getServiceProviders(): Promise<ServiceProvider[]> {
    return this.serviceProviders;
  }

  async getServiceProvidersByCategory(category: ServiceCategory): Promise<ServiceProvider[]> {
    return this.serviceProviders.filter(s => s.category === category);
  }

  async getServiceProvidersByBorough(borough: string): Promise<ServiceProvider[]> {
    return this.serviceProviders.filter(s => s.borough.toLowerCase() === borough.toLowerCase());
  }

  // --- Viewing Request APIs ---
  async getViewingRequests(): Promise<ViewingRequest[]> {
    return this.requests;
  }

  async createViewingRequest(requestData: Omit<ViewingRequest, 'id' | 'status' | 'created_at'>): Promise<ViewingRequest> {
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

  async updateViewingRequestStatus(id: string, status: RequestStatus): Promise<void> {
    const req = this.requests.find(r => r.id === id);
    if (req) {
      req.status = status;
      saveToStorage('requests', this.requests);
    }
  }

  async getViewingRequestsForProvider(providerId: string): Promise<(ViewingRequest & { propertyTitle: string })[]> {
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

  async getViewingRequestsForSeeker(seekerId: string): Promise<(ViewingRequest & { propertyTitle: string; propertyImage: string; borough: string; price: number })[]> {
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

  // --- Admin Panel Methods ---
  private feedUrls: Record<string, string> = {};

  async getAllUsers(): Promise<UserProfile[]> {
    return this.users;
  }

  async getAllAgencies(): Promise<(AgencyDetails & { feed_url?: string; sync_status?: string })[]> {
    return this.agencies.map(a => ({
      ...a,
      feed_url: this.feedUrls[a.id] || '',
      sync_status: this.feedUrls[a.id] ? 'active' : 'inactive'
    }));
  }

  async blockUser(userId: string): Promise<void> {
    this.users = this.users.filter(u => u.id !== userId);
    this.listings = this.listings.filter(l => l.provider_id !== userId);
    this.requests = this.requests.filter(r => r.seeker_id !== userId);
    this.serviceProviders = this.serviceProviders.filter(s => s.id !== userId);
    saveToStorage('users', this.users);
    saveToStorage('listings', this.listings);
    saveToStorage('requests', this.requests);
    saveToStorage('service_providers', this.serviceProviders);
  }

  async deleteUserListings(userId: string): Promise<void> {
    this.listings = this.listings.filter(l => l.provider_id !== userId);
    saveToStorage('listings', this.listings);
  }

  async updateAgencyFeedUrl(agencyId: string, feedUrl: string): Promise<void> {
    this.feedUrls[agencyId] = feedUrl;
  }

  async importAgencyListings(agencyId: string): Promise<{ imported: number; failed: number }> {
    const agency = this.agencies.find(a => a.id === agencyId);
    if (!agency || !this.feedUrls[agencyId]) return { imported: 0, failed: 0 };
    // Simulate importing 3-5 listings from the feed
    const count = Math.floor(Math.random() * 3) + 3;
    for (let i = 0; i < count; i++) {
      this.listings.push({
        id: `listing-feed-${Date.now()}-${i}`,
        provider_id: agency.user_id,
        title: `Imported Property ${i + 1} - ${agency.company_name}`,
        description: 'Automatically imported from XML/API feed.',
        price_per_month: 1200 + Math.floor(Math.random() * 2000),
        deposit: 1500,
        address: 'London, UK',
        borough: 'Westminster',
        postcode: 'W1B',
        type: 'entire_flat',
        listing_purpose: 'rent',
        property_status: 'available',
        bedrooms: Math.floor(Math.random() * 3) + 1,
        bathrooms: Math.floor(Math.random() * 2) + 1,
        available_from: new Date().toISOString(),
        is_bills_included: false,
        amenities: ['Wifi', 'Furnished'],
        images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'],
        is_verified: true,
        created_at: new Date().toISOString()
      });
    }
    saveToStorage('listings', this.listings);
    return { imported: count, failed: 0 };
  }
}

// Export a single database instance
export const db = new MockDatabase();
export default db;
