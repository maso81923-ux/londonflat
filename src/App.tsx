import { useState, useEffect } from 'react';
import { db } from './db';
import type { UserProfile, PropertyListing, ServiceCategory, UserRole } from './db/schema';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { ListingsPage } from './components/ListingsPage';
import { ListingDetailsPage } from './components/ListingDetailsPage';
import { DashboardPage } from './components/DashboardPage';
import { AdminPage } from './components/AdminPage';
import { ServicesPage } from './components/ServicesPage';
import { AuthModal } from './components/AuthModal';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [activeListingId, setActiveListingId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<ServiceCategory | null>(null);
  
  // Search state passed between Home and Listings
  const [searchFilters, setSearchFilters] = useState<{ borough: string; type: string; maxPrice: number } | undefined>(undefined);

  // Auth modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [authModalRole, setAuthModalRole] = useState<UserRole>('seeker');

  // Load user on mount
  useEffect(() => {
    const init = async () => {
      const user = await db.getCurrentUser();
      if (user) {
        setCurrentUser(user);
      }
    };
    init();
  }, []);

  // Listings state
  const [listings, setListings] = useState<PropertyListing[]>([]);
  const [serviceProviders, setServiceProviders] = useState<any[]>([]);

  // Sync listings live from DB
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [listingsData, providersData] = await Promise.all([
          db.getListings(),
          db.getServiceProviders()
        ]);
        setListings(listingsData);
        setServiceProviders(providersData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [currentView]); // Re-fetch on view change to ensure fresh data

  const handleNavigate = (view: string, listingId?: string, serviceCategory?: ServiceCategory) => {
    setCurrentView(view);
    if (listingId) {
      setActiveListingId(listingId);
    } else {
      setActiveListingId(null);
    }
    if (serviceCategory) {
      setSelectedServiceCategory(serviceCategory);
    } else if (view !== 'services') {
      setSelectedServiceCategory(null);
    }
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (filters: { borough: string; type: string; maxPrice: number }) => {
    setSearchFilters(filters);
    handleNavigate('listings');
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    await db.logout();
    setCurrentUser(null);
    handleNavigate('home');
  };

  const handleOpenAuth = (defaultTab: 'login' | 'register' = 'login', defaultRole: UserRole = 'seeker') => {
    setAuthModalTab(defaultTab);
    setAuthModalRole(defaultRole);
    setIsAuthModalOpen(true);
  };

  const renderActiveView = () => {
    switch (currentView) {
      case 'home':
        return (
          <HomePage 
            listings={listings} 
            onNavigate={handleNavigate} 
            onSearch={handleSearch} 
          />
        );
      case 'listings':
        return (
          <ListingsPage 
            listings={listings} 
            onNavigate={handleNavigate} 
            initialFilters={searchFilters} 
          />
        );
      case 'details':
        return activeListingId ? (
          <ListingDetailsPage 
            listingId={activeListingId} 
            currentUser={currentUser} 
            onNavigate={handleNavigate} 
            onOpenAuth={() => handleOpenAuth('login')} 
          />
        ) : (
          <HomePage 
            listings={listings} 
            onNavigate={handleNavigate} 
            onSearch={handleSearch} 
          />
        );
      case 'dashboard':
        return (
          <DashboardPage 
            currentUser={currentUser} 
            onNavigate={handleNavigate} 
          />
        );
      case 'services':
        return (
          <ServicesPage 
            providers={serviceProviders} 
            initialCategory={selectedServiceCategory}
          />
        );
      case 'admin':
        return <AdminPage />;
      default:
        return (
          <HomePage 
            listings={listings} 
            onNavigate={handleNavigate} 
            onSearch={handleSearch} 
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-white">
      {/* Header */}
      <Header 
        currentUser={currentUser} 
        onNavigate={handleNavigate} 
        onOpenAuth={handleOpenAuth} 
        onLogout={handleLogout} 
        currentView={currentView}
      />

      {/* Main viewport */}
      <main className="flex-grow">
        {renderActiveView()}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Auth Modal Trigger Overlay */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLoginSuccess={handleLoginSuccess}
        defaultTab={authModalTab}
        defaultRole={authModalRole}
      />
    </div>
  );
}

export default App;
