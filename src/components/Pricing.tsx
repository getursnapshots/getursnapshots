import React, { useState } from 'react';
import { Check, Sparkles, ArrowUpRight, ShieldCheck, Heart } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { PackageItem } from '../types';
import { useCountry } from '../context/CountryContext';
import { AnimatedPriceCountdown } from './AnimatedPriceCountdown';
import { OfferCountdownTimer } from './OfferCountdownTimer';

interface PricingProps {
  onSelectPackage: (packageId: string) => void;
}

export const Pricing: React.FC<PricingProps> = ({ onSelectPackage }) => {
  const [activeTab, setActiveTab] = useState<'standard' | 'wedding'>('standard');
  const {
    country,
    setCountry,
    getPackagePrice,
    getPackageOriginalPrice,
    getPackagePriceNum,
    getPackageOriginalPriceNum,
    countryConfig,
  } = useCountry();

  return (
    <section id="pricing" className="bg-transparent py-10 sm:py-14 relative overflow-hidden border-y border-zinc-900/80">
      {/* Background radial glow */}
      <div
        className="absolute pointer-events-none top-0 right-1/4 w-[500px] h-[500px]"
        style={{
          background: 'radial-gradient(circle, rgba(189, 22, 22,0.18) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header (Exact hierarchy from reference screenshots) */}
        <div className="text-center max-w-3xl mx-auto">
          <p className="uppercase text-[#bd1616] font-bold text-xs sm:text-sm tracking-widest">PRICING</p>
          <h2
            className="mt-2 text-center text-white font-extrabold text-3xl sm:text-5xl tracking-tight leading-tight"
            id="pricing-title"
          >
            Pick Your Plan
          </h2>
          <p className="mt-3 text-center text-zinc-300 font-normal text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            From a quick hour shoot to a full wedding package - we&apos;ve got you covered.
          </p>

          {/* Controls: Region Selector & Standard vs Wedding & Select Package Tabs */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 flex-wrap">
            {/* Country Switcher (India vs USA) */}
            <div className="inline-flex items-center gap-1 p-1 rounded-full bg-zinc-950 border border-zinc-800 shadow-inner max-w-full overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 pl-3 pr-1 shrink-0">
                Region:
              </span>
              <button
                type="button"
                onClick={() => setCountry('IN')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  country === 'IN'
                    ? 'bg-[#bd1616] text-white shadow-md shadow-[#bd1616]/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
                id="pricing-toggle-in"
              >
                <span>🇮🇳</span>
                <span>India (₹ INR)</span>
              </button>
              <button
                type="button"
                onClick={() => setCountry('US')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  country === 'US'
                    ? 'bg-[#bd1616] text-white shadow-md shadow-[#bd1616]/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
                id="pricing-toggle-us"
              >
                <span>🇺🇸</span>
                <span>USA ($ USD)</span>
              </button>
            </div>

            {/* Switcher tabs: Standard Packages vs Wedding & Select Package */}
            <div className="inline-flex items-center gap-1.5 p-1 rounded-full bg-zinc-900 border border-zinc-800 shadow-xs max-w-full overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab('standard')}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activeTab === 'standard'
                    ? 'bg-[#bd1616] text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Standard Packages
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('wedding')}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activeTab === 'wedding'
                    ? 'bg-[#bd1616] text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Wedding &amp; Select Package
              </button>
            </div>
          </div>

          {/* Live Limited-Time Offer Countdown Ticker */}
          <div className="mt-8 flex items-center justify-center">
            <OfferCountdownTimer />
          </div>
        </div>

        {/* 3 Package Cards Grid (or Wedding View if selected) */}
        {activeTab === 'standard' ? (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-6xl mx-auto">
            {siteConfig.packages.map((pkg: PackageItem) => {
              const isHighlight = pkg.isPopular;

              return (
                <div
                  key={pkg.id}
                  className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 ${
                    isHighlight
                      ? 'bg-zinc-950 border-2 border-[#bd1616] shadow-2xl shadow-[#bd1616]/20 md:-translate-y-2'
                      : 'bg-zinc-950 border border-zinc-800 shadow-xl hover:border-zinc-700'
                  }`}
                  id={`package-card-${pkg.id}`}
                >
                  {/* Popular Badge */}
                  {isHighlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#bd1616] text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md flex items-center gap-1 border border-[#9e1212]">
                      <Sparkles className="w-3 h-3 text-white" />
                      <span>{pkg.badge || 'Most Popular'}</span>
                    </div>
                  )}

                  <div>
                    {/* Plan Title */}
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">{pkg.name}</h3>

                    {/* Cut Offer Price Section with Countdown Animation */}
                    <div className="mt-3 pb-4 border-b border-zinc-800">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg sm:text-xl font-bold text-zinc-500 line-through decoration-[#bd1616] decoration-2">
                          {getPackageOriginalPrice(pkg.id)}
                        </span>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#bd1616] bg-[#bd1616]/15 border border-[#bd1616]/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#bd1616] animate-ping" />
                          Price Drop
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <AnimatedPriceCountdown
                          key={`${pkg.id}-${country}`}
                          startPrice={getPackageOriginalPriceNum(pkg.id)}
                          targetPrice={getPackagePriceNum(pkg.id)}
                          currencySymbol={countryConfig.symbol}
                          currencyCode={countryConfig.currency}
                          countDirection="down"
                          duration={1600}
                          className="text-3xl sm:text-4xl"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <p className="mt-4 text-xs sm:text-sm text-zinc-300 leading-relaxed min-h-[38px]">
                      {pkg.tagline}
                    </p>

                    {/* Action Button: "Select this plan ↗" */}
                    <div className="mt-5">
                      <button
                        type="button"
                        onClick={() => onSelectPackage(pkg.id)}
                        className="w-full h-11 rounded-full text-xs sm:text-sm font-bold tracking-wide flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer bg-[#bd1616] hover:bg-[#9e1212] active:bg-[#750d0d] text-white shadow-md hover:shadow-lg hover:shadow-[#bd1616]/30 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <span>Select this plan</span>
                        <ArrowUpRight className="w-4 h-4 text-white" />
                      </button>
                    </div>

                    {/* What's Included Deliverables Checklist */}
                    <div className="mt-6 pt-5 border-t border-zinc-800 space-y-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        What&apos;s included
                      </p>
                      {pkg.deliverables.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                          <span className="flex-shrink-0 mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#bd1616]/20 border border-[#bd1616]/40 text-[#bd1616]">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                          <span className="font-medium leading-tight">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Wedding & Select Package Dedicated Showcase */
          <div className="mt-12 max-w-4xl mx-auto rounded-3xl bg-zinc-950 p-6 sm:p-10 border-2 border-[#bd1616] shadow-2xl shadow-[#bd1616]/20 text-white relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#bd1616]/15 border border-[#bd1616]/40 text-[#bd1616] text-xs font-bold uppercase tracking-wider">
                  <Heart className="w-3.5 h-3.5 fill-[#bd1616]" />
                  <span>Grand Celebrations &amp; Weddings</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Wedding &amp; Select Package
                </h3>
                <p className="text-zinc-300 text-sm leading-relaxed">
                  Comprehensive multi-angle coverage for pre-wedding, sangeet, haldi, wedding ceremony, and grand reception. Includes lead creative director, drone shots, fast express reels, and master-graded raw 4K footage.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300 pt-2">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#bd1616] shrink-0" />
                    <span>Lead Storyteller + Assistant Rig</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#bd1616] shrink-0" />
                    <span>Same-Night Highlights Reel</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#bd1616] shrink-0" />
                    <span>Full 4K Uncompressed Raw Vault</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#bd1616] shrink-0" />
                    <span>iPhone 16 Pro Max + Cinema Hybrid</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center md:items-end shrink-0 w-full md:w-auto">
                <span className="text-xs text-zinc-400 uppercase tracking-wider">Tailored Custom Plan</span>
                <span className="text-2xl sm:text-3xl font-black text-white mt-1">Custom Quote</span>
                <span className="text-xs text-zinc-400 mt-0.5">Based on event days &amp; scale</span>
                <button
                  type="button"
                  onClick={() => onSelectPackage('wedding-select')}
                  className="mt-6 w-full md:w-auto px-8 h-12 rounded-full bg-[#bd1616] hover:bg-[#9e1212] active:bg-[#750d0d] text-sm font-bold uppercase tracking-wider text-white shadow-xl shadow-[#bd1616]/30 flex items-center justify-center gap-2.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>Select Wedding Plan</span>
                  <ArrowUpRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Button from Screenshot 3: Explore Wedding & Select Package */}
        <div className="mt-10 sm:mt-12 flex justify-center">
          <button
            type="button"
            onClick={() => onSelectPackage('wedding-select')}
            className="w-full sm:w-auto h-12 px-8 rounded-full text-sm font-bold tracking-wider flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer bg-[#bd1616] hover:bg-[#9e1212] active:bg-[#750d0d] text-white shadow-xl shadow-[#bd1616]/30 hover:shadow-2xl hover:shadow-[#bd1616]/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Explore Wedding &amp; Select Package</span>
            <ArrowUpRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </section>
  );
};
