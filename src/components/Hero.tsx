import React, { useRef } from 'react';
import { MapPin } from 'lucide-react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Portfolio } from './Portfolio';
import { ReelWorkItem } from '../types';

interface HeroProps {
  onBookClick?: () => void;
  onViewWorkClick?: () => void;
  onWatchReel?: (reel: ReelWorkItem) => void;
}

export const Hero: React.FC<HeroProps> = ({ onWatchReel, onBookClick }) => {
  const heroRef = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Track scroll progress of the hero section relative to viewport for subtle parallax depth
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  // Multi-layered subtle parallax drifts
  const yBackgroundGlow = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : 85]);
  const yHeadline = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : 30]);
  const opacityHeadline = useTransform(scrollYProgress, [0, 0.9], [1, shouldReduceMotion ? 1 : 0.85]);

  return (
    <section id="home" ref={heroRef} className="relative pt-24 sm:pt-28 md:pt-32 pb-4 sm:pb-6 overflow-hidden bg-transparent">
      {/* Background Ambient Glows with Subtle Parallax Float - Continuous Unified Backdrop */}
      <motion.div style={{ y: yBackgroundGlow }} className="pointer-events-none absolute inset-0 -z-10 overflow-hidden transform-gpu will-change-transform">
        <div
          className="absolute hidden lg:block"
          style={{
            width: '520px',
            height: '750px',
            top: '-120px',
            right: '-80px',
            borderRadius: '500px',
            background: 'radial-gradient(circle, rgba(189, 22, 22,0.22) 0%, rgba(117, 13, 13,0.08) 60%, transparent 80%)',
            filter: 'blur(90px)',
          }}
        />
        <div
          className="absolute hidden lg:block"
          style={{
            width: '600px',
            height: '700px',
            top: '40px',
            left: '-150px',
            borderRadius: '500px',
            background: 'radial-gradient(circle, rgba(189, 22, 22,0.16) 0%, rgba(30,30,35,0.3) 50%, transparent 80%)',
            filter: 'blur(100px)',
          }}
        />
        <div
          className="absolute pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: '850px',
            height: '520px',
            opacity: 0.16,
            borderRadius: '500px',
            background: 'radial-gradient(circle, #bd1616 0%, #300000 60%, transparent 80%)',
            filter: 'blur(120px)',
          }}
        />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Top Notice Pill & Main Headline with Subtle Drift & Fade Parallax */}
        <motion.div
          style={{ y: yHeadline, opacity: opacityHeadline }}
          className="text-center max-w-4xl mx-auto transform-gpu will-change-transform"
        >
          {/* Top Notice Pill */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#bd1616]/15 border border-[#bd1616]/30 shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-[#bd1616] animate-ping" />
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#bd1616]">
                Your Moments &bull; Our Snaps
              </span>
            </div>
          </div>

          <h1
            className="text-[34px] sm:text-[58px] lg:text-[68px] font-black text-white tracking-tight leading-[1.08]"
            id="hero-headline"
          >
            TURN YOUR MOMENTS{' '}
            <br className="hidden sm:block" />
            INTO{' '}
            <span className="relative inline-block ml-1.5 sm:ml-2">
              <span className="animate-white-red-gradient tracking-tight font-black inline-block">
                REELS.
              </span>
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="mt-5 text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed font-normal" id="hero-subheadline">
            Professional reels, photography and visual content created for events, brands, businesses and social media.
          </p>

          {/* Live Cities Notice */}
          <p className="mt-3 text-xs sm:text-sm font-medium text-zinc-400 inline-flex items-center justify-center gap-1.5 flex-wrap">
            Booking live in{' '}
            <span className="text-[#bd1616] font-bold inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#bd1616] fill-[#bd1616]/20 inline-block shrink-0" />
              Telangana, India &amp; USA
            </span>
          </p>
        </motion.div>

        {/* Combined Work Showcase Carousel - No Divider, Seamless Continuous Flow */}
        <div className="mt-6 sm:mt-8">
          <Portfolio
            onSelectReel={(reel) => onWatchReel?.(reel)}
            onBookShoot={() => onBookClick?.()}
          />
        </div>
      </div>
    </section>
  );
};
