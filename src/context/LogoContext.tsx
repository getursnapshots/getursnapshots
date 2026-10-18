import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LogoContextType {
  customLogoUrl: string | null;
  hasCustomLogo: boolean;
  saveCustomLogo: (dataUrl: string) => void;
  removeCustomLogo: () => void;
}

const STORAGE_KEY = 'snapshots_custom_logo_data';

const LogoContext = createContext<LogoContextType>({
  customLogoUrl: null,
  hasCustomLogo: false,
  saveCustomLogo: () => {},
  removeCustomLogo: () => {},
});

export const LogoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && (stored.includes('.svg') || stored.includes('snapshots-logo') || !stored.startsWith('data:image/'))) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return stored || null;
    } catch {
      return null;
    }
  });

  const saveCustomLogo = (dataUrl: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, dataUrl);
      setCustomLogoUrl(dataUrl);
    } catch (e) {
      console.error('Failed to save logo to localStorage:', e);
      setCustomLogoUrl(dataUrl);
    }
  };

  const removeCustomLogo = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setCustomLogoUrl(null);
    } catch (e) {
      console.error('Failed to remove logo from localStorage:', e);
      setCustomLogoUrl(null);
    }
  };

  return (
    <LogoContext.Provider
      value={{
        customLogoUrl,
        hasCustomLogo: Boolean(customLogoUrl),
        saveCustomLogo,
        removeCustomLogo,
      }}
    >
      {children}
    </LogoContext.Provider>
  );
};

export const useLogo = () => useContext(LogoContext);
