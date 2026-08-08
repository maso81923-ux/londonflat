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
import { BoroughGuidePage } from './components/BoroughGuidePage';
import { MovingChecklistPage } from './components/MovingChecklistPage';
import { TenantRightsPage } from './components/TenantRightsPage';
import { CheckoutPage } from './components/CheckoutPage';
import { AuthModal } from './components/AuthModal';
import { InstallPWA } from './components/InstallPWA';
import { SEO } from './components/SEO';
import { StructuredData } from './components/StructuredData';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [activeListingId, setActiveListingId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<ServiceCategory | null>(null);
  const [activeBoroughSlug, setActiveBoroughSlug] = useState<string | null>(null);
  const [activeRightsSlug, setActiveRightsSlug] = useState<string | null>(null);
  
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

  const handleNavigate = (view: string, listingId?: string, serviceCategory?: ServiceCategory, boroughSlug?: string, rightsSlug?: string) => {
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
    if (boroughSlug) {
      setActiveBoroughSlug(boroughSlug);
    } else {
      setActiveBoroughSlug(null);
    }
    if (rightsSlug) {
      setActiveRightsSlug(rightsSlug);
    } else {
      setActiveRightsSlug(null);
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
    if (user.role === 'admin') {
      setCurrentView('admin');
    } else if (user.role === 'agency' || user.role === 'landlord') {
      setCurrentView('dashboard');
    }
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
            onNavigate={handleNavigate}
          />
        );
      case 'admin':
        return <AdminPage />;
      case 'borough-guide':
        return activeBoroughSlug ? (
          <BoroughGuidePage slug={activeBoroughSlug} onNavigate={handleNavigate} />
        ) : (
          <HomePage listings={listings} onNavigate={handleNavigate} onSearch={handleSearch} />
        );
      case 'moving-checklist':
        return <MovingChecklistPage onNavigate={handleNavigate} />;
      case 'rights':
        return activeRightsSlug ? (
          <TenantRightsPage slug={activeRightsSlug} onNavigate={handleNavigate} />
        ) : (
          <HomePage listings={listings} onNavigate={handleNavigate} onSearch={handleSearch} />
        );
      case 'checkout':
        return activeListingId ? (
          <CheckoutPage productId={activeListingId} onNavigate={handleNavigate} />
        ) : (
          <HomePage listings={listings} onNavigate={handleNavigate} onSearch={handleSearch} />
        );
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
      {/* SEO per page */}
      {currentView === 'home' && (
        <SEO title="Premium London Real Estate & Flat-Sharing Marketplace" path="/" />
      )}
      {currentView === 'listings' && (
        <SEO title="Browse Premium Listings" description="Explore verified flats, rooms, and apartments for rent or sale in London." path="/listings" />
      )}
      {currentView === 'details' && activeListingId && (
        <SEO title={`Property Listing - LondonFlat`} path={`/listing/${activeListingId}`} type="product" />
      )}
      {currentView === 'services' && (
        <SEO title="London Living Services Hub" description="Find trusted service providers for your London home — maintenance, legal, removals, and more." path="/services" />
      )}
      {currentView === 'dashboard' && (
        <SEO title="Dashboard" path="/dashboard" />
      )}
      {currentView === 'admin' && (
        <SEO title="Admin Panel" path="/admin" />
      )}
      {currentView === 'borough-guide' && activeBoroughSlug && (
        <SEO title={`${activeBoroughSlug.charAt(0).toUpperCase() + activeBoroughSlug.slice(1).replace(/-/g, ' ')} Area Guide — LondonFlat`} description={`Explore the ${activeBoroughSlug.replace(/-/g, ' ')} London property market. Average rents, transport links, local highlights, and verified listings.`} path={`/boroughs/${activeBoroughSlug}`} />
      )}
      {currentView === 'moving-checklist' && (
        <SEO title="Moving Checklist — LondonFlat" description="Everything you need to plan a smooth London move. Tick items off as you go — progress saved automatically." path="/moving-checklist" />
      )}
      {currentView === 'rights' && activeRightsSlug && (
        <SEO title={`${activeRightsSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} — Tenant Rights — LondonFlat`} path={`/rights/${activeRightsSlug}`} />
      )}
      {currentView === 'checkout' && (
        <SEO title="Checkout — LondonFlat" path="/checkout" />
      )}
      {/* Structured Data: BreadcrumbList */}
      {currentView === 'home' && (
        <StructuredData type="BreadcrumbList" breadcrumbs={[{ name: 'Home', url: '/' }]} />
      )}
      {currentView === 'listings' && (
        <StructuredData type="BreadcrumbList" breadcrumbs={[{ name: 'Home', url: '/' }, { name: 'Listings', url: '/listings' }]} />
      )}
      {currentView === 'services' && (
        <StructuredData type="BreadcrumbList" breadcrumbs={[{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }]} />
      )}
      {currentView === 'moving-checklist' && (
        <StructuredData type="BreadcrumbList" breadcrumbs={[{ name: 'Home', url: '/' }, { name: 'Moving Checklist', url: '/moving-checklist' }]} />
      )}
      {currentView === 'borough-guide' && activeBoroughSlug && (
        <StructuredData type="BreadcrumbList" breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Borough Guides', url: '/boroughs' },
          { name: activeBoroughSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), url: `/boroughs/${activeBoroughSlug}` }
        ]} />
      )}
      {currentView === 'rights' && activeRightsSlug && (
        <StructuredData type="BreadcrumbList" breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Tenant Rights', url: '/rights' },
          { name: activeRightsSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), url: `/rights/${activeRightsSlug}` }
        ]} />
      )}
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

      {/* PWA Install Prompt */}
      <InstallPWA />
    </div>
  );
}

export default App;
