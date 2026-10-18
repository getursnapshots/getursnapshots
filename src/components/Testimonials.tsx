import React from 'react';
import { Star, CheckCircle2, Quote, Sparkles, Heart } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { TestimonialItem } from '../types';

export const Testimonials: React.FC = () => {
  const testimonials = siteConfig.testimonials;

  // Split testimonials into 2 groups for the 2 scrolling slide rows
  const row1 = testimonials.slice(0, Math.ceil(testimonials.length / 2));
  const row2 = testimonials.slice(Math.ceil(testimonials.length / 2));

  // Duplicate items in each row for seamless infinite marquee loop
  const row1Items = [...row1, ...row1, ...row1];
  const row2Items = [...row2, ...row2, ...row2];

  const renderCard = (test: TestimonialItem, index: number, rowId: string) => (
    <div
      key={`${rowId}-${test.id}-${index}`}
      className="w-[330px] sm:w-[410px] shrink-0 rounded-3xl bg-zinc-950/90 border border-zinc-800/80 p-5 sm:p-6 shadow-xl hover:border-[#bd1616]/60 transition-all duration-300 flex flex-col justify-between group/card relative overflow-hidden"
    >
      {/* Top subtle highlight glow */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#bd1616]/30 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />

      <div>
        {/* Rating & Location Tag */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-1">
            {[...Array(test.rating)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-[#bd1616] text-[#bd1616]" />
            ))}
          </div>

          <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-semibold text-zinc-400">
            {test.location}
          </span>
        </div>

        {/* Event Name Tag */}
        <div className="text-xs font-bold text-[#ffc800] tracking-wide mb-2">
          {test.event}
        </div>

        {/* Quote Content */}
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal italic">
          {test.quote}
        </p>
      </div>

      {/* Author Footer */}
      <div className="mt-6 pt-4 border-t border-zinc-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={test.avatarUrl}
            alt={test.name}
            width={44}
            height={44}
            className="w-10 h-10 rounded-full object-cover border-2 border-[#bd1616]/80 shrink-0"
            loading="lazy"
            decoding="async"
          />
          <div>
            <div className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
              <span>{test.name}</span>
              {test.verified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#bd1616] shrink-0" />
              )}
            </div>
            <div className="text-[11px] text-zinc-400 truncate max-w-[200px]">{test.role}</div>
          </div>
        </div>

        <Quote className="w-6 h-6 text-zinc-800 group-hover/card:text-[#bd1616]/40 transition-colors pointer-events-none shrink-0" />
      </div>
    </div>
  );

  return (
    <section
      id="testimonials"
      className="py-14 sm:py-20 relative overflow-hidden bg-transparent text-white border-t border-zinc-900/80"
    >
      {/* Dynamic Keyframes for Left & Right Marquee Scrolling and Heartbeat */}
      <style>{`
        @keyframes scrollMarqueeLeft {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-33.333%, 0, 0); }
        }
        @keyframes scrollMarqueeRight {
          0% { transform: translate3d(-33.333%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        @keyframes heartbeat {
          0% { transform: scale(1); }
          14% { transform: scale(1.26); }
          28% { transform: scale(1); }
          42% { transform: scale(1.26); }
          70% { transform: scale(1); }
          100% { transform: scale(1); }
        }
        .animate-scroll-left {
          display: flex;
          gap: 1.25rem;
          width: max-content;
          will-change: transform;
          animation: scrollMarqueeLeft 34s linear infinite;
        }
        .animate-scroll-right {
          display: flex;
          gap: 1.25rem;
          width: max-content;
          will-change: transform;
          animation: scrollMarqueeRight 36s linear infinite;
        }
        .animate-heartbeat {
          animation: heartbeat 1.4s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
          transform-origin: center;
          display: inline-block;
          will-change: transform;
        }
        .animate-scroll-left:hover,
        .animate-scroll-right:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Ambient background glow */}
      <div
        className="absolute pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px]"
        style={{
          background: 'radial-gradient(circle, rgba(189, 22, 22, 0.12) 0%, rgba(18,18,20,0.8) 60%, transparent 80%)',
          filter: 'blur(120px)',
          zIndex: 0,
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-10 sm:mb-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#bd1616]/15 border border-[#bd1616]/30 mb-3 shadow-xs">
            <Heart className="w-3.5 h-3.5 text-[#bd1616] fill-[#bd1616] animate-heartbeat shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#bd1616]">
              WALL OF LOVE &amp; REVIEWS
            </span>
          </div>

          <h2
            className="text-center text-white font-black text-3xl sm:text-5xl tracking-tight leading-tight"
            id="testimonials-title"
          >
            Insights from Satisfied Clients
          </h2>

          <p className="mt-3 text-center text-zinc-300 font-normal text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Real stories from couples, brand founders, event hosts, and creators across Telangana &amp; USA.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-medium text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-[#bd1616] text-[#bd1616]" />
              <strong>4.9 / 5 Rating</strong> (500+ Shoots)
            </span>
            <span className="text-zinc-600 hidden sm:inline">&bull;</span>
            <span className="text-zinc-300">
              ⚡ <strong>2–4 Hr</strong> Same-Day Delivery
            </span>
            <span className="text-zinc-600 hidden sm:inline">&bull;</span>
            <span className="text-zinc-300">
              🎥 <strong>100%</strong> 4K RAW Clips Included
            </span>
          </div>
        </div>
      </div>

      {/* Dual Continuous Scrolling Slides (Row 1 Left, Row 2 Right) */}
      <div className="relative w-full overflow-hidden space-y-5">
        {/* Left & Right Edge Gradient Fade Masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-36 bg-gradient-to-r from-black via-black/80 to-transparent z-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-36 bg-gradient-to-l from-black via-black/80 to-transparent z-20" />

        {/* Row 1: Smooth Auto-Scroll to the LEFT */}
        <div className="w-full overflow-hidden flex cursor-grab active:cursor-grabbing">
          <div className="animate-scroll-left">
            {row1Items.map((test, idx) => renderCard(test, idx, 'row1'))}
          </div>
        </div>

        {/* Row 2: Smooth Auto-Scroll to the RIGHT */}
        <div className="w-full overflow-hidden flex cursor-grab active:cursor-grabbing">
          <div className="animate-scroll-right">
            {row2Items.map((test, idx) => renderCard(test, idx, 'row2'))}
          </div>
        </div>
      </div>

      {/* Helpful Hint */}
      <div className="text-center mt-6 relative z-10">
        <span className="text-[11px] text-zinc-500 font-medium">
          Hover over any card to pause and read
        </span>
      </div>
    </section>
  );
};
