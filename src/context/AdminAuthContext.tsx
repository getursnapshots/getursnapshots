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
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../config/firebase';
import { isAiStudioEnvironment } from '../utils/aiStudioEnv';

// Passcode login has been deprecated in production in favor of secure Firebase Auth
export interface AdminAuthContextType {
  isAdmin: boolean;
  currentUser: User | null;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  loginWithEmailPassword: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginWithPasscode: (passcode: string) => { success: boolean; error?: string };
  getIdToken: () => Promise<string | null>;
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

  const loginWithPasscode = (_passcode: string) => {
    return {
      success: false,
      error: 'Passcode authentication has been retired. Please sign in with your Firebase admin email and password.',
    };
  };

  const loginWithEmailPassword = async (email: string, password: string) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (res.user) {
        setIsAdmin(true);
        try {
          localStorage.setItem('snapshots_ai_studio_mode', 'true');
        } catch {}
        return { success: true };
      }
      return { success: false, error: 'Authentication failed.' };
    } catch (err: any) {
      console.error('Email Sign-In Error:', err);
      let errorMsg = 'Invalid email or password.';
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        errorMsg = 'Invalid email or password.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMsg = 'Too many failed login attempts. Please try again later.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'Please enter a valid email address.';
      } else if (err.message) {
        errorMsg = err.message;
      }
      return { success: false, error: errorMsg };
    }
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

  const getIdToken = async (): Promise<string | null> => {
    if (auth.currentUser) {
      return auth.currentUser.getIdToken(true);
    }
    return null;
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
        loginWithEmailPassword,
        loginWithGoogle,
        loginWithPasscode,
        getIdToken,
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
