export interface PackageItem {
  id: string;
  name: string;
  price: string;
  priceNum: number;
  originalPrice?: string;
  originalPriceNum?: number;
  period?: string;
  tagline: string;
  description: string;
  badge?: string;
  isPopular?: boolean;
  shootTime: string;
  deliverables: string[];
  features?: string[];
  idealFor?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  image: string;
  deliverables: string[];
  tags: string[];
}

export interface ReelWorkItem {
  id: string;
  title: string;
  category: string;
  videoUrl: string;
  posterUrl?: string;
  client: string;
  views: string;
  duration: string;
  eventDate?: string;
  description: string;
  aspectRatio?: string;
  instagramUrl?: string;
  isInstagram?: boolean;
  isCustomUpload?: boolean;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  event: string;
  rating: number;
  quote: string;
  location: string;
  avatarUrl: string;
  verified: boolean;
  date: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface ProcessStepItem {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
}

export interface BookingFormData {
  name: string;
  phone: string;
  email: string;
  service: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  requirements: string;
  country?: string;
  price?: string;
  packageName?: string;
  couponCode?: string;
  discountApplied?: string;
}
