import React from 'react';
import { Building2, Mail, Phone, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 text-slate-400 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 to-amber-600">
                <Building2 className="h-5 w-5 text-slate-950 stroke-[2]" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                London<span className="text-amber-500">Flat</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              The premier marketplace for high-performance real estate and flat-sharing in Greater London. Built to support verified listings, private landlords, and premium letting agencies.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Explore London
            </h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => onNavigate('listings')} 
                  className="hover:text-amber-400 transition"
                >
                  All Properties
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('listings')} 
                  className="hover:text-amber-400 transition"
                >
                  Premium Flatshares
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('listings')} 
                  className="hover:text-amber-400 transition"
                >
                  Entire Apartments
                </button>
              </li>
            </ul>
          </div>

          {/* Legal / Trust */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Trust & Quality
            </h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li className="hover:text-white transition cursor-pointer">
                Verified Listing Policy
              </li>
              <li className="hover:text-white transition cursor-pointer">
                Agency Code of Practice
              </li>
              <li className="hover:text-white transition cursor-pointer">
                Privacy Policy & Cookies
              </li>
              <li className="hover:text-white transition cursor-pointer">
                Terms of Service
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Contact Support
            </h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li className="flex items-center space-x-2">
                <Mail className="h-3.5 w-3.5 text-amber-500" />
                <span>info@londonflat.uk</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-3.5 w-3.5 text-amber-500" />
                <span>+447576040868</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} LondonFlat Marketplace (londonflat.uk). All rights reserved. Registered in England & Wales.
          </div>
          <div className="flex items-center space-x-1 mt-4 sm:mt-0">
            <span>Made with</span>
            <Heart className="h-3 w-3 text-amber-500 fill-amber-500" />
            <span>for the London housing market</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
