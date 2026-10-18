/**
 * Image optimization utilities for responsive sizing and performant loading.
 */

/**
 * Generates responsive srcset strings for Unsplash-hosted assets.
 * Allows browsers to download the smallest sufficient resolution based on device DPI & viewport width.
 */
export function getResponsiveImageSrcSet(
  url: string,
  widths: number[] = [320, 480, 640, 800, 1080],
  quality = 80
): string | undefined {
  if (!url || !url.includes('unsplash.com')) {
    return undefined;
  }

  const baseUrl = url.split('?')[0];
  return widths
    .map((w) => `${baseUrl}?q=${quality}&w=${w}&auto=format&fit=crop ${w}w`)
    .join(', ');
}
