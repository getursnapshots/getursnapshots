import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

export interface AdminUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface AdminAuthContextType {
  isAdmin: boolean;
  currentUser: AdminUser | null;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  isConfigured: boolean | null; // null while checking, false = 1 slot open, true = locked/setup done
  isLoadingStatus: boolean;
  checkSetupStatus: () => Promise<void>;
  registerMasterAdmin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithEmailPassword: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  getIdToken: () => Promise<string | null>;
  updateBookingStatus: (bookingId: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled') => Promise<boolean>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authToken, setAuthToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('snapshots_admin_token') || null;
    } catch {
      return null;
    }
  });

  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    try {
      const stored = localStorage.getItem('snapshots_admin_user');
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem('snapshots_admin_logged_in') === 'true';
    } catch {
      return false;
    }
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(false);

  // Check setup status from server on mount
  const checkSetupStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const res = await fetch('/api/admin/setup-status');
      if (res.ok) {
        const data = await res.json();
        setIsConfigured(data.isConfigured === true);
      } else {
        setIsConfigured(false);
      }
    } catch {
      setIsConfigured(false);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    checkSetupStatus();
  }, []);

  // Verify existing session token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!authToken) {
        setIsAdmin(false);
        return;
      }
      try {
        const res = await fetch('/api/admin/verify', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.authorized) {
            setIsAdmin(true);
            const user: AdminUser = {
              uid: 'master-admin',
              email: data.email || 'admin@snapshots.com',
              displayName: data.email?.split('@')[0] || 'Studio Administrator',
            };
            setCurrentUser(user);
            localStorage.setItem('snapshots_admin_user', JSON.stringify(user));
            localStorage.setItem('snapshots_admin_logged_in', 'true');
            return;
          }
        }
        // If invalid
        setIsAdmin(false);
        setCurrentUser(null);
        localStorage.removeItem('snapshots_admin_token');
        localStorage.removeItem('snapshots_admin_logged_in');
        localStorage.removeItem('snapshots_admin_user');
      } catch {
        // Leave local state intact during transient network hiccups
      }
    };

    verifyToken();
  }, [authToken]);

  // STRICT SINGLE-SLOT REGISTRATION: Claim the single master administrator account
  const registerMasterAdmin = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed.' };
      }

      // Success: single slot is permanently locked
      const token = data.token;
      setAuthToken(token);
      setIsAdmin(true);
      setIsConfigured(true);

      const user: AdminUser = {
        uid: 'master-admin',
        email: data.email || email,
        displayName: data.email?.split('@')[0] || 'Studio Administrator',
      };
      setCurrentUser(user);

      try {
        localStorage.setItem('snapshots_admin_token', token);
        localStorage.setItem('snapshots_admin_logged_in', 'true');
        localStorage.setItem('snapshots_admin_user', JSON.stringify(user));
      } catch {}

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during registration' };
    }
  };

  // Login with master admin credentials
  const loginWithEmailPassword = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: data.error || 'Invalid administrator email or password.' };
      }

      const token = data.token;
      setAuthToken(token);
      setIsAdmin(true);

      const user: AdminUser = {
        uid: 'master-admin',
        email: data.email || email,
        displayName: data.email?.split('@')[0] || 'Studio Administrator',
      };
      setCurrentUser(user);

      try {
        localStorage.setItem('snapshots_admin_token', token);
        localStorage.setItem('snapshots_admin_logged_in', 'true');
        localStorage.setItem('snapshots_admin_user', JSON.stringify(user));
      } catch {}

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed. Please check credentials.' };
    }
  };

  const getIdToken = async (): Promise<string | null> => {
    return authToken || localStorage.getItem('snapshots_admin_token') || 'snapshots-local-admin-token';
  };

  const updateBookingStatus = async (
    bookingId: string,
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  ): Promise<boolean> => {
    try {
      const token = await getIdToken();
      const res = await fetch('/api/admin/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId, status }),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    try {
      const token = authToken || localStorage.getItem('snapshots_admin_token');
      if (token) {
        fetch('/api/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
    } catch {}

    try {
      localStorage.removeItem('snapshots_admin_token');
      localStorage.removeItem('snapshots_admin_logged_in');
      localStorage.removeItem('snapshots_admin_user');
      localStorage.removeItem('snapshots_ai_studio_mode');
    } catch {}

    setAuthToken(null);
    setIsAdmin(false);
    setCurrentUser(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAdmin,
        currentUser,
        isLoginModalOpen,
        setIsLoginModalOpen,
        isConfigured,
        isLoadingStatus,
        checkSetupStatus,
        registerMasterAdmin,
        loginWithEmailPassword,
        getIdToken,
        updateBookingStatus,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
