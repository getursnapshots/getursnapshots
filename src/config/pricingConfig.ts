/**
 * CENTRAL PRICING CONFIGURATION FOR SNAP SHOTS
 * ============================================
 * 
 * EDIT YOUR PRICES HERE:
 * You can easily update India and USA prices below, or add new countries in the future.
 * All components across the website automatically read from this single source of truth.
 */

export type SupportedCountryCode = 'IN' | 'US';

export interface PackagePricing {
  quickShot: number;
  quickShotOriginal: number;
  eventReel: number;
  eventReelOriginal: number;
  fullContent: number;
  fullContentOriginal: number;
}

export interface CountryPricingConfig {
  code: SupportedCountryCode;
  countryName: string;
  flag: string;
  currency: string;
  symbol: string;
  label: string; // e.g., "India | ₹ INR"
  shortLabel: string; // e.g., "₹ INR"
  whatsappCountryName: string; // e.g., "India" or "USA"
  packages: PackagePricing;
}

/**
 * =========================================================================
 * 🎯 EDIT PRICES HERE (India & USA)
 * =========================================================================
 * Easily change the numbers below to update pricing everywhere on the site:
 */
export const PRICING_CONFIG: Record<SupportedCountryCode, CountryPricingConfig> = {
  // INDIA PRICING (INR - ₹)
  IN: {
    code: 'IN',
    countryName: 'India',
    flag: '🇮🇳',
    currency: 'INR',
    symbol: '₹',
    label: 'India | ₹ INR',
    shortLabel: 'India (₹)',
    whatsappCountryName: 'India',
    packages: {
      quickShot: 1499,          // Hourly Plan offer price: ₹1,499
      quickShotOriginal: 1999,  // Hourly Plan original cut price: ₹1,999
      eventReel: 4499,          // Half Day Plan offer price: ₹4,499
      eventReelOriginal: 4999,  // Half Day Plan original cut price: ₹4,999
      fullContent: 999,         // Add On's offer price: ₹999
      fullContentOriginal: 1250,// Add On's original cut price: ₹1,250
    },
  },

  // USA PRICING (USD - $)
  US: {
    code: 'US',
    countryName: 'USA',
    flag: '🇺🇸',
    currency: 'USD',
    symbol: '$',
    label: 'USA | $ USD',
    shortLabel: 'USA ($)',
    whatsappCountryName: 'USA',
    packages: {
      quickShot: 99,          // Hourly Plan offer price: $99 (changed from 149)
      quickShotOriginal: 149, // Hourly Plan cut price: $149
      eventReel: 299,         // Half Day Plan offer price: $299 (changed from 399)
      eventReelOriginal: 399, // Half Day Plan cut price: $399
      fullContent: 79,        // Add On's offer price: $79 (changed from 99)
      fullContentOriginal: 99,// Add On's original cut price: $99 (changed from 125)
    },
  },
};

/**
 * DEFAULT FALLBACK SETTING:
 * Used if automatic country detection fails or if visitor is from an unsupported country.
 */
export const DEFAULT_COUNTRY_CODE: SupportedCountryCode = 'IN';

/**
 * List of countries available in the selector (Strictly India & USA only)
 */
export const AVAILABLE_COUNTRIES: CountryPricingConfig[] = [
  PRICING_CONFIG.IN,
  PRICING_CONFIG.US,
];
