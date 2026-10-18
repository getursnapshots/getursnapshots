/**
 * Instagram URL Parsing and Embed Helper Utility
 */

const CATEGORY_DEFAULT_POSTERS: Record<string, string> = {
  Wedding: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop',
  'Wedding Reels': 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop',
  Event: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop',
  'Event Reels': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop',
  Corporate: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop',
  'Corporate Reels': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop',
  Birthday: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop',
  'Birthday Reels': 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop',
  Product: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop',
  'Product Reels': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop',
  'Brand Content': 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
  Brand: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
};

const DEFAULT_POSTER = 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop';

/**
 * Extracts the shortcode from a public Instagram reel, post, or tv URL.
 * Handles formats like:
 * - https://www.instagram.com/reel/C8q7Xj9v0mQ/
 * - https://instagram.com/reel/C8q7Xj9v0mQ
 * - https://www.instagram.com/p/C8q7Xj9v0mQ/
 * - https://www.instagram.com/reels/C8q7Xj9v0mQ/
 */
export function extractInstagramId(url?: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (trimmed.includes('PASTE INSTAGRAM REEL URL HERE') || !trimmed.startsWith('http')) {
    return null;
  }
  const match = trimmed.match(/(?:instagram\.com\/(?:reel|reels|p|tv|share\/reel)\/([A-Za-z0-9_-]+))/i);
  return match ? match[1] : null;
}

/**
 * Checks if a string is a valid public Instagram Reel URL
 */
export function isValidInstagramUrl(url?: string): boolean {
  return Boolean(extractInstagramId(url));
}

/**
 * Returns the official Instagram iframe embed URL from a public Reel URL.
 */
export function getInstagramEmbedUrl(url?: string): string | null {
  const shortcode = extractInstagramId(url);
  if (!shortcode) return null;
  return `https://www.instagram.com/reel/${shortcode}/embed/?utm_source=ig_embed`;
}

/**
 * Normalizes an Instagram URL for opening in a new tab
 */
export function getCleanInstagramUrl(url?: string): string {
  if (!url) return 'https://www.instagram.com/';
  const shortcode = extractInstagramId(url);
  if (shortcode) {
    return `https://www.instagram.com/reel/${shortcode}/`;
  }
  if (url.startsWith('http')) {
    return url;
  }
  return 'https://www.instagram.com/';
}

/**
 * Gets a high quality poster fallback matching the category
 */
export function getDefaultPosterForCategory(category: string): string {
  return CATEGORY_DEFAULT_POSTERS[category] || DEFAULT_POSTER;
}
