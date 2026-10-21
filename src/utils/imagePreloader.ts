/**
 * Image Preloader Utility
 * Provides high-performance, asynchronous image preloading and off-thread decoding
 * to guarantee seamless, instant-rendering infinite scrolling and gallery experiences.
 */

// In-memory cache of already decoded image URLs
const preloadedUrlCache = new Set<string>();

// Track active preload promises to prevent duplicate in-flight requests
const inFlightRequests = new Map<string, Promise<HTMLImageElement>>();

/**
 * Preload a single image URL and decode it off the main UI thread.
 * Returns a Promise that resolves when the image is fully ready to display.
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  if (!src) {
    return Promise.reject(new Error('Invalid image source URL'));
  }

  // Already cached and decoded
  if (preloadedUrlCache.has(src)) {
    const cachedImg = new Image();
    cachedImg.src = src;
    return Promise.resolve(cachedImg);
  }

  // Re-use existing in-flight request if already loading
  const existingPromise = inFlightRequests.get(src);
  if (existingPromise) {
    return existingPromise;
  }

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';

    img.onload = async () => {
      preloadedUrlCache.add(src);
      inFlightRequests.delete(src);

      // Attempt off-main-thread decode for instant paint without jank
      if (typeof img.decode === 'function') {
        try {
          await img.decode();
        } catch {
          // Decode errors (e.g. unsupported format edge cases) safely ignored
        }
      }
      resolve(img);
    };

    img.onerror = (err) => {
      inFlightRequests.delete(src);
      reject(err);
    };

    img.src = src;
  });

  inFlightRequests.set(src, promise);
  return promise;
}

/**
 * Batch preload an array of image URLs in parallel.
 */
export async function preloadImages(urls: string[]): Promise<HTMLImageElement[]> {
  if (!urls || urls.length === 0) return [];
  const uniqueUrls = Array.from(new Set(urls.filter(Boolean)));
  const promises = uniqueUrls.map((url) => preloadImage(url).catch(() => null));
  const results = await Promise.all(promises);
  return results.filter((img): img is HTMLImageElement => img !== null);
}

/**
 * Check whether an image is already preloaded and in memory.
 */
export function isImagePreloaded(src: string): boolean {
  return preloadedUrlCache.has(src);
}

/**
 * Returns a copy of all preloaded URLs.
 */
export function getPreloadedUrls(): string[] {
  return Array.from(preloadedUrlCache);
}

/**
 * Clear memory caches (useful for testing or cache eviction).
 */
export function clearPreloadCache(): void {
  preloadedUrlCache.clear();
  inFlightRequests.clear();
}
