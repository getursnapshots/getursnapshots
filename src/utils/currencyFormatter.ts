import {
  PRICING_CONFIG,
  SupportedCountryCode,
  DEFAULT_COUNTRY_CODE,
} from '../config/pricingConfig';

/**
 * Formats a numeric price into a localized currency string with proper symbols and thousand separators.
 * Example (IN): 10000 -> "₹10,000"
 * Example (US): 300   -> "$300"
 */
export function formatCurrencyPrice(
  amount: number,
  countryCode: SupportedCountryCode = DEFAULT_COUNTRY_CODE
): string {
  const config = PRICING_CONFIG[countryCode] || PRICING_CONFIG[DEFAULT_COUNTRY_CODE];

  try {
    if (config.currency === 'INR') {
      // Indian locale standard (e.g. 10,000 or 1,00,000)
      return `${config.symbol}${amount.toLocaleString('en-IN')}`;
    }
    // US or default international locale standard
    return `${config.symbol}${amount.toLocaleString('en-US')}`;
  } catch {
    return `${config.symbol}${amount}`;
  }
}

/**
 * Returns the formatted price for a given package identifier and country.
 */
export function getPackagePriceString(
  packageId: string,
  countryCode: SupportedCountryCode = DEFAULT_COUNTRY_CODE
): string {
  const config = PRICING_CONFIG[countryCode] || PRICING_CONFIG[DEFAULT_COUNTRY_CODE];
  const normalizedId = packageId.toLowerCase().replace(/[-_]/g, '');

  if (normalizedId.includes('hour') || normalizedId.includes('quick') || normalizedId.includes('starter')) {
    return formatCurrencyPrice(config.packages.quickShot, countryCode);
  }
  if (normalizedId.includes('half') || normalizedId.includes('event')) {
    return formatCurrencyPrice(config.packages.eventReel, countryCode);
  }
  if (normalizedId.includes('addon') || normalizedId.includes('extend') || normalizedId.includes('full') || normalizedId.includes('content')) {
    return formatCurrencyPrice(config.packages.fullContent, countryCode);
  }

  return formatCurrencyPrice(config.packages.quickShot, countryCode);
}

/**
 * Returns the formatted original (cut/strikethrough) price for a package.
 */
export function getPackageOriginalPriceString(
  packageId: string,
  countryCode: SupportedCountryCode = DEFAULT_COUNTRY_CODE
): string {
  const config = PRICING_CONFIG[countryCode] || PRICING_CONFIG[DEFAULT_COUNTRY_CODE];
  const normalizedId = packageId.toLowerCase().replace(/[-_]/g, '');

  if (normalizedId.includes('hour') || normalizedId.includes('quick') || normalizedId.includes('starter')) {
    return formatCurrencyPrice(config.packages.quickShotOriginal, countryCode);
  }
  if (normalizedId.includes('half') || normalizedId.includes('event')) {
    return formatCurrencyPrice(config.packages.eventReelOriginal, countryCode);
  }
  if (normalizedId.includes('addon') || normalizedId.includes('extend') || normalizedId.includes('full') || normalizedId.includes('content')) {
    return formatCurrencyPrice(config.packages.fullContentOriginal, countryCode);
  }

  return formatCurrencyPrice(config.packages.quickShotOriginal, countryCode);
}

/**
 * Returns raw numeric price for a package.
 */
export function getPackagePriceNumber(
  packageId: string,
  countryCode: SupportedCountryCode = DEFAULT_COUNTRY_CODE
): number {
  const config = PRICING_CONFIG[countryCode] || PRICING_CONFIG[DEFAULT_COUNTRY_CODE];
  const normalizedId = packageId.toLowerCase().replace(/[-_]/g, '');

  if (normalizedId.includes('hour') || normalizedId.includes('quick') || normalizedId.includes('starter')) {
    return config.packages.quickShot;
  }
  if (normalizedId.includes('half') || normalizedId.includes('event')) {
    return config.packages.eventReel;
  }
  if (normalizedId.includes('addon') || normalizedId.includes('extend') || normalizedId.includes('full') || normalizedId.includes('content')) {
    return config.packages.fullContent;
  }

  return config.packages.quickShot;
}

/**
 * Returns raw original numeric price for a package.
 */
export function getPackageOriginalPriceNumber(
  packageId: string,
  countryCode: SupportedCountryCode = DEFAULT_COUNTRY_CODE
): number {
  const config = PRICING_CONFIG[countryCode] || PRICING_CONFIG[DEFAULT_COUNTRY_CODE];
  const normalizedId = packageId.toLowerCase().replace(/[-_]/g, '');

  if (normalizedId.includes('hour') || normalizedId.includes('quick') || normalizedId.includes('starter')) {
    return config.packages.quickShotOriginal;
  }
  if (normalizedId.includes('half') || normalizedId.includes('event')) {
    return config.packages.eventReelOriginal;
  }
  if (normalizedId.includes('addon') || normalizedId.includes('extend') || normalizedId.includes('full') || normalizedId.includes('content')) {
    return config.packages.fullContentOriginal;
  }

  return config.packages.quickShotOriginal;
}
