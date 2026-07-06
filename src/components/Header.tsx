import React from 'react';
import type { UserProfile, UserRole } from '../db/schema';
import { Building2, LogOut, LayoutDashboard, Shield } from 'lucide-react';

interface HeaderProps {
  currentUser: UserProfile | null;
  onNavigate: (view: string, listingId?: string) => void;
  onOpenAuth: (defaultTab?: 'login' | 'register', defaultRole?: UserRole) => void;
  onLogout: () => void;
  currentView: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onNavigate,
  onOpenAuth,
  onLogout,
  currentView
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <div 
          onClick={() => onNavigate('home')} 
          className="flex cursor-pointer items-center space-x-2.5 transition"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 shadow-md shadow-amber-500/20">
            <Building2 className="h-6 w-6 text-slate-950 stroke-[2]" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white">
              London<span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">Flat</span>
            </span>
            <span className="block text-[9px] font-semibold uppercase tracking-widest text-slate-400">
              Premium Marketplace
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <button 
            onClick={() => onNavigate('listings')}
            className={`text-sm font-medium transition duration-200 ${
              currentView === 'listings' ? 'text-amber-400' : 'text-slate-300 hover:text-white'
            }`}
          >
            Explore Listings
          </button>
          <button 
            onClick={() => onNavigate('services')}
            className={`text-sm font-medium transition duration-200 ${
              currentView === 'services' ? 'text-amber-400' : 'text-slate-300 hover:text-white'
            }`}
          >
            Services
          </button>
          <button 
            onClick={() => {
              if (currentUser?.role === 'agency' || currentUser?.role === 'landlord') {
                onNavigate('dashboard');
              } else {
                onOpenAuth('register', 'agency');
              }
            }}
            className="text-sm font-medium text-slate-300 hover:text-white transition duration-200"
          >
            Agency Portal
          </button>
          {currentUser?.role === 'admin' && (
            <button 
              onClick={() => onNavigate('admin')}
              className={`text-sm font-medium transition duration-200 flex items-center gap-1.5 ${
                currentView === 'admin' ? 'text-amber-400' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              Admin
            </button>
          )}
          <a 
            href="#about-london" 
            onClick={(e) => {
              e.preventDefault();
              onNavigate('home');
              setTimeout(() => {
                document.getElementById('about-london-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="text-sm font-medium text-slate-300 hover:text-white transition duration-200"
          >
            About London
          </a>
        </nav>

        {/* Auth / Account */}
        <div className="flex items-center space-x-4">
          {currentUser ? (
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onNavigate('dashboard')}
                className={`flex items-center space-x-1.5 rounded-lg px-4 py-2 text-xs font-medium border transition ${
                  currentView === 'dashboard'
                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                    : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Dashboard</span>
              </button>

              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => onNavigate('admin')}
                  className={`flex items-center space-x-1.5 rounded-lg px-4 py-2 text-xs font-medium border transition ${
                    currentView === 'admin'
                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                      : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span>Admin</span>
                </button>
              )}

              <div className="relative group flex items-center space-x-2.5">
                <img 
                  src={currentUser.avatar_url} 
                  alt={currentUser.full_name} 
                  className="h-9 w-9 rounded-full object-cover border border-slate-700"
                />
                <div className="hidden lg:block text-left">
                  <span className="block text-xs font-semibold text-slate-200 leading-tight">
                    {currentUser.full_name.split(' ')[0]}
                  </span>
                  <span className="block text-[10px] text-slate-400 capitalize">
                    {currentUser.role === 'seeker' ? 'Flat hunter' : currentUser.role}
                  </span>
                </div>
                
                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-rose-400 transition"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => onOpenAuth('login')}
                className="text-xs font-medium text-slate-300 hover:text-white px-3 py-2 transition"
              >
                Sign In
              </button>
              <button 
                onClick={() => onOpenAuth('register', 'agency')}
                className="hidden sm:flex items-center space-x-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-4 py-2.5 text-xs font-semibold text-slate-950 shadow-lg shadow-amber-500/10 transition duration-200 active:scale-95"
              >
                <span>List with Us</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
