import React, { useState } from 'react';
import {
  Instagram,
  BadgeCheck,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { ReelWorkItem } from '../types';

interface InstagramProfileSectionProps {
  onBookClick?: () => void;
  onSelectReel?: (reel: ReelWorkItem) => void;
}

export const InstagramProfileSection: React.FC<InstagramProfileSectionProps> = ({
  onBookClick,
}) => {
  const [avatarFailed, setAvatarFailed] = useState(false);

  const instagramUrl = siteConfig.business.instagram || 'https://www.instagram.com/getursnapshots/';
  const instagramHandle = siteConfig.business.instagramHandle || '@getursnapshots';

  return (
    <section
      id="instagram-profile"
      aria-label="Snap Shots Instagram Profile"
      className="relative py-10 sm:py-14 bg-transparent overflow-hidden"
    >
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <p className="text-xs sm:text-sm font-bold tracking-widest uppercase text-[#bd1616]">
            Official Instagram
          </p>
          <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold text-white tracking-tight [text-wrap:balance]">
            Follow Our Latest Reels &amp; Drops
          </h2>
          <p className="mt-2.5 text-sm sm:text-base text-zinc-400 leading-relaxed">
            Daily behind-the-scenes, express event edits, and creator highlights straight from{' '}
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-semibold hover:text-[#ffc800] transition-colors underline decoration-zinc-700 underline-offset-4"
            >
              {instagramHandle}
            </a>
            .
          </p>
        </div>

        {/* Single-Elevation Dark Instagram Profile Container */}
        <div className="rounded-3xl bg-zinc-950/95 border border-zinc-800/90 shadow-2xl shadow-black/60 overflow-hidden">
          {/* Profile Header */}
          <div className="p-5 sm:p-8 lg:p-10">
            <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
              {/* Studio Avatar with Signature Gradient Ring */}
              <div className="flex items-center gap-5 md:block shrink-0">
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open Snap Shots Instagram profile"
                  className="relative block w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full p-[3px] bg-gradient-to-tr from-[#ffc800] via-[#bd1616] to-[#e1306c] shrink-0 transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bd1616] focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                >
                  <div className="w-full h-full rounded-full bg-black p-1 flex items-center justify-center overflow-hidden">
                    {!avatarFailed ? (
                      <img
                        src="/favicon.png"
                        alt="Snap Shots Instagram profile picture"
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onError={() => setAvatarFailed(true)}
                        className="w-full h-full object-contain rounded-full bg-black"
                      />
                    ) : (
                      <span className="text-lg sm:text-xl font-black tracking-tight text-white">
                        SS
                      </span>
                    )}
                  </div>
                </a>

                {/* Mobile-only compact stats alongside avatar */}
                <div className="grid grid-cols-3 gap-3 flex-1 md:hidden text-center">
                  <div>
                    <div className="text-lg font-extrabold text-white tabular-nums">50+</div>
                    <div className="text-[11px] text-zinc-400">Reels</div>
                  </div>
                  <div>
                    <div className="text-lg font-extrabold text-white tabular-nums">15+</div>
                    <div className="text-[11px] text-zinc-400">Shoots</div>
                  </div>
                  <div>
                    <div className="text-lg font-extrabold text-[#ffc800] tabular-nums">4.5★</div>
                    <div className="text-[11px] text-zinc-400">Rating</div>
                  </div>
                </div>
              </div>

              {/* Profile Details & Actions */}
              <div className="flex-1 min-w-0 space-y-4">
                {/* Handle + Primary & Secondary Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xl sm:text-2xl font-extrabold text-white tracking-tight hover:text-[#ffc800] transition-colors truncate"
                    >
                      getursnapshots
                    </a>
                    <BadgeCheck
                      className="w-5 h-5 text-[#3897f0] shrink-0"
                      aria-label="Official Snap Shots Account"
                    />
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      id="instagram-profile-follow-btn"
                      className="h-11 sm:h-10 px-5 rounded-full bg-[#bd1616] hover:bg-[#9e1212] active:bg-[#750d0d] text-white text-xs sm:text-sm font-bold tracking-wide inline-flex items-center justify-center gap-2 shadow-lg shadow-[#bd1616]/25 transition-all duration-200 active:scale-[0.98] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bd1616] focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                    >
                      <Instagram className="w-4 h-4 shrink-0" />
                      <span>Follow</span>
                      <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                    </a>

                    {onBookClick && (
                      <button
                        type="button"
                        onClick={onBookClick}
                        id="instagram-profile-book-btn"
                        className="h-11 sm:h-10 px-5 rounded-full bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-white text-xs sm:text-sm font-bold tracking-wide inline-flex items-center justify-center transition-colors duration-200 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                      >
                        Book a Shoot
                      </button>
                    )}
                  </div>
                </div>

                {/* Desktop Tabular Stats Row (Clean unboxed typography) */}
                <div className="hidden md:flex items-center gap-7 text-sm text-zinc-300">
                  <div>
                    <span className="font-extrabold text-white tabular-nums">50+</span>{' '}
                    <span className="text-zinc-400">Reels Delivered</span>
                  </div>
                  <span className="text-zinc-700" aria-hidden="true">·</span>
                  <div>
                    <span className="font-extrabold text-white tabular-nums">15+</span>{' '}
                    <span className="text-zinc-400">Shoots Completed</span>
                  </div>
                  <span className="text-zinc-700" aria-hidden="true">·</span>
                  <div>
                    <span className="font-extrabold text-[#ffc800] tabular-nums">4.5★</span>{' '}
                    <span className="text-zinc-400">Client Rating</span>
                  </div>
                </div>

                {/* Bio Copy */}
                <div className="space-y-1 text-sm leading-relaxed">
                  <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5">
                    <span className="font-extrabold text-white">{siteConfig.business.name}</span>
                    <span className="text-zinc-600" aria-hidden="true">·</span>
                    <span className="text-zinc-400 text-xs sm:text-sm font-medium">
                      Visual Media Studio
                    </span>
                  </div>
                  <p className="text-zinc-300 text-xs sm:text-sm max-w-2xl">
                    Your Moments &bull; Our Snaps. Certified Reel Makers for weddings, events,
                    brands &amp; creators — shot in 4K with same-day delivery.
                  </p>
                  <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 pt-0.5 text-xs text-zinc-400">
                    <span>Telangana, India &amp; USA</span>
                    <span className="text-zinc-700" aria-hidden="true">/</span>
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#ffc800] hover:text-white font-semibold transition-colors inline-flex items-center gap-1"
                    >
                      <span>instagram.com/getursnapshots</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
