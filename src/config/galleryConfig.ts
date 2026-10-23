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
    thumb: '/images/portfolio-1.jpg',
    full: '/images/portfolio-1.jpg',
    fallback: '/images/portfolio-1.jpg',
    alt: 'Candid event celebrations and signature photography',
  },
  {
    id: 'portfolio-2',
    thumb: '/images/portfolio-2.jpg',
    full: '/images/portfolio-2.jpg',
    fallback: '/images/portfolio-2.jpg',
    alt: 'High-energy lifestyle and event moments',
  },
  {
    id: 'portfolio-3',
    thumb: '/images/portfolio-3.jpg',
    full: '/images/portfolio-3.jpg',
    fallback: '/images/portfolio-3.jpg',
    alt: 'Authentic creator storytelling snapshot',
  },
  {
    id: 'portfolio-4',
    thumb: '/images/portfolio-4.jpg',
    full: '/images/portfolio-4.jpg',
    fallback: '/images/portfolio-4.jpg',
    alt: 'Dynamic evening celebration capture',
  },
  {
    id: 'portfolio-5',
    thumb: '/images/portfolio-5.jpg',
    full: '/images/portfolio-5.jpg',
    fallback: '/images/portfolio-5.jpg',
    alt: 'Signature portrait session highlight',
  },
  {
    id: 'portfolio-6',
    thumb: '/images/portfolio-6.jpg',
    full: '/images/portfolio-6.jpg',
    fallback: '/images/portfolio-6.jpg',
    alt: 'Festive group gathering and candid vibes',
  },
  {
    id: 'portfolio-7',
    thumb: '/images/portfolio-7.jpg',
    full: '/images/portfolio-7.jpg',
    fallback: '/images/portfolio-7.jpg',
    alt: 'Premium creator shoot aesthetic frame',
  },
  {
    id: 'portfolio-8',
    thumb: '/images/portfolio-8.jpg',
    full: '/images/portfolio-8.jpg',
    fallback: '/images/portfolio-8.jpg',
    alt: 'Vibrant party moments and live energy',
  },
  {
    id: 'portfolio-9',
    thumb: '/images/portfolio-9.jpg',
    full: '/images/portfolio-9.jpg',
    fallback: '/images/portfolio-9.jpg',
    alt: 'Artistic wedding and reception coverage',
  },
  {
    id: 'portfolio-10',
    thumb: '/images/portfolio-10.jpg',
    full: '/images/portfolio-10.jpg',
    fallback: '/images/portfolio-10.jpg',
    alt: 'Warm family celebration and memory preservation',
  },
];

export const galleryImages: string[] = galleryItems.map((item) => item.thumb);
export const galleryFullImages: string[] = galleryItems.map((item) => item.full);

