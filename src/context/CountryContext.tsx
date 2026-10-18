import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  SupportedCountryCode,
  CountryPricingConfig,
  PRICING_CONFIG,
  DEFAULT_COUNTRY_CODE,
} from '../config/pricingConfig';
import {
  detectVisitorCountry,
  saveUserCountryPreference,
  getStoredCountryPreference,
} from '../utils/countryDetection';
import {
  formatCurrencyPrice,
  getPackagePriceString,
  getPackageOriginalPriceString,
  getPackagePriceNumber,
  getPackageOriginalPriceNumber,
} from '../utils/currencyFormatter';

interface CountryContextType {
  country: SupportedCountryCode;
  countryConfig: CountryPricingConfig;
  setCountry: (code: SupportedCountryCode) => void;
  isDetecting: boolean;
  getPackagePrice: (packageId: string) => string;
  getPackageOriginalPrice: (packageId: string) => string;
  getPackagePriceNum: (packageId: string) => number;
  getPackageOriginalPriceNum: (packageId: string) => number;
  getEliteStartingPrice: () => string;
  formatPrice: (amount: number) => string;
  startingPriceLabel: string;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export const CountryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize with saved preference or default country immediately so there is no layout jump
  const [country, setCountryState] = useState<SupportedCountryCode>(() => {
    return getStoredCountryPreference() || DEFAULT_COUNTRY_CODE;
  });
  const [isDetecting, setIsDetecting] = useState<boolean>(!getStoredCountryPreference());

  // Automatic country detection on initial mount if not explicitly chosen by user
  useEffect(() => {
    let isMounted = true;

    const detect = async () => {
      const stored = getStoredCountryPreference();
      if (stored) {
        setIsDetecting(false);
        return;
      }

      try {
        const detected = await detectVisitorCountry();
        if (isMounted) {
          setCountryState(detected);
        }
      } catch (err) {
        console.warn('Country auto-detection fallback to default:', err);
      } finally {
        if (isMounted) {
          setIsDetecting(false);
        }
      }
    };

    detect();

    return () => {
      isMounted = false;
    };
  }, []);

  const setCountry = (code: SupportedCountryCode) => {
    if (code in PRICING_CONFIG) {
      setCountryState(code);
      saveUserCountryPreference(code);
    }
  };

  const countryConfig = useMemo(() => {
    return PRICING_CONFIG[country] || PRICING_CONFIG[DEFAULT_COUNTRY_CODE];
  }, [country]);

  const startingPriceLabel = useMemo(() => {
    return formatCurrencyPrice(countryConfig.packages.quickShot, country);
  }, [countryConfig, country]);

  const getPackagePrice = (packageId: string): string => {
    return getPackagePriceString(packageId, country);
  };

  const getPackageOriginalPrice = (packageId: string): string => {
    return getPackageOriginalPriceString(packageId, country);
  };

  const getPackagePriceNum = (packageId: string): number => {
    return getPackagePriceNumber(packageId, country);
  };

  const getPackageOriginalPriceNum = (packageId: string): number => {
    return getPackageOriginalPriceNumber(packageId, country);
  };

  const formatPrice = (amount: number): string => {
    return formatCurrencyPrice(amount, country);
  };

  const getEliteStartingPrice = (): string => {
    return formatCurrencyPrice(country === 'IN' ? 14999 : 800, country);
  };

  const value = useMemo(
    () => ({
      country,
      countryConfig,
      setCountry,
      isDetecting,
      getPackagePrice,
      getPackageOriginalPrice,
      getPackagePriceNum,
      getPackageOriginalPriceNum,
      getEliteStartingPrice,
      formatPrice,
      startingPriceLabel,
    }),
    [country, countryConfig, isDetecting, startingPriceLabel]
  );

  return <CountryContext.Provider value={value}>{children}</CountryContext.Provider>;
};

export const useCountry = (): CountryContextType => {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error('useCountry must be used within a CountryProvider');
  }
  return context;
};
