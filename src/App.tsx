import { useState, useEffect } from 'react';
import { db } from './db/mockDb';
import type { UserProfile, PropertyListing } from './db/schema';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { ListingsPage } from './components/ListingsPage';
import { ListingDetailsPage } from './components/ListingDetailsPage';
import { DashboardPage } from './components/DashboardPage';
import { AuthModal } from './components/AuthModal';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [activeListingId, setActiveListingId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  
  // Search state passed between Home and Listings
  const [searchFilters, setSearchFilters] = useState<{ borough: string; type: string; maxPrice: number } | undefined>(undefined);

  // Auth modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [authModalRole, setAuthModalRole] = useState<'seeker' | 'agency'>('seeker');

  // Load user on mount
  useEffect(() => {
    const user = db.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  // Sync listings live from DB
  const listings: PropertyListing[] = db.getListings();

  const handleNavigate = (view: string, listingId?: string) => {
    setCurrentView(view);
    if (listingId) {
      setActiveListingId(listingId);
    } else {
      setActiveListingId(null);
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

  const handleLogout = () => {
    db.logout();
    setCurrentUser(null);
    handleNavigate('home');
  };

  const handleOpenAuth = (defaultTab: 'login' | 'register' = 'login', defaultRole: 'seeker' | 'agency' = 'seeker') => {
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
