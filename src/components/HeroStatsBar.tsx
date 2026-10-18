import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { useCountry } from '../context/CountryContext';
import { AnimatedStatCounter } from './AnimatedStatCounter';

export const HeroStatsBar: React.FC = () => {
  const { startingPriceLabel } = useCountry();

  return (
    <section id="metrics" className="relative py-10 sm:py-14 bg-transparent overflow-hidden">
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Key Metrics Bar (Counts up dynamically when scrolled into view) */}
        <div className="flex justify-center">
          <div
            className="grid w-full max-w-3xl grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 px-1"
            id="hero-stats"
          >
            {siteConfig.stats.map((stat, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center justify-center bg-zinc-900/90 text-center py-4 sm:py-6 px-4 rounded-2xl border border-zinc-800 shadow-xs cursor-default select-none"
              >
                <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                  <AnimatedStatCounter
                    value={stat.value}
                    duration={1800}
                    className="bg-gradient-to-r from-white via-zinc-200 to-red-300 bg-clip-text text-transparent inline-block font-extrabold"
                  />
                </div>
                <div className="text-xs sm:text-sm font-medium text-zinc-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badges Bar (Single In-Line Row) */}
        <div className="mt-10 sm:mt-12 pt-6 border-t border-zinc-800/80 flex flex-nowrap items-center justify-start lg:justify-center gap-x-5 sm:gap-x-6 overflow-x-auto no-scrollbar whitespace-nowrap text-xs text-zinc-400 px-2 sm:px-0 py-1">
          <div className="shrink-0 flex items-center gap-1.5 whitespace-nowrap">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#bd1616]" />
            <span>Trained &amp; Certified Reel-Makers</span>
          </div>
          <span className="text-zinc-700 hidden sm:inline select-none">&bull;</span>
          <div className="shrink-0 flex items-center gap-1.5 whitespace-nowrap">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#bd1616]" />
            <span>Same-Day Instant Delivery</span>
          </div>
          <span className="text-zinc-700 hidden sm:inline select-none">&bull;</span>
          <div className="shrink-0 flex items-center gap-1.5 whitespace-nowrap">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#bd1616]" />
            <span>Full 4K Raw Footage Access</span>
          </div>
          <span className="text-zinc-700 hidden sm:inline select-none">&bull;</span>
          <div className="shrink-0 flex items-center gap-1.5 whitespace-nowrap">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#bd1616]" />
            <span>Transparent Pricing from {startingPriceLabel}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
