import React, { useState } from 'react';
import { ArrowUpRight, MessageSquare, Sparkles } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { useCountry } from '../context/CountryContext';

interface CTAProps {
  onBookClick: () => void;
}

export const CTA: React.FC<CTAProps> = ({ onBookClick }) => {
  const { startingPriceLabel } = useCountry();
  const [isWhatsAppPinging, setIsWhatsAppPinging] = useState(false);

  const handleWhatsAppClick = () => {
    setIsWhatsAppPinging(false);
    requestAnimationFrame(() => {
      setIsWhatsAppPinging(true);
      setTimeout(() => setIsWhatsAppPinging(false), 900);
    });
  };

  return (
    <section className="bg-transparent py-10 sm:py-14 relative overflow-hidden" id="cta-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[28px] sm:rounded-[40px] bg-gradient-to-br from-black via-zinc-950 to-zinc-900 p-6 sm:p-14 lg:p-16 text-center text-white shadow-2xl border border-zinc-800 overflow-hidden">
          {/* Ambient red radial gradient */}
          <div
            className="absolute pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(189, 22, 22, 0.2) 0%, rgba(189, 22, 22, 0.06) 50%, transparent 75%)',
              filter: 'blur(90px)',
            }}
          />

          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#bd1616]/15 text-[#bd1616] text-xs font-bold uppercase tracking-wider border border-[#bd1616]/30 mb-5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Limited Availability This Weekend</span>
            </div>

            <h2 className="text-2xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
              READY TO MAKE YOUR <br className="hidden sm:inline" />
              <span className="bg-[#bd1616] text-white px-4 py-1 rounded-2xl inline-block shadow-lg mt-1 border border-[#9e1212]">
                NEXT REEL?
              </span>
            </h2>

            <p className="mt-4 text-zinc-300 text-sm sm:text-lg max-w-xl mx-auto leading-relaxed">
              Join thousands of creators, couples, and brands who trust Snap Shots to capture life’s best moments in high-impact vertical video.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={onBookClick}
                className="w-full sm:w-auto h-12 px-8 rounded-full bg-[#bd1616] hover:bg-[#9e1212] active:bg-[#750d0d] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#bd1616]/30 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-[#9e1212]"
                id="cta-book-btn"
              >
                <span>BOOK A SHOOT</span>
                <ArrowUpRight className="w-4 h-4 text-white" />
              </button>

              <a
                href={`https://wa.me/${siteConfig.business.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(siteConfig.business.whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWhatsAppClick}
                className="relative w-full sm:w-auto h-12 px-7 rounded-full bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 text-white hover:text-[#bd1616] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 border border-zinc-700 hover:border-[#bd1616] shadow-lg shadow-black/40 cursor-pointer"
                id="cta-whatsapp-btn"
              >
                {isWhatsAppPinging && (
                  <>
                    <span className="absolute inset-0 rounded-full bg-[#bd1616] animate-ping opacity-60 pointer-events-none" />
                    <span className="absolute -inset-1 rounded-full border border-[#bd1616] animate-ping opacity-40 pointer-events-none" />
                  </>
                )}
                <MessageSquare className="w-4 h-4 text-[#bd1616] relative z-10" />
                <span className="relative z-10">WHATSAPP US</span>
              </a>
            </div>

            <p className="mt-6 text-zinc-500 text-xs">
              Packages start from just {startingPriceLabel} &bull; Delivered same-day in 2–6 hours
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
