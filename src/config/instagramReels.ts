/**
 * ============================================================================
 * SNAP SHOTS - WORK THAT PERFORMS REELS CONFIGURATION
 * ============================================================================
 * Direct video links configured strictly to read the user's uploaded MP4
 * files from `/videos/` directory without Instagram reel links.
 * Exactly 5 slides: reel-1.mp4, reel-2.mp4, reel-3.mp4, reel-4.mp4, reel-5.mp4.
 */

export interface InstagramReelItem {
  title: string;
  category: string;
  url: string;
  client?: string;
  views?: string;
  duration?: string;
  posterUrl?: string;
  description?: string;
  videoUrl?: string;
}

export const instagramReels: InstagramReelItem[] = [
  {
    title: "Pastel Outdoor Celebration & Decor",
    category: "Event",
    url: "",
    videoUrl: "/videos/reel-1.mp4",
    client: "Snap Shots Utsav Coverage",
    views: "480K",
    duration: "0:25",
    description: "Outdoor celebration in cinematic 4K master grade with dramatic overhead illumination and floral decor.",
  },
  {
    title: "Sangeet Dance & Stage Fireworks",
    category: "Wedding",
    url: "",
    videoUrl: "/videos/reel-2.mp4",
    client: "Snap Shots Live Stage",
    views: "195K",
    duration: "0:26",
    description: "Electrifying Sangeet choreography with cold pyros and smooth cinematic gimbal glide.",
  },
  {
    title: "Streetwear Fashion Drop & Runway",
    category: "Brand Content",
    url: "",
    videoUrl: "/videos/reel-3.mp4",
    client: "KINETIC Apparel",
    views: "260K",
    duration: "0:18",
    description: "Urban runway aesthetics, quick-cut lookbook reels with heavy bass rhythm.",
  },
  {
    title: "Corporate Flagship Store Activation",
    category: "Corporate",
    url: "",
    videoUrl: "/videos/reel-4.mp4",
    client: "AURA Retail Opening",
    views: "180K",
    duration: "0:25",
    description: "VIP ribbon cutting, architectural walkthrough, and executive portraits in crisp 4K.",
  },
  {
    title: "Artisanal Coffee & Product Texture",
    category: "Product",
    url: "",
    videoUrl: "/videos/reel-5.mp4",
    client: "Velvet Roast Coffee",
    views: "120K",
    duration: "0:18",
    description: "Macro espresso extraction, steam wand textures, and aesthetic packaging reveals.",
  },
];
