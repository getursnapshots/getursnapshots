import React, { useState } from 'react';
import {
  X,
  Shield,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AdminLoginModal: React.FC = () => {
  const {
    isAdmin,
    currentUser,
    isLoginModalOpen,
    setIsLoginModalOpen,
    loginWithPasscode,
    loginWithGoogle,
    logout,
  } = useAdminAuth();

  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleClose = () => {
    setIsLoginModalOpen(false);
    setError(null);
    setSuccessMessage(null);
    setPasscode('');
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!passcode.trim()) {
      setError('Please enter the admin passcode.');
      return;
    }

    const res = loginWithPasscode(passcode);
    if (res.success) {
      setSuccessMessage('Admin access granted! Live video tools are now unlocked.');
      setTimeout(() => {
        handleClose();
      }, 1200);
    } else {
      setError(res.error || 'Invalid passcode.');
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        setSuccessMessage('Signed in as Admin! Live video tools unlocked.');
        setTimeout(() => {
          handleClose();
        }, 1200);
      } else {
        setError(res.error || 'Google login failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      setSuccessMessage('Logged out from Admin mode.');
      setTimeout(() => {
        handleClose();
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-login-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      {/* Click outside to close */}
      <div className="fixed inset-0 -z-10" onClick={handleClose} aria-hidden="true" />

      <div className="relative w-full max-w-md rounded-3xl bg-black border border-zinc-800 shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Header with Brand Red Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#750d0d] via-[#bd1616] to-[#ffc800]" />

        <div className="p-6 sm:p-7 space-y-5">
          {/* Top Title & Close Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#bd1616]/20 border border-[#bd1616]/40 flex items-center justify-center text-[#bd1616] shadow-md">
                <Shield className="w-5 h-5 text-[#bd1616]" />
              </div>
              <div>
                <h2 id="admin-login-title" className="text-base font-black text-white">
                  Snap Shots Admin
                </h2>
                <p className="text-xs text-zinc-400">
                  {isAdmin ? 'You are currently logged in as Admin' : 'Sign in to manage live reels & media'}
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
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          {/* Error Notice */}
          {error && (
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-[#bd1616] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* If already logged in as Admin */}
          {isAdmin ? (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Admin Privileges Active
                  </span>
                </div>
                {currentUser?.email && (
                  <p className="text-xs text-zinc-300">
                    Signed in as: <strong className="text-white">{currentUser.email}</strong>
                  </p>
                )}
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  The video slide selector & upload toolbar are unlocked on the website. Scroll down to the Work That Performs section to update videos or paste direct URLs.
                </p>
              </div>

              <div className="flex gap-2">
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
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* Login Form */
            <div className="space-y-5">
              {/* Passcode Login Form */}
              <form onSubmit={handlePasscodeSubmit} className="space-y-3.5">
                <div>
                  <label
                    htmlFor="admin-passcode-input"
                    className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5"
                  >
                    Admin Passcode
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <KeyRound className="w-4 h-4 text-[#bd1616]" />
                    </div>
                    <input
                      id="admin-passcode-input"
                      type={showPasscode ? 'text' : 'password'}
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="Enter admin passcode (e.g. snapshots2026)"
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#bd1616] transition-colors"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasscode(!showPasscode)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-white cursor-pointer"
                      aria-label={showPasscode ? 'Hide passcode' : 'Show passcode'}
                    >
                      {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Default passcode: <span className="text-[#ffc800] font-mono">snapshots2026</span>
                  </p>
                </div>

                <button
                  type="submit"
                  id="admin-passcode-login-btn"
                  className="w-full h-10 rounded-full bg-[#bd1616] hover:bg-[#9e1212] active:bg-[#750d0d] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#bd1616]/30 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer border border-[#9e1212] flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Log In as Admin</span>
                </button>
              </form>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800" />
                </div>
                <div className="relative px-3 bg-black text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Or
                </div>
              </div>

              {/* Google Sign-in */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                id="admin-google-login-btn"
                className="w-full h-10 rounded-full bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-850 text-white font-bold text-xs border border-zinc-700/80 hover:border-zinc-600 transition-all cursor-pointer flex items-center justify-center gap-2.5 active:scale-[0.98]"
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
                  Admin mode unlocks real-time video editing across your live website.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
