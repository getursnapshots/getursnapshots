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
  RefreshCw,
  Phone,
  Calendar,
  MapPin,
  Clock,
  ArrowUpRight,
  UserCheck,
  Search,
  Download,
  Filter,
  Layers,
  ChevronDown,
  Database,
  ExternalLink,
  Tag,
  Video,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { WhatsAppIcon } from './icons/WhatsAppIcon';

export const AdminLoginModal: React.FC = () => {
  const {
    isAdmin,
    currentUser,
    isLoginModalOpen,
    setIsLoginModalOpen,
    loginWithEmailPassword,
    getIdToken,
    updateBookingStatus,
    logout,
  } = useAdminAuth();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Leads state
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [activeTab, setActiveTab] = useState<'bookings' | 'tools'>('bookings');
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);
  const [exportToast, setExportToast] = useState<string | null>(null);

  const handleClose = () => {
    setIsLoginModalOpen(false);
    setError(null);
    setSuccessMessage(null);
  };

  const fetchLeads = async () => {
    setIsLoadingLeads(true);
    setError(null);
    try {
      const token = await getIdToken();
      const res = await fetch('/api/leads', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.leads && Array.isArray(data.leads)) {
          setLeads(data.leads);
          setIsLoadingLeads(false);
          return;
        }
      }

      // Fallback: check localStorage
      try {
        const stored = localStorage.getItem('snapshots_user_bookings');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setLeads(parsed);
            setIsLoadingLeads(false);
            return;
          }
        }
      } catch {}

      setLeads([]);
    } catch (e: any) {
      console.warn('Could not fetch leads:', e);
      setError('Network error while retrieving leads. Please try again.');
    } finally {
      setIsLoadingLeads(false);
    }
  };

  // Re-fetch leads when modal opens
  useEffect(() => {
    if (isLoginModalOpen && isAdmin) {
      fetchLeads();
    }
  }, [isLoginModalOpen, isAdmin]);


  // Handle administrator login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter your administrator email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginWithEmailPassword(email, password);
      if (result.success) {
        setSuccessMessage('Logged in successfully!');
        setEmail('');
        setPassword('');
        fetchLeads();
      } else {
        setError(result.error || 'Invalid administrator email or password.');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle status update for a booking
  const handleStatusChange = async (
    bookingId: string,
    newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  ) => {
    setUpdatingLeadId(bookingId);
    try {
      const ok = await updateBookingStatus(bookingId, newStatus);
      if (ok) {
        setLeads((prev) =>
          prev.map((lead) => (lead.id === bookingId ? { ...lead, status: newStatus } : lead))
        );
      }
    } catch (err) {
      console.warn('Error updating booking status:', err);
    } finally {
      setUpdatingLeadId(null);
    }
  };

  // Export CSV of collected appointment bookings for record-keeping
  const handleExportCSV = (exportMode: 'all' | 'filtered' = 'all') => {
    const targetRecords = exportMode === 'filtered' ? filteredLeads : leads;
    if (targetRecords.length === 0) return;

    const headers = [
      'Lead ID',
      'Status',
      'Client Name',
      'Phone Number',
      'Email Address',
      'Shoot Service',
      'Package Name',
      'Package Price',
      'Event Date',
      'Preferred Time',
      'Duration',
      'Shoot Location',
      'Country',
      'Coupon Code',
      'Discount Applied',
      'Client Requirements / Notes',
      'Lead Source',
      'Submitted At (ISO)',
      'Submitted At (Formatted)',
      'Delivered To Email',
    ];

    const escapeCSV = (val: unknown): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = targetRecords.map((l) => {
      const rawDate = l.submittedAt || l.createdAt;
      let formattedDate = '';
      if (rawDate) {
        try {
          formattedDate = new Date(rawDate).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
          });
        } catch {
          formattedDate = String(rawDate);
        }
      }

      const cleanNotes = (l.requirements || l.message || '').replace(/\r?\n/g, ' ').trim();

      return [
        escapeCSV(l.id || l.leadId || ''),
        escapeCSV(l.status || 'pending'),
        escapeCSV(l.name || l.clientName || 'Anonymous Client'),
        escapeCSV(l.phone || ''),
        escapeCSV(l.email || ''),
        escapeCSV(l.service || 'General Shoot'),
        escapeCSV(l.package || l.packageName || 'Custom'),
        escapeCSV(l.price || ''),
        escapeCSV(l.date || l.eventDate || 'Flexible'),
        escapeCSV(l.time || 'Flexible'),
        escapeCSV(l.duration || 'Standard'),
        escapeCSV(l.location || l.city || 'Pending venue'),
        escapeCSV(l.country || 'India'),
        escapeCSV(l.couponCode || 'None'),
        escapeCSV(l.discountApplied || 'None'),
        escapeCSV(cleanNotes),
        escapeCSV(l.source || 'Website Booking Form'),
        escapeCSV(rawDate || ''),
        escapeCSV(formattedDate),
        escapeCSV(l.deliveredTo || 'getursnapshots@gmail.com'),
      ];
    });

    // Prepend UTF-8 BOM (\uFEFF) for immediate compatibility with Excel, Numbers & Google Sheets
    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    const filename =
      exportMode === 'filtered'
        ? `SnapShots_Filtered_Appointments_${dateStr}.csv`
        : `SnapShots_All_Appointments_${dateStr}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportToast(
      `Successfully exported ${targetRecords.length} ${
        exportMode === 'filtered' ? 'filtered ' : ''
      }appointment record${targetRecords.length === 1 ? '' : 's'} as CSV.`
    );
    setTimeout(() => {
      setExportToast(null);
    }, 4500);
  };

  if (!isLoginModalOpen) return null;

  // Filter leads based on search query and status filter
  const filteredLeads = leads.filter((lead) => {
    const matchesStatus = statusFilter === 'all' || (lead.status || 'pending').toLowerCase() === statusFilter;
    if (!matchesStatus) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = (lead.name || lead.clientName || '').toLowerCase().includes(q);
    const phoneMatch = (lead.phone || '').toLowerCase().includes(q);
    const emailMatch = (lead.email || '').toLowerCase().includes(q);
    const serviceMatch = (lead.service || '').toLowerCase().includes(q);
    const locationMatch = (lead.location || lead.city || '').toLowerCase().includes(q);
    return nameMatch || phoneMatch || emailMatch || serviceMatch || locationMatch;
  });

  const countPending = leads.filter((l) => (l.status || 'pending') === 'pending').length;
  const countConfirmed = leads.filter((l) => l.status === 'confirmed').length;
  const countCompleted = leads.filter((l) => l.status === 'completed').length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-panel-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className={`relative w-full ${
          isAdmin ? 'max-w-5xl h-[92vh]' : 'max-w-md'
        } bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl shadow-black/90 flex flex-col overflow-hidden text-zinc-100 transition-all`}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#bd1616]/15 border border-[#bd1616]/40 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-[#bd1616]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="admin-panel-title" className="text-base font-black text-white tracking-wide">
                  Snap Shots Admin Console
                </h2>
                {isAdmin && (
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Supabase Active
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400">
                {isAdmin
                  ? `Authenticated as ${currentUser?.email || 'Master Administrator'}`
                  : 'Studio Administrator Access • Sign In to View Bookings'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                type="button"
                onClick={logout}
                className="px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto">
          {/* ========================================================================= */}
          {/* ADMINISTRATOR SIGN IN (SIGN UP REMOVED)                                    */}
          {/* ========================================================================= */}
          {!isAdmin && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-xs flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#bd1616]/15 text-[#bd1616] shrink-0 border border-[#bd1616]/30">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-xs">Studio Administrator Login</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                    Sign in with your administrator credentials to manage live bookings, customer data, and video reels.
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Admin Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. pavansid749@gmail.com or getursnapshots@gmail.com"
                      required
                      autoComplete="username"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#bd1616] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter administrator password"
                      required
                      autoComplete="current-password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#bd1616] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-full bg-[#bd1616] hover:bg-[#9e1212] active:bg-[#750d0d] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#bd1616]/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Admin Panel'}</span>
                </button>
              </form>

              <div className="pt-2 text-center text-[11px] text-zinc-500">
                <span>Secure access protected by encrypted server session authentication.</span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STATE 3: FULL ADMIN PANEL & BOOKINGS DASHBOARD                            */}
          {/* ========================================================================= */}
          {isAdmin && (
            <div className="p-4 sm:p-6 space-y-5">
              {/* Sub-Header Tabs & Quick Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('bookings')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      activeTab === 'bookings'
                        ? 'bg-[#bd1616] text-white shadow-md shadow-[#bd1616]/20'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Website Bookings ({leads.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('tools')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      activeTab === 'tools'
                        ? 'bg-[#bd1616] text-white shadow-md shadow-[#bd1616]/20'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Reels & Video Manager</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleExportCSV('all')}
                    disabled={leads.length === 0}
                    className="px-3.5 py-1.5 rounded-xl bg-[#bd1616] hover:bg-[#9e1212] active:bg-[#750d0d] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-[#bd1616]/25 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group"
                    title="Download all collected appointment data as CSV for record-keeping"
                    id="admin-download-csv-btn"
                  >
                    <Download className="w-3.5 h-3.5 text-white group-hover:scale-110 transition-transform" />
                    <span>Download as CSV</span>
                    {leads.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-black/30 text-[10px] text-white/95 font-mono font-bold">
                        {leads.length}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={fetchLeads}
                    disabled={isLoadingLeads}
                    className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Refresh bookings list from Supabase & local storage"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLeads ? 'animate-spin text-[#bd1616]' : ''}`} />
                    <span className="hidden sm:inline">{isLoadingLeads ? 'Refreshing...' : 'Refresh'}</span>
                  </button>
                </div>
              </div>

              {activeTab === 'bookings' && (
                <div className="space-y-4">
                  {/* KPI Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800/90 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                        Total Inquiries
                      </span>
                      <div className="text-xl font-black text-white">{leads.length}</div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                        Pending
                      </span>
                      <div className="text-xl font-black text-amber-300">{countPending}</div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                        Confirmed
                      </span>
                      <div className="text-xl font-black text-emerald-300">{countConfirmed}</div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-blue-950/20 border border-blue-500/30 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                        Completed
                      </span>
                      <div className="text-xl font-black text-blue-300">{countCompleted}</div>
                    </div>
                  </div>

                  {/* Export Feedback Toast */}
                  {exportToast && (
                    <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-semibold">{exportToast}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setExportToast(null)}
                        className="text-emerald-400 hover:text-white text-xs font-bold cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}

                  {/* Search and Status Filters */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by client name, phone, email, shoot service, location..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#bd1616] transition-colors"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 shrink-0">
                      {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setStatusFilter(st)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold capitalize transition-colors cursor-pointer ${
                            statusFilter === st
                              ? 'bg-zinc-200 text-black font-extrabold shadow-sm'
                              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Results Count & Filtered CSV Export Link */}
                  {leads.length > 0 && (
                    <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                      <span className="text-[11px]">
                        Showing <strong className="text-white">{filteredLeads.length}</strong> of{' '}
                        <strong className="text-white">{leads.length}</strong> appointment records
                      </span>
                      {filteredLeads.length > 0 && filteredLeads.length < leads.length && (
                        <button
                          type="button"
                          onClick={() => handleExportCSV('filtered')}
                          className="text-[11px] text-[#ffc800] hover:text-white flex items-center gap-1 font-bold cursor-pointer transition-colors"
                          title="Download only the currently filtered records as CSV"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download Filtered View ({filteredLeads.length})</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Bookings List */}
                  {isLoadingLeads ? (
                    <div className="py-20 text-center bg-zinc-900/40 rounded-3xl border border-zinc-800/80 flex flex-col items-center justify-center gap-3">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#bd1616]" />
                      <span className="text-xs text-zinc-400">Loading bookings from Supabase & server database...</span>
                    </div>
                  ) : filteredLeads.length === 0 ? (
                    <div className="py-20 text-center bg-zinc-900/40 rounded-3xl border border-zinc-800/80 space-y-2">
                      <p className="font-bold text-sm text-zinc-300">
                        {leads.length === 0 ? 'No bookings received yet.' : 'No bookings matched your filter.'}
                      </p>
                      <p className="text-xs text-zinc-500 max-w-md mx-auto">
                        {leads.length === 0
                          ? 'When a visitor books via the appointment booking form, details will appear here live and sync to your Supabase backend.'
                          : 'Try clearing your search query or switching status filters.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredLeads.map((item, idx) => {
                        const cleanPhone = (item.phone || '').replace(/[^0-9]/g, '');
                        const waLink = cleanPhone ? `https://wa.me/${cleanPhone}` : undefined;
                        const mailLink = item.email ? `mailto:${item.email}` : undefined;
                        const leadId = item.id || item.leadId || `LEAD-${idx}`;
                        const currentStatus = item.status || 'pending';

                        return (
                          <div
                            key={leadId}
                            className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800/90 hover:border-zinc-700 transition-all space-y-3.5"
                          >
                            {/* Card Header: Client name, status badge, timestamp */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/60 pb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#bd1616] to-[#750d0d] flex items-center justify-center text-white font-black text-xs shrink-0 shadow-md">
                                  {(item.name || item.clientName || 'C').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-sm text-white">
                                      {item.name || item.clientName || 'Anonymous Client'}
                                    </h3>
                                    {item.couponCode && (
                                      <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] text-emerald-300 font-mono font-bold">
                                        Coupon: {item.couponCode}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-zinc-500 font-mono block">
                                    ID: {leadId} &bull; Received: {new Date(item.submittedAt || item.createdAt || Date.now()).toLocaleString()}
                                  </span>
                                </div>
                              </div>

                              {/* Interactive Status Selector */}
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                                  Status:
                                </span>
                                <select
                                  value={currentStatus}
                                  disabled={updatingLeadId === leadId}
                                  onChange={(e) =>
                                    handleStatusChange(
                                      leadId,
                                      e.target.value as 'pending' | 'confirmed' | 'completed' | 'cancelled'
                                    )
                                  }
                                  className={`text-xs font-bold rounded-lg px-2.5 py-1 border transition-colors cursor-pointer focus:outline-none ${
                                    currentStatus === 'confirmed'
                                      ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                                      : currentStatus === 'completed'
                                      ? 'bg-blue-950/80 border-blue-500/40 text-blue-300'
                                      : currentStatus === 'cancelled'
                                      ? 'bg-red-950/80 border-red-500/40 text-red-300'
                                      : 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                                  }`}
                                >
                                  <option value="pending" className="bg-zinc-900 text-amber-300">
                                    Pending
                                  </option>
                                  <option value="confirmed" className="bg-zinc-900 text-emerald-300">
                                    Confirmed
                                  </option>
                                  <option value="completed" className="bg-zinc-900 text-blue-300">
                                    Completed
                                  </option>
                                  <option value="cancelled" className="bg-zinc-900 text-red-300">
                                    Cancelled
                                  </option>
                                </select>
                              </div>
                            </div>

                            {/* Shoot Details Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                              <div className="space-y-0.5">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase">Service</span>
                                <div className="font-bold text-[#bd1616] truncate">
                                  {item.service || 'General Shoot'}
                                </div>
                              </div>

                              <div className="space-y-0.5">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase">Package & Price</span>
                                <div className="text-zinc-200 truncate">
                                  {item.package || item.packageName || 'Custom'} {item.price ? `(${item.price})` : ''}
                                </div>
                              </div>

                              <div className="space-y-0.5">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase">Preferred Date & Time</span>
                                <div className="text-zinc-200 truncate flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-zinc-500" />
                                  <span>{item.date || item.eventDate || 'Flexible'} {item.time ? `• ${item.time}` : ''}</span>
                                </div>
                              </div>

                              <div className="space-y-0.5">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase">Shoot Location</span>
                                <div className="text-zinc-200 truncate flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-zinc-500" />
                                  <span>{item.location || item.city || 'Pending'} {item.country ? `(${item.country})` : ''}</span>
                                </div>
                              </div>
                            </div>

                            {/* Client Notes / Special Instructions if any */}
                            {(item.requirements || item.message) && (
                              <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/60 text-xs text-zinc-300 space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                                  Client Instructions:
                                </span>
                                <p className="leading-relaxed whitespace-pre-wrap">
                                  {item.requirements || item.message}
                                </p>
                              </div>
                            )}

                            {/* Card Footer: Quick 1-Click Client Contact CTAs */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-800/40 text-xs">
                              <div className="flex items-center gap-3 text-zinc-400">
                                {item.phone && (
                                  <span className="font-mono text-zinc-300">
                                    📞 {item.phone}
                                  </span>
                                )}
                                {item.email && (
                                  <span className="font-mono text-zinc-400 truncate max-w-[200px]">
                                    ✉️ {item.email}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                {waLink && (
                                  <a
                                    href={waLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition-transform hover:scale-105"
                                  >
                                    <WhatsAppIcon className="w-3.5 h-3.5 fill-black" />
                                    <span>WhatsApp Client</span>
                                  </a>
                                )}
                                {mailLink && (
                                  <a
                                    href={mailLink}
                                    className="px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
                                  >
                                    <Mail className="w-3.5 h-3.5 text-[#ffc800]" />
                                    <span>Email Client</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tools Tab: Video Management Instructions */}
              {activeTab === 'tools' && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
                    <div className="flex items-center gap-2">
                      <Video className="w-5 h-5 text-[#bd1616]" />
                      <h4 className="font-bold text-sm text-white">Live Reel Video & Preload Management</h4>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      As an authenticated administrator, you have unlocked the live video editing controls across the entire website.
                    </p>
                    <ul className="text-xs text-zinc-400 space-y-2 list-disc list-inside">
                      <li>
                        Scroll to the <strong className="text-white">&ldquo;Work That Performs&rdquo;</strong> section on the homepage.
                      </li>
                      <li>
                        Hover over any video reel slide and click the floating <strong className="text-white">&ldquo;Replace Video&rdquo;</strong> button.
                      </li>
                      <li>
                        Upload your high-definition MP4 file directly, or paste a link from Instagram Reels, AWS S3, Cloudinary, or Google Drive.
                      </li>
                      <li>
                        Click <strong className="text-white">&ldquo;Save Changes&rdquo;</strong> to lock your updates permanently into the live website.
                      </li>
                    </ul>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="px-5 py-2.5 rounded-full bg-[#bd1616] hover:bg-[#9e1212] active:bg-[#750d0d] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                      >
                        Close & Go To Homepage Videos
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
