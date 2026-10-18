export interface PastEventItem {
  id: string;
  title: string;
  category: 'Weddings' | 'Concerts & Festivals' | 'Corporate' | 'Private Celebrations' | 'Brand & Fashion';
  location: string;
  venue: string;
  date: string;
  imageUrl: string;
  tagline: string;
  description: string;
  deliverables: string[];
  metrics: {
    label: string;
    value: string;
  }[];
  client: string;
  featuredQuote?: string;
}

export const pastEventsData: PastEventItem[] = [
  {
    id: 'past-event-1',
    title: 'Royal Palace Sangeet & Heritage Vows',
    category: 'Weddings',
    location: 'Udaipur, Rajasthan',
    venue: 'Jagmandir Island Palace',
    date: 'February 2025',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
    tagline: 'Timeless royal grandeur with same-night emotional reels delivered before breakfast.',
    description: 'A 3-day multi-ceremony extravaganza featuring grand sangeet choreographies, royal baraat entry, emotional pheras, and midnight after-party. Captured with 3 simultaneous mobile creators and dual gimbal rigs.',
    deliverables: ['14 Dynamic Instagram Reels', 'Same-Night 60s Teaser Reel', 'Full 4K Uncompressed Raw Vault', 'Curated Editorial Stills'],
    metrics: [
      { label: 'Reels Created', value: '14' },
      { label: 'First Reel Delivered', value: '3.5 hrs' },
      { label: 'Total Views', value: '2.4M+' },
    ],
    client: 'Ananya & Kabir',
    featuredQuote: 'Our guests woke up to stunning cinematic reels already uploaded. The speed and quality blew everyone away!',
  },
  {
    id: 'past-event-2',
    title: 'Neon Pulse EDM & Beachfront Sundowner',
    category: 'Concerts & Festivals',
    location: 'Vagator, Goa',
    venue: 'Sunburn Horizon Arena',
    date: 'January 2025',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop',
    tagline: 'Bass drops, crowd euphoria, and laser sweeps cut into fast-paced viral clips.',
    description: 'Over 8,000 festival attendees dancing to international headliners. Captured stage-side and within the mosh pit with hyper-stabilized mobile setups for genuine, electrifying festival energy.',
    deliverables: ['8 High-Energy Beat-Synced Reels', 'Live Artist Entry Cut', 'Crowd Reaction Montages', 'Artist Collab Tagged Edits'],
    metrics: [
      { label: 'Attendees', value: '8,000+' },
      { label: 'Delivery Turnaround', value: '2 hrs' },
      { label: 'Engagement Rate', value: '14.8%' },
    ],
    client: 'Neon Groove Entertainment',
    featuredQuote: 'Snap Shots captured the true pulse of the festival. Pacing and beat-matching were spot on.',
  },
  {
    id: 'past-event-3',
    title: 'Global Tech Leaders & AI Innovation Summit',
    category: 'Corporate',
    location: 'Bengaluru, Karnataka',
    venue: 'Sheraton Grand Ballroom',
    date: 'March 2025',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop',
    tagline: 'Crisp executive storytelling and product reveals ready for LinkedIn & Instagram.',
    description: 'A flagship 2-day conference bringing together 1,200 tech founders and venture capitalists. Keynote snippets, rapid fires, expo floor highlights, and networking interactions produced with sharp executive aesthetics.',
    deliverables: ['10 Executive Keynote Reels', 'Live Expo Floor Walkthrough', 'VIP Speaker Short Clips', 'Full B2B Media Kit'],
    metrics: [
      { label: 'Keynote Reels', value: '10' },
      { label: 'LinkedIn Shares', value: '4,200+' },
      { label: 'Corporate Leads', value: '+340%' },
    ],
    client: 'FutureTech Global',
    featuredQuote: 'Pristine audio, crisp color grading, and delivered while the summit was still actively trending.',
  },
  {
    id: 'past-event-4',
    title: 'Haute Couture Runway & Autumn Showcase',
    category: 'Brand & Fashion',
    location: 'Mumbai, Maharashtra',
    venue: 'The St. Regis Penthouse',
    date: 'November 2024',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
    tagline: 'Fabric textures, fluid walks, and backstage frenzy captured for luxury aesthetics.',
    description: 'Exclusive designer preview with models walking a bespoke mirrored runway. Speed-ramped slow-motion captures of handcrafted embroideries, front-row celebrity guests, and intense backstage prep.',
    deliverables: ['12 Fashion Editorial Reels', 'Backstage Access Mini-Doc', 'Model Lookbook Carousel Clips', 'High-Res Stills'],
    metrics: [
      { label: 'Designers Featured', value: '6' },
      { label: 'Reels Created', value: '12' },
      { label: 'Instagram Reach', value: '1.8M' },
    ],
    client: 'Aura Luxury Collective',
    featuredQuote: 'The lighting and texture fidelity were unbelievable. It made the collection look like an international fashion film.',
  },
  {
    id: 'past-event-5',
    title: 'Rooftop Sundowner & Milestone 30th Gala',
    category: 'Private Celebrations',
    location: 'Bandra, Mumbai',
    venue: 'Skylight Glasshouse Terrace',
    date: 'December 2024',
    imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=1200&auto=format&fit=crop',
    tagline: 'Candid laughter, champagne toasts, and midnight rooftop fireworks.',
    description: 'An intimate 75-guest milestone birthday party featuring bespoke cocktails, live saxophone, and a surprise midnight tribute video. Effortless, candid coverage where guests were completely at ease.',
    deliverables: ['6 Candid Social Reels', 'Midnight Toast & Cake Reveal Reel', 'Guest Reaction Montage', 'All Raw 4K Clips Vault'],
    metrics: [
      { label: 'Guests', value: '75' },
      { label: 'Turnaround', value: 'Instant' },
      { label: '5-Star Rating', value: '100%' },
    ],
    client: 'Rohan & Friends',
    featuredQuote: 'None of us had to look at our phones all night. Snap Shots captured every single magical second.',
  },
  {
    id: 'past-event-6',
    title: 'Golden Marigold Haldi & Floral Poolside',
    category: 'Weddings',
    location: 'Jaipur, Rajasthan',
    venue: 'Samode Haveli Courtyard',
    date: 'January 2025',
    imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1200&auto=format&fit=crop',
    tagline: 'Explosions of yellow petals, water splashes, and unfiltered bridal ecstasy.',
    description: 'An exuberant morning haldi celebration bursting with organic marigold showers, traditional dhol beats, and spontaneous pool jumps. Filmed with waterproof-cased gimbal phones for close-up action.',
    deliverables: ['8 Slow-Mo Haldi Splash Reels', 'Family Dhol Dance Reel', 'Bridal Floral Jewelry Focus', 'Story-Ready Teasers'],
    metrics: [
      { label: 'Petal Showers', value: '50kg' },
      { label: 'Same-Day Edits', value: '8' },
      { label: 'Views on IG', value: '980K' },
    ],
    client: 'Pooja & Dev',
    featuredQuote: 'The slow-motion petal showers looked straight out of a Bollywood dream sequence!',
  },
  {
    id: 'past-event-7',
    title: 'Amphitheatre Live Indie & Acoustic Nights',
    category: 'Concerts & Festivals',
    location: 'Pune, Maharashtra',
    venue: 'Open-Air Valley Amphitheatre',
    date: 'February 2025',
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop',
    tagline: 'Soulful acoustic sets, flashlight oceans, and intimate audience connections.',
    description: 'Live performance by indie singers under the stars. Capturing synchronized mobile phone flashlights, acoustic guitar solos, and artist-fan singalongs with crisp multi-track audio sync.',
    deliverables: ['6 Acoustic Soul Reels', 'Phone Flashlight Crowd Wave', 'Artist Q&A Snippets', 'Live Story Bundles'],
    metrics: [
      { label: 'Live Attendees', value: '3,500' },
      { label: 'Audio Sync', value: 'Pristine' },
      { label: 'Audio Trend Used', value: 'Original' },
    ],
    client: 'Soulwave Acoustics',
    featuredQuote: 'The crowd flashlights clip became our most-shared reel of the entire tour season.',
  },
  {
    id: 'past-event-8',
    title: 'Artisan Culinary & Specialty Brand Launch',
    category: 'Brand & Fashion',
    location: 'Indiranagar, Bengaluru',
    venue: 'Botanical Courtyard Kitchen',
    date: 'December 2024',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop',
    tagline: 'Sizzling pans, plating artistry, and sensory vertical food storytelling.',
    description: 'Launch event for a flagship artisanal dining destination. Macro food textures, flaming cocktail pours, chef interview bites, and VIP foodie reactions designed to ignite viral restaurant reservations.',
    deliverables: ['7 ASMR & Macro Food Reels', 'Flaming Cocktail Mixology Edit', 'Chef Masterclass Reel', 'Full Social Media Kit'],
    metrics: [
      { label: 'Reservations Booked', value: '+450%' },
      { label: 'Saves on IG', value: '18.4K' },
      { label: 'Reels Created', value: '7' },
    ],
    client: 'Verdant Artisan Bistro',
    featuredQuote: 'Our weekend tables were fully booked for the next two months right after the reels dropped.',
  },
];
