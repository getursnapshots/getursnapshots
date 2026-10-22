/**
 * ============================================================================
 * SNAP SHOTS - WALL OF SNAP SHOTS (GALLERY IMAGES CONFIGURATION)
 * ============================================================================
 * You can replace any of these URLs with your own image paths
 * (e.g., '/images/gallery/photo-1.jpg' or any image URL / Cloudinary / Imgur link).
 */

export interface GalleryImageItem {
  id: string;
  thumb: string;
  full: string;
  fallback: string;
  alt: string;
}

export const galleryItems: GalleryImageItem[] = [
  {
    id: 'portfolio-1',
    thumb: '/images/portfolio-1-thumb.webp',
    full: '/images/portfolio-1-full.webp',
    fallback: '/images/portfolio-1.JPG',
    alt: 'Candid event celebrations and signature photography',
  },
  {
    id: 'portfolio-2',
    thumb: '/images/portfolio-2-thumb.webp',
    full: '/images/portfolio-2-full.webp',
    fallback: '/images/portfolio-2.JPG',
    alt: 'High-energy lifestyle and event moments',
  },
  {
    id: 'portfolio-3',
    thumb: '/images/portfolio-3-thumb.webp',
    full: '/images/portfolio-3-full.webp',
    fallback: '/images/portfolio-3.jpeg',
    alt: 'Authentic creator storytelling snapshot',
  },
  {
    id: 'portfolio-4',
    thumb: '/images/portfolio-4-thumb.webp',
    full: '/images/portfolio-4-full.webp',
    fallback: '/images/portfolio-4.JPG',
    alt: 'Dynamic evening celebration capture',
  },
  {
    id: 'portfolio-5',
    thumb: '/images/portfolio-5-thumb.webp',
    full: '/images/portfolio-5-full.webp',
    fallback: '/images/portfolio-5.JPG',
    alt: 'Signature portrait session highlight',
  },
  {
    id: 'portfolio-6',
    thumb: '/images/portfolio-6-thumb.webp',
    full: '/images/portfolio-6-full.webp',
    fallback: '/images/portfolio-6.JPG',
    alt: 'Festive group gathering and candid vibes',
  },
  {
    id: 'portfolio-7',
    thumb: '/images/portfolio-7-thumb.webp',
    full: '/images/portfolio-7-full.webp',
    fallback: '/images/portfolio-7.JPG',
    alt: 'Premium creator shoot aesthetic frame',
  },
  {
    id: 'portfolio-8',
    thumb: '/images/portfolio-8-thumb.webp',
    full: '/images/portfolio-8-full.webp',
    fallback: '/images/portfolio-8.jpg',
    alt: 'Vibrant party moments and live energy',
  },
  {
    id: 'portfolio-9',
    thumb: '/images/portfolio-9-thumb.webp',
    full: '/images/portfolio-9-full.webp',
    fallback: '/images/portfolio-9.JPG',
    alt: 'Artistic wedding and reception coverage',
  },
  {
    id: 'portfolio-10',
    thumb: '/images/portfolio-10-thumb.webp',
    full: '/images/portfolio-10-full.webp',
    fallback: '/images/portfolio-10.JPG',
    alt: 'Warm family celebration and memory preservation',
  },
];

export const galleryImages: string[] = galleryItems.map((item) => item.thumb);
export const galleryFullImages: string[] = galleryItems.map((item) => item.full);

