import type { Database } from './DatabaseInterface';
import { supabaseDb } from './supabaseDb';
import { db as mockDb } from './mockDb';

class DatabaseWrapper implements Database {
  private useSupabase: boolean = true;

  constructor() {
    // Basic check if Supabase is reachable/configured
    // In production, we might want a more robust check
  }

  private async getDb(): Promise<Database> {
    if (this.useSupabase) {
      try {
        // We could do a quick health check here if needed
        return supabaseDb;
      } catch (e) {
        console.warn('Supabase not reachable, falling back to mockDb', e);
        this.useSupabase = false;
        return mockDb;
      }
    }
    return mockDb;
  }

  async getCurrentUser() { return (await this.getDb()).getCurrentUser(); }
  async login(email: string) { return (await this.getDb()).login(email); }
  async logout() { return (await this.getDb()).logout(); }
  async registerUser(fullName: string, email: string, role: 'seeker' | 'agency' | 'landlord', phone?: string) {
    return (await this.getDb()).registerUser(fullName, email, role, phone);
  }
  async registerAgency(userId: string, companyName: string, licenseNumber: string, phone: string, officeAddress: string, website?: string) {
    return (await this.getDb()).registerAgency(userId, companyName, licenseNumber, phone, officeAddress, website);
  }
  async getAgencyByUserId(userId: string) { return (await this.getDb()).getAgencyByUserId(userId); }
  
  async getListings() { return (await this.getDb()).getListings(); }
  async getListingById(id: string) { return (await this.getDb()).getListingById(id); }
  async getProviderByListingId(providerId: string) { return (await this.getDb()).getProviderByListingId(providerId); }
  async createListing(listingData: any) { return (await this.getDb()).createListing(listingData); }
  async verifyListing(id: string) { return (await this.getDb()).verifyListing(id); }
  async deleteListing(id: string) { return (await this.getDb()).deleteListing(id); }
  
  async getServiceProviders() { return (await this.getDb()).getServiceProviders(); }
  async getServiceProvidersByCategory(category: any) { return (await this.getDb()).getServiceProvidersByCategory(category); }
  async getServiceProvidersByBorough(borough: string) { return (await this.getDb()).getServiceProvidersByBorough(borough); }
  
  async getViewingRequests() { return (await this.getDb()).getViewingRequests(); }
  async createViewingRequest(requestData: any) { return (await this.getDb()).createViewingRequest(requestData); }
  async updateViewingRequestStatus(id: string, status: any) { return (await this.getDb()).updateViewingRequestStatus(id, status); }
  async getViewingRequestsForProvider(providerId: string) { return (await this.getDb()).getViewingRequestsForProvider(providerId); }
  async getViewingRequestsForSeeker(seekerId: string) { return (await this.getDb()).getViewingRequestsForSeeker(seekerId); }
}

export const db = new DatabaseWrapper();
export default db;
