import React, { useState } from 'react';
import { Sparkles, ArrowUpRight, CheckCircle2, Clock, MessageSquare, ShieldCheck, Film, Camera } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { ServiceItem } from '../types';

interface ServicesPageProps {
  onBookService: (serviceTitle: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onBookService }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  const categories = [
    'All',
    'Events',
    'Weddings',
    'Private',
    'Corporate',
    'E-Commerce',
    'Branding',
    'Creators',
    'Cinema',
    'Stills',
  ];

  const filteredServices =
    selectedFilter === 'All'
      ? siteConfig.services
      : siteConfig.services.filter((s) => s.category.toLowerCase() === selectedFilter.toLowerCase());

  const handleWhatsAppInquiry = (serviceTitle: string) => {
    const text = encodeURIComponent(
      `Hi Snap Shots, I would like to enquire about your ${serviceTitle} service.`
    );
    window.open(`https://wa.me/${siteConfig.business.whatsapp.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  return (
    <div className="pt-24 sm:pt-28 pb-20 bg-transparent min-h-screen text-white">
      {/* Background Ambient Glow */}
      <div
        className="absolute pointer-events-none top-20 left-1/2 -translate-x-1/2"
        style={{
          width: '750px',
          height: '400px',
          opacity: 0.16,
          borderRadius: '500px',
          background: 'radial-gradient(circle, #bd1616 0%, #200000 60%, transparent 80%)',
          filter: 'blur(110px)',
          zIndex: 0,
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#bd1616]/15 border border-[#bd1616]/30 mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#bd1616]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#bd1616]">
              OUR SPECIALIZED SERVICES
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
            Cinematic Visual Storytelling Built For Every Occasion
          </h1>

          <p className="mt-4 text-base sm:text-lg text-zinc-300 font-normal leading-relaxed">
            From high-energy celebration reels and royal wedding highlights to high-converting product videos and brand campaigns. Shot on location with same-day delivery.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#bd1616]" />
              Same-Day Turnaround (2–6 Hours)
            </span>
            <span className="text-zinc-600 hidden sm:inline">&bull;</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#bd1616]" />
              Certified &amp; Trained Reel-Makers
            </span>
            <span className="text-zinc-600 hidden sm:inline">&bull;</span>
            <span className="flex items-center gap-1.5">
              <Film className="w-4 h-4 text-[#bd1616]" />
              Full 4K Raw Clips Access
            </span>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar py-1 px-2 -mx-4 sm:mx-0 sm:px-0 sm:flex-wrap gap-2 w-full touch-pan-y">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedFilter(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer shrink-0 ${
                  selectedFilter === cat
                    ? 'bg-[#bd1616] text-white shadow-md shadow-[#bd1616]/30 font-bold scale-105'
                    : 'bg-zinc-900/90 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredServices.map((service: ServiceItem, idx: number) => (
            <div
              key={service.id}
              className="group relative bg-zinc-950/90 rounded-3xl border border-zinc-800/90 hover:border-[#bd1616]/60 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xl hover:shadow-2xl hover:shadow-[#bd1616]/10"
            >
              {/* Top Image Preview with Soft Gradient */}
              <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-zinc-900">
                <img
                  src={service.image}
                  alt={service.title}
                  loading={idx < 3 ? 'eager' : 'lazy'}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

                {/* Top Category Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-xs font-bold text-white border border-white/10 uppercase tracking-wider">
                    {service.category}
                  </span>
                </div>

                {/* Instant Delivery Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <span className="px-2.5 py-1 rounded-full bg-[#bd1616]/90 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-wider">
                    Same-Day Delivery
                  </span>
                </div>
              </div>

              {/* Service Info Content */}
              <div className="p-6 sm:p-7 flex flex-col flex-grow justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-white transition-colors">
                    {service.title}
                  </h3>
                  <p className="mt-1.5 text-xs sm:text-sm font-medium text-[#ffc800]">
                    {service.tagline}
                  </p>
                  <p className="mt-3 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Deliverables List */}
                  <div className="mt-5 pt-4 border-t border-zinc-900">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-2.5">
                      Included Deliverables:
                    </span>
                    <ul className="space-y-2">
                      {service.deliverables.map((item, dIdx) => (
                        <li key={dIdx} className="flex items-center gap-2 text-xs text-zinc-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#bd1616] shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tags */}
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] font-medium text-zinc-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-7 pt-4 border-t border-zinc-900 flex flex-col sm:flex-row items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => onBookService(service.title)}
                    className="w-full sm:flex-1 h-11 flex items-center justify-center gap-2 rounded-full bg-[#bd1616] hover:bg-[#9e1212] active:bg-[#750d0d] text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#bd1616]/30 transition-all hover:scale-[1.02] active:scale-[0.98] border border-[#9e1212] cursor-pointer"
                  >
                    <span>BOOK THIS SERVICE</span>
                    <ArrowUpRight className="w-4 h-4 text-white" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleWhatsAppInquiry(service.title)}
                    className="w-full sm:w-auto h-11 px-4 flex items-center justify-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    title="Enquire on WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4 text-[#ffc800]" />
                    <span className="sm:hidden">WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Shoot Consultation Banner */}
        <div className="mt-16 sm:mt-20 p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 text-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <span className="px-3.5 py-1 rounded-full bg-[#bd1616]/20 border border-[#bd1616]/40 text-[#bd1616] text-xs font-bold uppercase tracking-wider mb-4 inline-block">
              Custom &amp; Multi-Day Productions
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Need a Tailored Package or Multi-City Shoot?
            </h2>
            <p className="mt-3 text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
              We provide multi-cam setups, full-day festival coverage, and corporate enterprise media retained packages across Telangana &amp; USA.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onBookService('Custom Package')}
                className="w-full sm:w-auto h-12 px-8 flex items-center justify-center gap-2 rounded-full bg-[#bd1616] hover:bg-[#9e1212] text-xs font-bold uppercase tracking-wider text-white shadow-xl shadow-[#bd1616]/40 transition-all cursor-pointer"
              >
                <span>REQUEST CUSTOM QUOTE</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <a
                href={`https://wa.me/${siteConfig.business.whatsapp.replace(/[^0-9]/g, '')}?text=Hi%20Snap%20Shots%2C%20I%20need%20a%20custom%20shoot%20package.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto h-12 px-8 flex items-center justify-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-[#ffc800]" />
                <span>CHAT WITH US</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
