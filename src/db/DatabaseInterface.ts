import { 
  type PropertyListing, 
  type UserProfile, 
  type ViewingRequest, 
  type AgencyDetails, 
  type ServiceProvider, 
  type ServiceCategory, 
  type RequestStatus,
  type UserRole
} from './schema';

export interface Database {
  getCurrentUser(): Promise<UserProfile | null>;
  login(email: string): Promise<UserProfile | null>;
  logout(): Promise<void>;
  registerUser(fullName: string, email: string, role: UserRole, phone?: string): Promise<UserProfile>;
  registerAgency(userId: string, companyName: string, licenseNumber: string, phone: string, officeAddress: string, website?: string): Promise<AgencyDetails>;
  getAgencyByUserId(userId: string): Promise<AgencyDetails | undefined>;
  
  getListings(): Promise<PropertyListing[]>;
  getListingById(id: string): Promise<PropertyListing | undefined>;
  getProviderByListingId(providerId: string): Promise<{ name: string; avatar?: string; agencyName?: string; phone?: string; type: 'agency' | 'landlord' }>;
  createListing(listingData: Omit<PropertyListing, 'id' | 'is_verified' | 'created_at'>): Promise<PropertyListing>;
  verifyListing(id: string): Promise<void>;
  deleteListing(id: string): Promise<void>;
  
  getServiceProviders(): Promise<ServiceProvider[]>;
  getServiceProvidersByCategory(category: ServiceCategory): Promise<ServiceProvider[]>;
  getServiceProvidersByBorough(borough: string): Promise<ServiceProvider[]>;
  
  getViewingRequests(): Promise<ViewingRequest[]>;
  createViewingRequest(requestData: Omit<ViewingRequest, 'id' | 'status' | 'created_at'>): Promise<ViewingRequest>;
  updateViewingRequestStatus(id: string, status: RequestStatus): Promise<void>;
  getViewingRequestsForProvider(providerId: string): Promise<(ViewingRequest & { propertyTitle: string })[]>;
  getViewingRequestsForSeeker(seekerId: string): Promise<(ViewingRequest & { propertyTitle: string; propertyImage: string; borough: string; price: number })[]>;
}
