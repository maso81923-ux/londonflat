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
import { parseAndValidateFeed, transformProperty, parseFeedUrl } from './feedParser';

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
  // 1. Property Maintenance & Handyman Services
  {
    id: 'service-1',
    name: 'London Handyman Pro',
    description: 'Expert home repairs, furniture assembly, and general maintenance for London homes. 24/7 emergency call-out available.',
    category: 'property-maintenance',
    subcategories: ['Handyman', 'Repairs', 'Assembly', 'Emergency'],
    borough: 'Hackney',
    address: '123 Mare Street, London E8 3RH',
    phone: '+44 20 8123 4567',
    email: 'hello@londonhandyman.pro',
    website: 'https://londonhandyman.pro',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'service-1b',
    name: 'Mayfair Property Care',
    description: 'Premium property maintenance for high-end residences in Central London. Specialists in listed building upkeep.',
    category: 'property-maintenance',
    subcategories: ['Maintenance', 'Listed Buildings', 'Gutter Cleaning'],
    borough: 'Westminster',
    address: '22 Audley Street, Mayfair, W1K 2WW',
    phone: '+44 20 7935 1122',
    email: 'info@mayfairproperty.care',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  // 2. Painters & Decorators
  {
    id: 'service-2',
    name: 'Elite Painters & Decorators',
    description: 'High-end interior and exterior painting and decorating services for premium London properties.',
    category: 'painters-decorators',
    subcategories: ['Painting', 'Decorating', 'Wallpapering', 'Faux Finishes'],
    borough: 'Kensington & Chelsea',
    address: '45 King\'s Road, Chelsea, SW3 4UD',
    phone: '+44 20 7987 6543',
    email: 'info@elitepainters.london',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  // 3. Electricians
  {
    id: 'service-3',
    name: 'Swift Electricians Ltd',
    description: 'NICEIC-certified electrical installations, rewiring, fuseboard upgrades, and smart home electrical integration across London.',
    category: 'electricians',
    subcategories: ['Rewiring', 'Smart Home', 'Fuse Boards', 'Testing'],
    borough: 'Westminster',
    address: '14 Regency Street, London SW1P 4DD',
    phone: '+44 20 7222 3456',
    email: 'sparky@swiftelectric.co.uk',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  // 4. Plumbing & Heating
  {
    id: 'service-4',
    name: 'Pimlico Plumbers',
    description: 'Central London\'s most trusted plumbing and heating engineers. Boiler servicing, underfloor heating, and bathroom installations.',
    category: 'plumbing-heating',
    subcategories: ['Plumbing', 'Boilers', 'Heating', 'Bathrooms'],
    borough: 'Westminster',
    address: '1 Sail Street, London SE11 6NQ',
    phone: '+44 20 7928 8888',
    email: 'info@pimlicoplumbers.com',
    website: 'https://pimlicoplumbers.com',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  // 5. Legal & Notaries
  {
    id: 'service-5',
    name: 'Sterling Notary Services',
    description: 'Professional notary public and legal documentation services in the City of London. Apostille and document legalisation specialists.',
    category: 'legal-notaries',
    subcategories: ['Notary', 'Legal Docs', 'Apostille', 'Conveyancing'],
    borough: 'City of London',
    address: '10 St Paul\'s Churchyard, EC4M 8AL',
    phone: '+44 20 3456 7890',
    email: 'contact@sterlingnotary.co.uk',
    website: 'https://sterlingnotary.co.uk',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  // 6. Banking & Mortgages
  {
    id: 'service-6',
    name: 'Barclays Premier Banking — Canary Wharf',
    description: 'Premium banking, wealth management, and bespoke mortgage advisory for high-net-worth London residents.',
    category: 'banking-mortgages',
    subcategories: ['Banking', 'Wealth Management', 'Mortgages', 'International'],
    borough: 'Tower Hamlets',
    address: '1 Churchill Place, Canary Wharf, E14 5HP',
    phone: '+44 20 7116 1000',
    email: 'premier.canarywharf@barclays.com',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'service-6b',
    name: 'L&C Mortgages — London Bridge',
    description: 'Fee-free mortgage brokers specialising in London property. Expert advice for first-time buyers, buy-to-let, and remortgaging.',
    category: 'banking-mortgages',
    subcategories: ['Mortgages', 'Buy-to-Let', 'Remortgaging', 'FTB'],
    borough: 'Southwark',
    address: '2 More London Place, SE1 2AP',
    phone: '+44 20 7403 4000',
    email: 'advice@landc.co.uk',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  // 7. Insurance Agencies
  {
    id: 'service-7',
    name: 'Lloyd\'s Residential Cover',
    description: 'Specialist residential property insurance from Lloyd\'s of London. Tailored cover for high-value London homes and portfolios.',
    category: 'insurance',
    subcategories: ['Property Insurance', 'Contents', 'Landlord Cover', 'High-Value'],
    borough: 'City of London',
    address: '1 Lime Street, London EC3M 7HA',
    phone: '+44 20 7327 1000',
    email: 'residential.cover@lloyds.com',
    website: 'https://lloyds.com',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  // 8. Physical Property Security
  {
    id: 'service-8',
    name: 'Mayfair Security Solutions',
    description: 'Elite manned guarding, access control, and residential security patrols for luxury London properties and gated communities.',
    category: 'property-security',
    subcategories: ['Manned Guarding', 'Access Control', 'Patrols', 'Concierge'],
    borough: 'Westminster',
    address: '15 Grosvenor Street, Mayfair, W1K 4QZ',
    phone: '+44 20 7499 8800',
    email: 'protect@mayfairsecurity.com',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  // 9. Removals & Transport
  {
    id: 'service-9',
    name: 'London White Glove Removals',
    description: 'Specialist removals and storage for fine art, antiques, and luxury furniture. International relocation services available.',
    category: 'removals-transport',
    subcategories: ['Removals', 'Storage', 'Fine Art Packing', 'International'],
    borough: 'Islington',
    address: '88 Upper Street, London N1 0NP',
    phone: '+44 20 5678 9012',
    email: 'move@whitegloveremovals.london',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  // 10. Home Surveillance & CCTV
  {
    id: 'service-10',
    name: 'SecureView Surveillance London',
    description: 'Advanced home CCTV systems, smart doorbells, and 24/7 remote monitoring solutions. NSI Gold-accredited installers.',
    category: 'surveillance-cctv',
    subcategories: ['CCTV', 'Smart Doorbells', 'Remote Monitoring', 'NSI Gold'],
    borough: 'Southwark',
    address: '25 The Shard, London Bridge Street, SE1 9SG',
    phone: '+44 20 9012 3456',
    email: 'secure@viewsurveillance.co.uk',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  // 11. Child & Elderly Care
  {
    id: 'service-11',
    name: 'HomeCare Angels',
    description: 'Premium home care, companionship, and convalescent support for elderly and vulnerable residents across Greater London.',
    category: 'child-elderly-care',
    subcategories: ['Elderly Care', 'Companionship', 'Convalescent', 'Dementia'],
    borough: 'Greenwich',
    address: '5 Greenwich High Road, SE10 8NW',
    phone: '+44 20 6789 0123',
    email: 'care@homecareangels.co.uk',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'service-11b',
    name: 'Kensington Nannies & Childcare',
    description: 'Ofsted-registered nanny agency placing qualified childcare professionals with families across prime Central London.',
    category: 'child-elderly-care',
    subcategories: ['Nannies', 'Childcare', 'Ofsted', 'Maternity'],
    borough: 'Kensington & Chelsea',
    address: '32 Kensington Church Street, W8 4HA',
    phone: '+44 20 7938 2200',
    email: 'hello@kensingtonnannies.co.uk',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  // 12. Cleaning Services
  {
    id: 'service-12',
    name: 'Sparkle Clean London',
    description: 'Eco-friendly premium cleaning services for luxury flats and residences. End-of-tenancy deep-clean specialists.',
    category: 'cleaning',
    subcategories: ['Deep Clean', 'End-of-Tenancy', 'Eco-friendly', 'Regular'],
    borough: 'Camden',
    address: '15 Parkway, Camden Town, NW1 7PG',
    phone: '+44 20 4321 0987',
    email: 'sparkle@cleanlondon.com',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  // 13. Architecture & Planning
  {
    id: 'service-13',
    name: 'Foster & Partners Residential',
    description: 'RIBA-chartered architectural practice specialising in premium residential extensions, basements, and new-build homes across London.',
    category: 'architecture-planning',
    subcategories: ['Extensions', 'Basements', 'New Build', 'Planning'],
    borough: 'Wandsworth',
    address: 'Battersea Park Road, London SW11 4BE',
    phone: '+44 20 7738 0455',
    email: 'residential@fosterandpartners.com',
    website: 'https://fosterandpartners.com',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  // 14. Interior Design
  {
    id: 'service-14',
    name: 'Kelly Hoppen Interiors',
    description: 'Award-winning interior design studio creating bespoke luxury residential interiors for London\'s most discerning homeowners.',
    category: 'interior-design',
    subcategories: ['Residential', 'Bespoke', 'Luxury', 'Turnkey'],
    borough: 'Kensington & Chelsea',
    address: '2 Michael Road, Chelsea, SW6 2AD',
    phone: '+44 20 7471 3350',
    email: 'hello@kellyhoppeninteriors.com',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  // 15. Landscape Gardening
  {
    id: 'service-15',
    name: 'Chelsea Garden Design',
    description: 'RHS Chelsea Flower Show medal-winning landscape architects. Bespoke garden and terrace design for London properties.',
    category: 'landscape-gardening',
    subcategories: ['Garden Design', 'Terrace', 'Maintenance', 'RHS'],
    borough: 'Kensington & Chelsea',
    address: '88 Fulham Road, Chelsea, SW3 6HR',
    phone: '+44 20 7584 3000',
    email: 'design@chelseagardens.com',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  // 16. Surveying & Valuations
  {
    id: 'service-16',
    name: 'Savills Surveying — Sloane Street',
    description: 'RICS-certified chartered surveyors providing building surveys, valuations, and home-buyer reports for premium London property.',
    category: 'surveying-valuations',
    subcategories: ['Building Survey', 'Valuation', 'Home-Buyer Report', 'RICS'],
    borough: 'Kensington & Chelsea',
    address: '139 Sloane Street, London SW1X 9AY',
    phone: '+44 20 7730 0822',
    email: 'surveys@savills.com',
    website: 'https://savills.com',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  // 17. Locksmith Services
  {
    id: 'service-17',
    name: 'Sloane Square Locksmiths',
    description: '24/7 emergency locksmith service covering Central London. Smart lock installation, key cutting, and security upgrades.',
    category: 'locksmiths',
    subcategories: ['Emergency', 'Smart Locks', 'Key Cutting', 'Safe Opening'],
    borough: 'Kensington & Chelsea',
    address: '4 Sloane Square, London SW1W 8EE',
    phone: '+44 20 7730 9999',
    email: 'help@sloanesquarelocks.co.uk',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  // 18. Waste Removal
  {
    id: 'service-18',
    name: 'ClearWaste London',
    description: 'Licensed waste clearance, skip hire, and eco-friendly recycling for residential projects across Greater London.',
    category: 'waste-removal',
    subcategories: ['Clearance', 'Skip Hire', 'Recycling', 'Licensed'],
    borough: 'Haringey',
    address: '12 Wood Green, London N22 6YA',
    phone: '+44 20 8888 4567',
    email: 'clear@wastefree.london',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'service-18b',
    name: 'EcoSkip South London',
    description: 'Sustainable waste management and skip hire for south London residential renovations and garden clearances.',
    category: 'waste-removal',
    subcategories: ['Skip Hire', 'Garden Waste', 'Renovation', 'Eco'],
    borough: 'Southwark',
    address: '45 Old Kent Road, London SE1 5AN',
    phone: '+44 20 7740 3322',
    email: 'book@ecoskip.london',
    is_verified: false,
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
  private feedUrls: Record<string, string> = {};

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

  async importAgencyListings(agencyId: string): Promise<{ imported: number; failed: number; errors: string[] }> {
    const feedUrl = this.feedUrls[agencyId];
    if (!feedUrl) {
      return { imported: 0, failed: 0, errors: ['No feed URL configured for this agency. Set one via updateAgencyFeedUrl.'] };
    }

    const { cleanUrl, apiKey } = parseFeedUrl(feedUrl);
    if (!apiKey) {
      return { imported: 0, failed: 0, errors: ['No API key found in feed URL. Append ?api_key=YOUR_KEY to the URL.'] };
    }

    const { properties, result } = await parseAndValidateFeed({
      apiKey,
      providerId: agencyId,
      endpoint: cleanUrl,
    });

    if (result.errors.length > 0 && properties.length === 0) {
      return result;
    }

    for (const property of properties) {
      try {
        const newListing = await this.createListing(transformProperty(property, agencyId));
        this.listings.push({ ...newListing, is_verified: true, created_at: newListing.created_at });
      } catch (err: any) {
        result.failed++;
        result.imported--;
        result.errors.push(`Failed to insert "${property.title}": ${err.message}`);
      }
    }

    saveToStorage('listings', this.listings);
    return result;
  }

  // --- Admin Panel Methods ---
  async getAllUsers(): Promise<UserProfile[]> {
    return [...this.users];
  }

  async getAllAgencies(): Promise<(AgencyDetails & { feed_url?: string; sync_status?: string })[]> {
    return this.agencies.map(a => ({
      ...a,
      feed_url: this.feedUrls[a.id] || '',
      sync_status: 'inactive',
    }));
  }

  async blockUser(userId: string): Promise<void> {
    this.users = this.users.filter(u => u.id !== userId);
    this.listings = this.listings.filter(l => l.provider_id !== userId);
    saveToStorage('users', this.users);
    saveToStorage('listings', this.listings);
  }

  async deleteUserListings(userId: string): Promise<void> {
    this.listings = this.listings.filter(l => l.provider_id !== userId);
    saveToStorage('listings', this.listings);
  }

  async updateAgencyFeedUrl(agencyId: string, feedUrl: string): Promise<void> {
    this.feedUrls[agencyId] = feedUrl;
  }
}

// Export a single database instance
export const db = new MockDatabase();
export default db;
