import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface PageSEO {
  title: string;
  description: string;
  keywords: string;
  canonicalPath: string;
}

const PAGE_SEO_MAP: Record<string, PageSEO> = {
  '/': {
    title: 'Snap Shots | Premium Event Videography, Photography & Content Creation',
    description:
      'Premium event videography, photography, and high-impact content creation for weddings, corporate events, and brands. Same-day delivery with Snap Shots.',
    keywords:
      'event videography, content creation, professional photography, video production, wedding reels, corporate event video, brand content creation, social media video production, cinematic reels, Snap Shots',
    canonicalPath: '/',
  },
  '/services': {
    title: 'Services & Packages | Event Videography & Content Creation – Snap Shots',
    description:
      'Explore our premium event videography, cinematic 4K video production, portrait photography, and creator content packages with lightning-fast same-day turnaround.',
    keywords:
      'event videography packages, content creation services, wedding videographer, corporate video shoot, commercial photography, brand reels, social media content packages',
    canonicalPath: '/services',
  },
  '/faqs': {
    title: 'Frequently Asked Questions | Event Videography & Shoot Bookings – Snap Shots',
    description:
      'Find answers about booking event videography, turnaround times, raw footage access, equipment, and custom content creation packages with Snap Shots.',
    keywords:
      'event videography FAQs, shoot booking questions, same day video delivery, raw footage access, hire videographer FAQ, snap shots pricing questions',
    canonicalPath: '/faqs',
  },
  '/contact': {
    title: 'Contact & Book a Shoot | Event Videography & Photography – Snap Shots',
    description:
      'Book certified event videographers and photographers for your shoot. Instant WhatsApp desk, fast custom quotes, and bookings across Telangana and USA.',
    keywords:
      'book event videographer, contact videography team, hire photographer, event video inquiry, whatsapp shoot booking, Snap Shots contact',
    canonicalPath: '/contact',
  },
};

export const SEOHead: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const seo = PAGE_SEO_MAP[pathname] || PAGE_SEO_MAP['/'];

    // 1. Update Title
    document.title = seo.title;

    // Helper to safely set or create meta tag
    const setMetaTag = (attribute: 'name' | 'property', attrValue: string, content: string) => {
      let tag = document.querySelector(`meta[${attribute}="${attrValue}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, attrValue);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    // 2. Standard Meta Tags
    setMetaTag('name', 'description', seo.description);
    setMetaTag('name', 'keywords', seo.keywords);

    // 3. OpenGraph Tags
    setMetaTag('property', 'og:title', seo.title);
    setMetaTag('property', 'og:description', seo.description);
    setMetaTag('property', 'og:url', `https://getursnapshots.com${seo.canonicalPath}`);
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:site_name', 'Snap Shots');

    // 4. Twitter Tags
    setMetaTag('name', 'twitter:title', seo.title);
    setMetaTag('name', 'twitter:description', seo.description);

    // 5. Canonical Link Tag
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `https://getursnapshots.com${seo.canonicalPath}`);
  }, [pathname]);

  return null;
};
