import { useEffect, useRef, useState, useCallback } from 'react';
import {
  preloadImage,
  preloadImages,
  isImagePreloaded,
} from '../utils/imagePreloader';

export interface UseGalleryPreloadOptions {
  /**
   * Ref to the scroll container element.
   */
  containerRef?: React.RefObject<HTMLElement | null>;
  /**
   * Complete array of image URLs in the gallery.
   */
  images: string[];
  /**
   * Distance in pixels from the end of the viewport track to trigger preloading.
   * Default: 700px.
   */
  thresholdPx?: number;
  /**
   * Scroll ratio (0 to 1) towards the end of the track to trigger preloading.
   * Default: 0.7 (70%).
   */
  thresholdRatio?: number;
  /**
   * Number of upcoming images to preload in each batch.
   * Default: 4.
   */
  batchSize?: number;
  /**
   * Scroll direction: 'horizontal' (default) or 'vertical'.
   */
  direction?: 'horizontal' | 'vertical';
  /**
   * Whether to treat the gallery as an infinite circular loop.
   * Default: true.
   */
  loop?: boolean;
  /**
   * Enable or disable preloading dynamically.
   * Default: true.
   */
  enabled?: boolean;
}

export interface UseGalleryPreloadReturn {
  /**
   * Set of image URLs that have been successfully preloaded.
   */
  preloadedUrls: Set<string>;
  /**
   * Boolean indicating if an image preload batch is in progress.
   */
  isPreloading: boolean;
  /**
   * Manually trigger preloading the next set of gallery images.
   */
  preloadNextBatch: () => Promise<void>;
  /**
   * Preload adjacent images around a specific index (e.g. for lightbox modals).
   */
  preloadSurrounding: (currentIndex: number, count?: number) => Promise<void>;
  /**
   * Optional sentinel ref callback. Attach to an element near the end of the viewport
   * track to leverage native IntersectionObserver ahead-of-time preloading.
   */
  sentinelRef: (node: HTMLElement | null) => void;
}

/**
 * Custom hook to preload the next set of gallery images once the user approaches
 * or reaches the end of the current viewport, ensuring a seamless, stutter-free infinite scrolling experience.
 */
export function useGalleryPreload({
  containerRef,
  images,
  thresholdPx = 700,
  thresholdRatio = 0.7,
  batchSize = 4,
  direction = 'horizontal',
  loop = true,
  enabled = true,
}: UseGalleryPreloadOptions): UseGalleryPreloadReturn {
  const [preloadedUrls, setPreloadedUrls] = useState<Set<string>>(new Set());
  const [isPreloading, setIsPreloading] = useState<boolean>(false);
  const nextIndexRef = useRef<number>(0);
  const isCheckingRef = useRef<boolean>(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelElementRef = useRef<HTMLElement | null>(null);

  // Preload a specific list of URLs
  const loadBatch = useCallback(
    async (urlsToPreload: string[]) => {
      const pendingUrls = urlsToPreload.filter(
        (url) => url && !isImagePreloaded(url)
      );

      if (pendingUrls.length === 0) return;

      setIsPreloading(true);
      try {
        await preloadImages(pendingUrls);
        setPreloadedUrls((prev) => {
          const next = new Set(prev);
          pendingUrls.forEach((u) => next.add(u));
          return next;
        });
      } finally {
        setIsPreloading(false);
      }
    },
    []
  );

  // Preload the next batch in the sequence
  const preloadNextBatch = useCallback(async () => {
    if (!enabled || images.length === 0) return;

    const urls: string[] = [];
    const startIndex = nextIndexRef.current;

    for (let i = 0; i < batchSize; i++) {
      const idx = (startIndex + i) % images.length;
      if (!urls.includes(images[idx])) {
        urls.push(images[idx]);
      }
    }

    if (loop) {
      nextIndexRef.current = (startIndex + batchSize) % images.length;
    } else {
      nextIndexRef.current = Math.min(startIndex + batchSize, images.length);
    }

    await loadBatch(urls);
  }, [enabled, images, batchSize, loop, loadBatch]);

  // Preload surrounding images around a given index (convenient for lightbox prev/next)
  const preloadSurrounding = useCallback(
    async (currentIndex: number, count = 2) => {
      if (!enabled || images.length === 0) return;

      const urls: string[] = [];
      for (let offset = -count; offset <= count; offset++) {
        if (offset === 0) continue;
        let targetIndex = currentIndex + offset;
        if (loop) {
          targetIndex = ((targetIndex % images.length) + images.length) % images.length;
        }
        if (targetIndex >= 0 && targetIndex < images.length) {
          const url = images[targetIndex];
          if (url && !urls.includes(url)) {
            urls.push(url);
          }
        }
      }

      await loadBatch(urls);
    },
    [enabled, images, loop, loadBatch]
  );

  // Initial preload of visible viewport batch
  useEffect(() => {
    if (!enabled || images.length === 0) return;

    // Preload the initial visible images
    const initialBatch = images.slice(0, Math.min(batchSize * 2, images.length));
    nextIndexRef.current = initialBatch.length % images.length;
    loadBatch(initialBatch);
  }, [enabled, images, batchSize, loadBatch]);

  // Viewport scroll boundary monitor
  useEffect(() => {
    if (!enabled || !containerRef || !containerRef.current) return;
    const el = containerRef.current;

    const checkViewportBoundary = () => {
      if (isCheckingRef.current || images.length === 0) return;

      const isHorizontal = direction === 'horizontal';
      const scrollPos = isHorizontal ? el.scrollLeft : el.scrollTop;
      const viewportSize = isHorizontal ? el.clientWidth : el.clientHeight;
      const totalSize = isHorizontal ? el.scrollWidth : el.scrollHeight;

      if (totalSize <= 0) return;

      const remaining = totalSize - (scrollPos + viewportSize);
      const ratio = (scrollPos + viewportSize) / totalSize;

      // User reached near the end of the current viewport
      if (remaining <= thresholdPx || ratio >= thresholdRatio) {
        isCheckingRef.current = true;
        preloadNextBatch().finally(() => {
          // Allow re-checking after short cooldown
          setTimeout(() => {
            isCheckingRef.current = false;
          }, 300);
        });
      }
    };

    let rafId: number;
    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(checkViewportBoundary);
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    // Also perform an immediate check
    checkViewportBoundary();

    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener('scroll', handleScroll);
    };
  }, [
    enabled,
    containerRef,
    direction,
    thresholdPx,
    thresholdRatio,
    images.length,
    preloadNextBatch,
  ]);

  // Sentinel ref with IntersectionObserver for native ahead-of-time trigger
  const sentinelRef = useCallback(
    (node: HTMLElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      sentinelElementRef.current = node;

      if (!node || !enabled) return;

      const isHorizontal = direction === 'horizontal';
      const rootMargin = isHorizontal ? '0px 750px 0px 0px' : '0px 0px 750px 0px';

      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              preloadNextBatch();
            }
          });
        },
        {
          root: containerRef?.current || null,
          rootMargin,
          threshold: 0.1,
        }
      );

      observerRef.current.observe(node);
    },
    [enabled, direction, containerRef, preloadNextBatch]
  );

  return {
    preloadedUrls,
    isPreloading,
    preloadNextBatch,
    preloadSurrounding,
    sentinelRef,
  };
}
