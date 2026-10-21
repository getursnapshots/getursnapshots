import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Sparkles,
  RefreshCw,
  Phone,
  Calendar,
  MapPin,
  Clock,
  ArrowUpRight,
  UserCheck,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { fetchBookingsFromFirestore } from '../config/firebase';

export const AdminLoginModal: React.FC = () => {
  const {
    isAdmin,
    currentUser,
    isLoginModalOpen,
    setIsLoginModalOpen,
    loginWithEmailPassword,
    loginWithGoogle,
    getIdToken,
    logout,
  } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [activeTab, setActiveTab] = useState<'tools' | 'leads'>('tools');

  const handleClose = () => {
    setIsLoginModalOpen(false);
    setError(null);
    setSuccessMessage(null);
  };

  const fetchLeads = async () => {
    setIsLoadingLeads(true);
    setError(null);
    try {
      // 1. Primary: Direct fetch from Firebase Firestore ('bookings' collection)
      try {
        const firestoreLeads = await fetchBookingsFromFirestore();
        if (firestoreLeads && firestoreLeads.length > 0) {
          setLeads(
            firestoreLeads.map((item) => ({
              id: item.id,
              name: item.clientName,
              clientName: item.clientName,
              phone: item.phone,
              email: item.email || '',
              service: item.service,
              package: item.package || '',
              price: item.price || '',
              date: item.eventDate || '',
              time: item.time || '',
              duration: item.duration || '',
              location: item.city || '',
              country: item.country || '',
              couponCode: item.couponCode || '',
              requirements: item.requirements || '',
              status: item.status || 'pending',
              submittedAt: item.createdAt || '',
              createdAt: item.createdAt || '',
            }))
          );
          setIsLoadingLeads(false);
          return;
        }
      } catch (firestoreErr) {
        console.warn('Direct Firestore leads query notice (trying fallback endpoint):', firestoreErr);
      }

      // 2. Secondary fallback: Query /api/leads endpoint
      const token = await getIdToken();
      if (!token) {
        setError('Please sign in with your Firebase admin account to view leads.');
        setLeads([]);
        return;
      }

      const res = await fetch('/api/leads', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setLeads(data.leads || []);
      } else {
        setError(data.error || `Error ${res.status}: You are not authorized to view leads.`);
        setLeads([]);
      }
    } catch (e: any) {
      console.warn('Could not fetch leads:', e);
      setError('Network error while retrieving leads. Please try again.');
    } finally {
      setIsLoadingLeads(false);
    }
  };

  // When modal is opened or tab changed to leads and user is logged in
  useEffect(() => {
    if (currentUser && isLoginModalOpen && activeTab === 'leads') {
      fetchLeads();
    }
  }, [currentUser, isLoginModalOpen, activeTab]);

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid administrator email address.');
      return;
    }
    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginWithEmailPassword(cleanEmail, password);
      if (res.success) {
        setSuccessMessage('Admin access granted! Live video tools are unlocked.');
        setPassword('');
        // Automatically switch to tools or stay on modal
      } else {
        setError(res.error || 'Authentication failed. Please verify credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        setSuccessMessage('Signed in with Google! Admin tools unlocked.');
      } else {
        setError(res.error || 'Google sign-in could not be completed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      setLeads([]);
      setSuccessMessage('Logged out from Admin mode.');
      setTimeout(() => {
        handleClose();
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoginModalOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-login-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      {/* Click outside to close */}
      <div className="fixed inset-0 -z-10" onClick={handleClose} aria-hidden="true" />

      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-3xl bg-zinc-950 border border-zinc-800 shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden">
        {/* Header Brand Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#750d0d] via-[#bd1616] to-[#ffc800] shrink-0" />

        <div className="p-5 sm:p-6 flex flex-col flex-1 overflow-hidden space-y-4">
          {/* Top Title & Close Button */}
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#bd1616]/20 border border-[#bd1616]/40 flex items-center justify-center text-[#bd1616] shadow-md">
                <Shield className="w-5 h-5 text-[#bd1616]" />
              </div>
              <div>
                <h2 id="admin-login-title" className="text-base font-black text-white">
                  Snap Shots Admin Portal
                </h2>
                <p className="text-xs text-zinc-400">
                  {currentUser
                    ? `Logged in as ${currentUser.email}`
                    : 'Secure Firebase authentication for studio coordinators'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
              aria-label="Close Admin Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success Toast */}
          {successMessage && (
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs shrink-0 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          {/* Error Notice */}
          {error && (
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs shrink-0 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-[#bd1616] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Logged In View (Tabs: Admin Tools vs Leads) */}
          {currentUser ? (
            <div className="flex flex-col flex-1 overflow-hidden space-y-3">
              {/* Tab Switcher */}
              <div className="flex border-b border-zinc-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('tools')}
                  className={`pb-2.5 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'tools'
                      ? 'border-[#bd1616] text-white'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Admin Tools
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('leads');
                    fetchLeads();
                  }}
                  className={`pb-2.5 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'leads'
                      ? 'border-[#bd1616] text-white'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5 text-[#ffc800]" />
                  <span>Firestore Leads ({leads.length})</span>
                </button>
              </div>

              {activeTab === 'tools' ? (
                <div className="space-y-4 py-2 overflow-y-auto">
                  <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        Authenticated via Firebase
                      </span>
                    </div>
                    <div className="text-xs text-zinc-300 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-[#ffc800]" />
                      <span>
                        Account: <strong className="text-white">{currentUser.email}</strong>
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Your administrator credentials have unlocked live reel editing and direct video upload tools. Scroll to the &ldquo;Work That Performs&rdquo; section to replace video files or link direct URLs.
                    </p>
                    <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400">Leads destination:</span>
                      <strong className="text-[#ffc800]">getursnapshots@gmail.com</strong>
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 py-2.5 rounded-full bg-[#bd1616] hover:bg-[#9e1212] active:bg-[#750d0d] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      Manage Videos Now
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={isLoading}
                      className="px-4 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Leads Management Tab */
                <div className="flex flex-col flex-1 overflow-hidden space-y-3">
                  <div className="flex items-center justify-between shrink-0">
                    <div className="text-[11px] text-zinc-400">
                      Destination: <strong className="text-[#ffc800]">getursnapshots@gmail.com</strong>
                    </div>
                    <button
                      type="button"
                      onClick={fetchLeads}
                      disabled={isLoadingLeads}
                      className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 cursor-pointer bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-800 transition-colors"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoadingLeads ? 'animate-spin text-[#bd1616]' : ''}`} />
                      <span>{isLoadingLeads ? 'Loading...' : 'Refresh'}</span>
                    </button>
                  </div>

                  {isLoadingLeads ? (
                    <div className="py-12 text-center bg-zinc-900/40 rounded-2xl border border-zinc-800/80 text-xs text-zinc-400 flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-[#bd1616]" />
                      <span>Loading leads from Firestore...</span>
                    </div>
                  ) : leads.length === 0 ? (
                    <div className="py-10 text-center bg-zinc-900/40 rounded-2xl border border-zinc-800/80 text-xs text-zinc-400 space-y-1">
                      <p className="font-semibold text-zinc-300">No leads found in Firestore database.</p>
                      <p className="text-[11px]">Submit a test booking using the website form to verify ingestion.</p>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                      {leads.map((l: any, idx: number) => {
                        const cleanPhone = (l.phone || '').replace(/[^0-9]/g, '');
                        return (
                          <div
                            key={l.id || idx}
                            className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-xs space-y-2 hover:border-zinc-700 transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-white font-bold text-sm block">
                                  {l.name || l.clientName || 'Anonymous Client'}
                                </span>
                                <span className="text-[10px] text-zinc-500 font-mono">
                                  ID: {l.id || l.leadId || `LEAD-${idx}`}
                                </span>
                              </div>
                              <span className="text-[10px] text-zinc-400 font-medium px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700/60">
                                {l.submittedAt || l.createdAt
                                  ? new Date(l.submittedAt || l.createdAt).toLocaleDateString(undefined, {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : 'Recent'}
                              </span>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-zinc-300 text-[11px] pt-1 border-t border-zinc-800/60">
                              <div className="flex items-center gap-1.5">
                                <span className="text-zinc-500 font-semibold">Service:</span>
                                <span className="text-[#ffc800] font-medium">{l.service || 'Shoot'}</span>
                              </div>
                              {l.package || l.packageName ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-zinc-500 font-semibold">Package:</span>
                                  <span>{l.package || l.packageName}</span>
                                </div>
                              ) : null}
                              {l.date || l.eventDate ? (
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-3 h-3 text-zinc-500" />
                                  <span>{l.date || l.eventDate}</span>
                                </div>
                              ) : null}
                              {l.location || l.city ? (
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="w-3 h-3 text-zinc-500" />
                                  <span className="truncate">{l.location || l.city}</span>
                                </div>
                              ) : null}
                            </div>

                            {/* Requirements Notes */}
                            {l.requirements && (
                              <p className="text-[11px] text-zinc-300 bg-black/50 p-2 rounded-xl border border-zinc-800/80 leading-relaxed">
                                &ldquo;{l.requirements}&rdquo;
                              </p>
                            )}

                            {/* Actions bar */}
                            <div className="pt-2 flex items-center justify-between border-t border-zinc-800/60 text-[11px]">
                              <div className="flex items-center gap-2">
                                {cleanPhone && (
                                  <a
                                    href={`https://wa.me/${cleanPhone}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] font-semibold text-[10px] transition-colors"
                                  >
                                    <WhatsAppIcon className="w-3 h-3 text-[#25D366]" />
                                    <span>WhatsApp</span>
                                  </a>
                                )}
                                {cleanPhone && (
                                  <a
                                    href={`tel:${cleanPhone}`}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-semibold transition-colors"
                                  >
                                    <Phone className="w-3 h-3" />
                                    <span>{cleanPhone}</span>
                                  </a>
                                )}
                                {l.email && (
                                  <a
                                    href={`mailto:${l.email}`}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-semibold transition-colors"
                                  >
                                    <Mail className="w-3 h-3" />
                                    <span>Email</span>
                                  </a>
                                )}
                              </div>
                              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                                {l.status || 'pending'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Login Form: Firebase Email & Password */
            <div className="space-y-4 py-1">
              <form onSubmit={handleEmailPasswordSubmit} className="space-y-3.5">
                <div>
                  <label
                    htmlFor="admin-email-input"
                    className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5"
                  >
                    Admin Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <Mail className="w-4 h-4 text-[#bd1616]" />
                    </div>
                    <input
                      id="admin-email-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@getursnapshots.com"
                      autoComplete="email"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#bd1616] transition-colors"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="admin-password-input"
                    className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <Lock className="w-4 h-4 text-[#bd1616]" />
                    </div>
                    <input
                      id="admin-password-input"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#bd1616] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-white cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  id="admin-email-login-btn"
                  disabled={isLoading}
                  className="w-full h-10 rounded-full bg-[#bd1616] hover:bg-[#9e1212] active:bg-[#750d0d] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#bd1616]/30 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer border border-[#9e1212] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isLoading ? 'Verifying...' : 'Sign In with Firebase'}</span>
                </button>
              </form>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800" />
                </div>
                <div className="relative px-3 bg-zinc-950 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Or
                </div>
              </div>

              {/* Google Sign-in Alternative */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                id="admin-google-login-btn"
                className="w-full h-10 rounded-full bg-zinc-900 hover:bg-zinc-850 active:bg-zinc-800 text-white font-bold text-xs border border-zinc-700/80 hover:border-zinc-600 transition-all cursor-pointer flex items-center justify-center gap-2.5 active:scale-[0.98] disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>

              <div className="pt-1 text-center">
                <p className="text-[11px] text-zinc-500">
                  <Sparkles className="w-3 h-3 text-[#ffc800] inline-block mr-1" />
                  Authorized admin access unlocks live video editing and Firestore leads inbox.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
