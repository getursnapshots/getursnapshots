import React from 'react';
import { Sparkles, Award, Star } from 'lucide-react';

interface BrandLogoItem {
  name: string;
  category: string;
  svg: React.ReactNode;
}

export const ClientLogosSection: React.FC = () => {
  const brandLogos: BrandLogoItem[] = [
    {
      name: 'Sony Music',
      category: 'Music & Concerts',
      svg: (
        <svg viewBox="0 0 140 32" className="h-7 w-auto fill-current" xmlns="http://www.w3.org/2000/svg">
          <text x="0" y="24" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="22" letterSpacing="2">SONY</text>
          <text x="74" y="24" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="400" fontSize="13" letterSpacing="4" fill="#bd1616">MUSIC</text>
        </svg>
      ),
    },
    {
      name: 'Red Bull',
      category: 'Sports & Energy',
      svg: (
        <svg viewBox="0 0 130 32" className="h-7 w-auto fill-current" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="12" fill="#bd1616" fillOpacity="0.2" stroke="#bd1616" strokeWidth="2" />
          <path d="M10 16 L22 16 M16 10 L22 16 L16 22" stroke="#bd1616" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <text x="36" y="22" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="18" letterSpacing="1">RED BULL</text>
        </svg>
      ),
    },
    {
      name: 'WeddingWire',
      category: 'Weddings',
      svg: (
        <svg viewBox="0 0 160 32" className="h-7 w-auto fill-current" xmlns="http://www.w3.org/2000/svg">
          <text x="0" y="23" fontFamily="Georgia, serif" fontWeight="700" fontSize="20" fontStyle="italic">Wedding<tspan fill="#bd1616">Wire</tspan></text>
        </svg>
      ),
    },
    {
      name: 'Spotify',
      category: 'Music Sessions',
      svg: (
        <svg viewBox="0 0 120 32" className="h-7 w-auto fill-current" xmlns="http://www.w3.org/2000/svg">
          <circle cx="14" cy="16" r="10" fill="#bd1616" />
          <path d="M8 13 Q14 11 20 13 M9 16 Q14 14.5 19 16 M10 19 Q14 18 18 19" stroke="#000" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <text x="32" y="23" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="18" letterSpacing="0.5">Spotify</text>
        </svg>
      ),
    },
    {
      name: 'Lakmé Fashion Week',
      category: 'Fashion & Runway',
      svg: (
        <svg viewBox="0 0 150 32" className="h-7 w-auto fill-current" xmlns="http://www.w3.org/2000/svg">
          <text x="0" y="22" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="300" fontSize="19" letterSpacing="5">LAKMÉ</text>
        </svg>
      ),
    },
    {
      name: 'Hyatt Events',
      category: 'Luxury Hospitality',
      svg: (
        <svg viewBox="0 0 110 32" className="h-7 w-auto fill-current" xmlns="http://www.w3.org/2000/svg">
          <text x="0" y="23" fontFamily="serif" fontWeight="700" fontSize="22" letterSpacing="3">HYATT</text>
        </svg>
      ),
    },
    {
      name: 'Amazon Prime',
      category: 'OTT & Originals',
      svg: (
        <svg viewBox="0 0 130 32" className="h-7 w-auto fill-current" xmlns="http://www.w3.org/2000/svg">
          <text x="0" y="20" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="18" letterSpacing="1">prime<tspan fill="#bd1616">video</tspan></text>
          <path d="M2 27 Q30 33 60 27" stroke="#bd1616" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      name: 'Puma Club',
      category: 'Lifestyle & Fitness',
      svg: (
        <svg viewBox="0 0 100 32" className="h-7 w-auto fill-current" xmlns="http://www.w3.org/2000/svg">
          <text x="0" y="23" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="21" fontStyle="italic" letterSpacing="2">PUMA</text>
        </svg>
      ),
    },
    {
      name: 'Zara Lifestyle',
      category: 'Fashion Lookbooks',
      svg: (
        <svg viewBox="0 0 100 32" className="h-7 w-auto fill-current" xmlns="http://www.w3.org/2000/svg">
          <text x="0" y="24" fontFamily="Didot, 'Bodoni MT', serif" fontWeight="700" fontSize="26" letterSpacing="-2">ZARA</text>
        </svg>
      ),
    },
    {
      name: 'GQ Media',
      category: 'Editorial & Celebrity',
      svg: (
        <svg viewBox="0 0 80 32" className="h-7 w-auto fill-current" xmlns="http://www.w3.org/2000/svg">
          <text x="0" y="24" fontFamily="Impact, 'Arial Black', sans-serif" fontWeight="900" fontSize="28" letterSpacing="2" fill="#bd1616">GQ</text>
        </svg>
      ),
    },
  ];

  return (
    <section id="logos-section" className="py-8 sm:py-10 bg-black/60 border-y border-zinc-900/90 relative overflow-hidden">
      {/* Background radial gradient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[300px] rounded-full pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(189,22,22,0.3) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 rounded-full bg-[#bd1616] animate-pulse" />
            <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.2em] text-zinc-300">
              TRUSTED BY 250+ LEADING BRANDS, CREATORS &amp; EVENT ORGANIZERS
            </h3>
          </div>

          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <div className="flex items-center gap-1 text-[#bd1616]">
              <Star className="w-3.5 h-3.5 fill-[#bd1616]" />
              <Star className="w-3.5 h-3.5 fill-[#bd1616]" />
              <Star className="w-3.5 h-3.5 fill-[#bd1616]" />
              <Star className="w-3.5 h-3.5 fill-[#bd1616]" />
              <Star className="w-3.5 h-3.5 fill-[#bd1616]" />
            </div>
            <span className="font-semibold text-zinc-300">4.9/5 Rating across 450+ Shoots</span>
          </div>
        </div>

        {/* Infinite Sliding Marquee */}
        <div className="relative w-full overflow-hidden mask-fade-edges py-2">
          {/* Gradient Masks on Left & Right */}
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-black via-black/80 to-transparent z-10 pointer-events-none" />

          {/* Marquee Track (Double loop for seamless scroll) */}
          <div className="flex items-center gap-10 sm:gap-14 animate-marquee whitespace-nowrap will-change-transform">
            {[...brandLogos, ...brandLogos].map((brand, idx) => (
              <div
                key={`${brand.name}-${idx}`}
                className="group inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 hover:border-[#bd1616]/60 transition-all duration-300 hover:scale-105 shrink-0"
              >
                <div className="text-zinc-400 group-hover:text-white transition-colors">
                  {brand.svg}
                </div>
                <span className="hidden md:inline-block text-[10px] font-semibold tracking-wider uppercase text-zinc-400 group-hover:text-zinc-300 border-l border-zinc-800 pl-3">
                  {brand.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mini Highlights Metric Row */}
        <div className="mt-8 pt-6 border-t border-zinc-900/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-900">
            <div className="text-lg sm:text-xl font-black text-white">450+</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Events &amp; Shoots Captured</div>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-900">
            <div className="text-lg sm:text-xl font-black text-[#bd1616]">99.8%</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">On-Time Same Day Delivery</div>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-900">
            <div className="text-lg sm:text-xl font-black text-white">12M+</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Reel Views Generated</div>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-900">
            <div className="text-lg sm:text-xl font-black text-[#bd1616]">100%</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Cinema-Grade 4K Color Grade</div>
          </div>
        </div>
      </div>
    </section>
  );
};
