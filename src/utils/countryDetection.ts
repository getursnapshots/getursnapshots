import {
  SupportedCountryCode,
  DEFAULT_COUNTRY_CODE,
  PRICING_CONFIG,
} from '../config/pricingConfig';

const STORAGE_KEY = 'snapshots_user_country';

/**
 * Reads any saved manual preference from localStorage.
 */
export function getStoredCountryPreference(): SupportedCountryCode | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in PRICING_CONFIG) {
      return stored as SupportedCountryCode;
    }
  } catch {
    // Ignore localStorage errors in restricted environments
  }
  return null;
}

/**
 * Saves the user's manual country selection in localStorage.
 */
export function saveUserCountryPreference(countryCode: SupportedCountryCode): void {
  try {
    localStorage.setItem(STORAGE_KEY, countryCode);
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Heuristic country detection using browser timezone.
 * Instant, 100% offline, zero network delay.
 */
function detectCountryFromTimezone(): SupportedCountryCode | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz) return null;

    // India timezone check
    if (tz.includes('Kolkata') || tz.includes('Calcutta') || tz === 'Asia/Colombo') {
      return 'IN';
    }

    // USA timezone checks (US standard timezones)
    if (
      tz.startsWith('America/') ||
      tz.startsWith('US/') ||
      tz.includes('New_York') ||
      tz.includes('Los_Angeles') ||
      tz.includes('Chicago') ||
      tz.includes('Phoenix') ||
      tz.includes('Denver') ||
      tz.includes('Anchorage') ||
      tz.includes('Honolulu') ||
      tz.includes('Detroit') ||
      tz.includes('Indianapolis')
    ) {
      return 'US';
    }
  } catch {
    // Graceful fallback
  }
  return null;
}

/**
 * Automatically determines visitor country:
 * 1. Checks manual choice in localStorage first (if user selected before, honor choice).
 * 2. Attempts IP-based lookup with a strict 1.8s timeout.
 * 3. Falls back to browser timezone heuristics.
 * 4. Falls back to configurable default ('IN').
 */
export async function detectVisitorCountry(): Promise<SupportedCountryCode> {
  // 1. Check saved manual selection
  const stored = getStoredCountryPreference();
  if (stored) {
    return stored;
  }

  // 2. Try fast IP-based geolocation lookup
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);

    // Using lightweight country.is API (fast, CORS-friendly, SSL)
    const response = await fetch('https://api.country.is/', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const detectedCode = (data?.country || '').toUpperCase();

      if (detectedCode === 'IN') return 'IN';
      if (detectedCode === 'US') return 'US';

      // If outside IN or US, use default country setting
      return DEFAULT_COUNTRY_CODE;
    }
  } catch {
    // Network or timeout occurred, proceed to fallback
  }

  // 3. Fallback: Browser Timezone check
  const tzCountry = detectCountryFromTimezone();
  if (tzCountry) {
    return tzCountry;
  }

  // 4. Default fallback: India
  return DEFAULT_COUNTRY_CODE;
}
