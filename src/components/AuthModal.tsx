import React, { useState } from 'react';
import { db } from '../db';
import type { UserRole, UserProfile } from '../db/schema';
import { X, User, Mail, Building2, LogIn, UserPlus, Wrench } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  defaultTab?: 'login' | 'register';
  defaultRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  defaultTab = 'login',
  defaultRole = 'seeker'
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
  
  // Registration States
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Agency Specifics
  const [companyName, setCompanyName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [website, setWebsite] = useState('');

  // Login States
  const [loginEmail, setLoginEmail] = useState('');

  // Statuses
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) {
      setError('Please enter your registered email address.');
      return;
    }

    try {
      const user = await db.login(loginEmail);
      if (user) {
        setSuccess('Access granted. Welcome back.');
        setError('');
        setTimeout(() => {
          onLoginSuccess(user);
          onClose();
          // Reset
          setLoginEmail('');
          setSuccess('');
        }, 1000);
      } else {
        setError('No account matches this email. Please click "Create Account" below.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) {
      setError('Please complete all requested registration details.');
      return;
    }

    if ((role === 'agency' || role === 'service-provider') && (!companyName || !officeAddress)) {
      setError('Please fill in your business name and office address.');
      return;
    }

    if (role === 'agency' && !licenseNumber) {
      setError('Please enter your UK License Number for verification.');
      return;
    }

    try {
      // 1. Create Profile
      const newUser = await db.registerUser(fullName, email, role, phone);

      // 2. If Agency, create agency specifics
      if (role === 'agency') {
        await db.registerAgency(newUser.id, companyName, licenseNumber, phone, officeAddress, website);
      }

      setSuccess('Account registered successfully. Welcome to LondonFlat.');
      setError('');
      
      setTimeout(() => {
        onLoginSuccess(newUser);
        onClose();
        // Reset states
        setFullName('');
        setEmail('');
        setPhone('');
        setCompanyName('');
        setLicenseNumber('');
        setOfficeAddress('');
        setWebsite('');
        setSuccess('');
      }, 1200);

    } catch (err: any) {
      setError(err.message || 'Error occurred during registration.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-900 bg-slate-900/90 p-6 md:p-8 shadow-2xl backdrop-blur-md text-left">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-500 hover:bg-slate-950 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-950 mb-6 space-x-6">
          <button
            onClick={() => {
              setActiveTab('login');
              setError('');
            }}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition flex items-center space-x-1.5 ${
              activeTab === 'login' ? 'border-b-2 border-amber-500 text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="h-4 w-4" />
            <span>Sign In</span>
          </button>
          
          <button
            onClick={() => {
              setActiveTab('register');
              setError('');
            }}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition flex items-center space-x-1.5 ${
              activeTab === 'register' ? 'border-b-2 border-amber-500 text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="h-4 w-4" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Form rendering */}
        {activeTab === 'login' ? (
          
          /* ============= */
          /* LOGIN FORM   */
          /* ============= */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Welcome Back</h2>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                To sign in instantly, simply enter your registered email address. Try <strong className="text-amber-500">admin@londonflat.uk</strong> (admin), <strong className="text-amber-500">alex.flatseeker@gmail.com</strong> (seeker), or <strong className="text-amber-500">info@apexlettings.co.uk</strong> (agency).
              </p>
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  placeholder="e.g. alex.flatseeker@gmail.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-xs font-medium text-slate-300 outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-[10px] text-rose-400 font-semibold bg-rose-500/10 border border-rose-500/10 p-2.5 rounded-lg text-center">
                {error}
              </p>
            )}

            {success && (
              <p className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/10 p-2.5 rounded-lg text-center">
                {success}
              </p>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 py-3.5 text-xs font-extrabold text-slate-950 shadow-md active:scale-95 transition"
            >
              <span>Sign In instantly</span>
            </button>
          </form>

        ) : (
          
          /* ================== */
          /* REGISTRATION FORM  */
          /* ================== */
          <form onSubmit={handleRegisterSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            
            {/* Account Role */}
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                I am registering as a:
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setRole('seeker');
                    setError('');
                    setCompanyName('');
                    setLicenseNumber('');
                  }}
                  className={`flex items-center justify-center space-x-1.5 border p-3 rounded-xl transition font-bold text-xs ${
                    role === 'seeker'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span>Flat Hunter</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRole('agency');
                    setError('');
                  }}
                  className={`flex items-center justify-center space-x-1.5 border p-3 rounded-xl transition font-bold text-xs ${
                    role === 'agency'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  <span>Letting Agency</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRole('service-provider');
                    setError('');
                    setLicenseNumber('');
                  }}
                  className={`flex items-center justify-center space-x-1.5 border p-3 rounded-xl transition font-bold text-xs ${
                    role === 'service-provider'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <Wrench className="h-4 w-4" />
                  <span>Service Provider</span>
                </button>
              </div>
            </div>

            {/* Standard Profile Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Mercer"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3 text-xs font-medium text-slate-300 outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. alex@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3 text-xs font-medium text-slate-300 outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                UK Phone Number (Optional)
              </label>
              <input
                type="tel"
                placeholder="e.g. +44 7700 900543"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3 text-xs font-medium text-slate-300 outline-none focus:border-amber-500"
              />
            </div>

            {/* Business Fields (Agency & Service Provider) */}
            {(role === 'agency' || role === 'service-provider') && (
              <div className="space-y-3 border-t border-slate-950 pt-3">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400 mb-1">
                  {role === 'agency' ? <Building2 className="h-4 w-4" /> : <Wrench className="h-4 w-4" />}
                  <span>{role === 'agency' ? 'Licensed Agency Credentials' : 'Service Business Details'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Apex London Living"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3 text-xs font-medium text-slate-300 outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  {role === 'agency' && (
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        UK License Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. LN/2021/08492"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3 text-xs font-medium text-slate-300 outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Office Address
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 14 Berkeley Square, Mayfair, London"
                    value={officeAddress}
                    onChange={(e) => setOfficeAddress(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3 text-xs font-medium text-slate-300 outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Business Website URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="e.g. https://example.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3 text-xs font-medium text-slate-300 outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            {error && (
              <p className="text-[10px] text-rose-400 font-semibold bg-rose-500/10 border border-rose-500/10 p-2.5 rounded-lg text-center">
                {error}
              </p>
            )}

            {success && (
              <p className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/10 p-2.5 rounded-lg text-center">
                {success}
              </p>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 py-3.5 text-xs font-extrabold text-slate-950 shadow-md active:scale-95 transition"
            >
              <span>Register Account</span>
            </button>

          </form>
        )}

      </div>
    </div>
  );
};
