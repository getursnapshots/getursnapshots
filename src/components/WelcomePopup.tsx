import React, { useState, useEffect } from 'react';
import { X, Sparkles, ArrowUpRight, MessageSquare, Copy, Check, Film, Clock } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { useCountry } from '../context/CountryContext';

interface WelcomePopupProps {
  onClaimOffer: () => void;
}

const PROMO_CODE = 'SNAP15';

export const WelcomePopup: React.FC<WelcomePopupProps> = ({ onClaimOffer }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [isWhatsAppPinging, setIsWhatsAppPinging] = useState(false);
  const { countryConfig } = useCountry();

  useEffect(() => {
    try {
      if (sessionStorage.getItem('snapshots_welcome_dismissed')) {
        return;
      }
    } catch {}

    // Trigger popup smoothly 1200ms after website load
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Lock body scroll when popup is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleDismiss = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem('snapshots_welcome_dismissed', 'true');
    } catch {}
  };

  const handleClaim = () => {
    handleDismiss();
    onClaimOffer();
  };

  const handleCopyCode = () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(PROMO_CODE)
        .then(() => {
          setHasCopied(true);
          setTimeout(() => setHasCopied(false), 2500);
        })
        .catch(() => {});
    }
  };

  const whatsappText = `Hi Snap Shots! I just saw the welcome offer code ${PROMO_CODE} (15% OFF) on your website and would like to inquire about booking a shoot in ${countryConfig.countryName}.`;
  const cleanNum = siteConfig.business.whatsapp.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanNum}?text=${encodeURIComponent(whatsappText)}`;

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-popup-title"
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-300"
      id="welcome-offer-popup"
    >
      {/* Darkened backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-300"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg rounded-3xl bg-zinc-950 border border-zinc-800 text-white shadow-2xl shadow-black/90 p-5 sm:p-8 overflow-hidden z-10 animate-in zoom-in-95 duration-300 my-auto">
        {/* Ambient brand red atmospheric glow */}
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(189, 22, 22, 0.22) 0%, rgba(189, 22, 22, 0.05) 50%, transparent 70%)',
            filter: 'blur(50px)',
          }}
        />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer border border-zinc-800"
          aria-label="Close welcome offer"
          id="welcome-popup-close-btn"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#bd1616]/15 text-[#bd1616] text-[11px] font-black uppercase tracking-wider border border-[#bd1616]/30 mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Exclusive Welcome Privilege</span>
        </div>

        {/* Headline */}
        <h2 id="welcome-popup-title" className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
          GET <span className="text-[#bd1616]">15% OFF</span> YOUR <br />
          FIRST REEL SHOOT
        </h2>

        {/* Description */}
        <p className="mt-3 text-zinc-300 text-xs sm:text-sm leading-relaxed">
          Experience cinema-grade 4K vertical videography &amp; reels for your upcoming event, brand showcase, or personal shoot in {countryConfig.countryName}. Delivered same-day in 2–6 hours.
        </p>

        {/* Promo Code Box */}
        <div className="mt-5 p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800/90 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              Limited-Time Promo Code
            </div>
            <div className="text-base sm:text-lg font-black tracking-wider text-[#bd1616] font-mono mt-0.5">
              {PROMO_CODE}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black hover:bg-zinc-800 border border-zinc-700 hover:border-[#bd1616]/60 text-xs font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer shrink-0"
            title="Copy promo code"
            id="welcome-popup-copy-btn"
          >
            {hasCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#bd1616]" />
                <span className="text-[#bd1616]">COPIED</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>COPY</span>
              </>
            )}
          </button>
        </div>

        {/* Perks Micro-list */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-[#bd1616]" />
            <span>Cinema 4K Quality</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#bd1616]" />
            <span>Same-Day Delivery</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-2.5">
          {/* Claim & Book CTA (Signature Red Button) */}
          <button
            type="button"
            onClick={handleClaim}
            className="w-full sm:flex-1 h-11 px-5 rounded-full bg-[#bd1616] hover:bg-[#9e1212] active:bg-[#750d0d] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-[#bd1616]/25 hover:shadow-xl hover:shadow-[#bd1616]/35 border border-[#9e1212] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            id="welcome-popup-claim-btn"
          >
            <span>CLAIM OFFER &amp; BOOK</span>
            <ArrowUpRight className="w-4 h-4 text-white" />
          </button>

          {/* WhatsApp Secondary CTA */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleDismiss}
            className="relative w-full sm:w-auto h-11 px-5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white hover:text-[#bd1616] border border-zinc-700 hover:border-[#bd1616] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shrink-0"
            id="welcome-popup-whatsapp-btn"
          >
            <MessageSquare className="w-4 h-4 text-[#bd1616] relative z-10" />
            <span className="relative z-10">WHATSAPP</span>
          </a>
        </div>

        {/* Dismiss subtle option */}
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={handleDismiss}
            className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer underline underline-offset-4"
          >
            No thanks, explore website first
          </button>
        </div>
      </div>
    </div>
  );
};
