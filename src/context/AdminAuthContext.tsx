import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../config/firebase';
import { isAiStudioEnvironment } from '../utils/aiStudioEnv';

// Default owner access passcodes
const VALID_PASSCODES = ['snapshots2026', 'admin123', 'snapshots', 'admin'];

interface AdminAuthContextType {
  isAdmin: boolean;
  currentUser: User | null;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  loginWithPasscode: (passcode: string) => { success: boolean; error?: string };
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return isAiStudioEnvironment();
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Monitor Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setIsAdmin(true);
        try {
          localStorage.setItem('snapshots_ai_studio_mode', 'true');
        } catch {}
      } else {
        // If not logged in via Firebase, check localStorage or AI Studio environment
        const hasLocal = localStorage.getItem('snapshots_ai_studio_mode') === 'true';
        setIsAdmin(hasLocal || isAiStudioEnvironment());
      }
    });

    return () => unsubscribe();
  }, []);

  // Monitor URL params for ?admin=true
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true' || params.get('studio') === 'true') {
        setIsAdmin(true);
        localStorage.setItem('snapshots_ai_studio_mode', 'true');
      }
    } catch {}
  }, []);

  const loginWithPasscode = (passcode: string) => {
    const clean = passcode.trim().toLowerCase();
    if (VALID_PASSCODES.includes(clean)) {
      setIsAdmin(true);
      try {
        localStorage.setItem('snapshots_ai_studio_mode', 'true');
      } catch {}
      return { success: true };
    }
    return { success: false, error: 'Incorrect admin passcode. Try "snapshots2026" or "admin123"' };
  };

  const loginWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleAuthProvider);
      if (res.user) {
        setIsAdmin(true);
        try {
          localStorage.setItem('snapshots_ai_studio_mode', 'true');
        } catch {}
        return { success: true };
      }
      return { success: false, error: 'Google sign-in could not be completed.' };
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      return { success: false, error: err.message || 'Google authentication failed' };
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('SignOut warning:', e);
    }
    try {
      localStorage.removeItem('snapshots_ai_studio_mode');
    } catch {}
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
        loginWithPasscode,
        loginWithGoogle,
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
