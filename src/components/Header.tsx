import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, MessageSquare, UserPlus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { siteConfig } from '../config/siteConfig';
import logoPng from '../assets/logo.png';

interface HeaderProps {
  onBookClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onBookClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let ticking = false;
    let lastState = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.scrollY > 20;
          if (scrolled !== lastState) {
            setIsScrolled(scrolled);
            lastState = scrolled;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Nav links matching the reference layout
  const navLinks = [
    { label: 'Home', path: '/', isPage: true },
    { label: 'Pricing', path: '/#pricing', hash: 'pricing' },
    { label: 'Services', path: '/services', isPage: true },
    { label: 'Process', path: '/#process', hash: 'process' },
    { label: 'Testimonials', path: '/#testimonials', hash: 'testimonials' },
    { label: 'FAQs', path: '/faqs', isPage: true },
    { label: 'Contact Us', path: '/contact', isPage: true },
  ];

  const handleNavClick = (link: typeof navLinks[0]) => {
    setMobileMenuOpen(false);

    if (link.isPage) {
      if (location.pathname === link.path) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        navigate(link.path);
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    } else if (link.hash) {
      if (location.pathname === '/') {
        const el = document.getElementById(link.hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/');
        setTimeout(() => {
          const el = document.getElementById(link.hash!);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      }
    }
  };

  const handleBecomeCreator = () => {
    setMobileMenuOpen(false);
    const message = encodeURIComponent(
      'Hi Snap Shots, I am a certified videographer / reel-maker and would like to join the creator network.'
    );
    window.open(`https://wa.me/${siteConfig.business.whatsapp.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
  };

  return (
    <>
      {/* Header Bar */}
      <header
        id="main-header"
        className="fixed top-3 sm:top-4 left-0 right-0 z-50 px-3 sm:px-6 pointer-events-none"
      >
        <div className="mx-auto max-w-5xl sm:max-w-6xl w-full">
          {/* Floating Pill Container (Black Background, White Menu Button) */}
          <div
            className={`w-full bg-black/95 text-white rounded-full px-4 sm:px-6 py-2 sm:py-2.5 shadow-[0_10px_35px_rgba(0,0,0,0.65)] flex items-center justify-between border border-zinc-800/90 backdrop-blur-md pointer-events-auto transition-all duration-300 ${
              isScrolled ? 'shadow-[0_14px_45px_rgba(0,0,0,0.85)] border-zinc-700/80 scale-[0.99]' : ''
            }`}
          >
            {/* Header Brand Logo (Left) */}
            <div className="flex items-center gap-2">
              <div
                onClick={() => {
                  if (location.pathname === '/') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    navigate('/');
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }
                }}
                className="flex items-center shrink-0 min-w-[130px] sm:min-w-[160px] md:min-w-[180px] cursor-pointer focus:outline-none"
                id="header-brand-logo"
                aria-label="Snap Shots Home"
              >
                <img
                  src={logoPng || '/assets/logo.png'}
                  onError={(e) => {
                    const el = e.currentTarget;
                    if (!el.src.endsWith('/assets/logo.png')) {
                      el.src = '/assets/logo.png';
                    } else if (!el.src.endsWith('/logo.png')) {
                      el.src = '/logo.png';
                    }
                  }}
                  alt="Snap Shots"
                  width={160}
                  height={36}
                  style={{ aspectRatio: '1382/310', minWidth: '120px' }}
                  className="h-8 sm:h-9 md:h-10 w-auto max-h-[44px] object-contain block transition-all duration-200"
                  loading="eager"
                  decoding="sync"
                />
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav
              className="hidden lg:flex items-center gap-1 xl:gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/90 border border-zinc-800"
              id="desktop-nav"
            >
              {navLinks.map((link) => {
                const isActive = link.isPage && location.pathname === link.path;

                return (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => handleNavClick(link)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-[#bd1616] text-white shadow-xs'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>

            {/* Right Action Cluster */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">

              {/* Desktop "BOOK A SHOOT" Action Button (Brand Red #bd1616) */}
              <button
                onClick={onBookClick}
                className="hidden sm:inline-flex h-9 sm:h-10 px-4 sm:px-5 items-center justify-center gap-2 rounded-full bg-[#bd1616] hover:bg-[#9e1212] active:bg-[#750d0d] text-xs font-bold text-white uppercase tracking-wider shadow-md shadow-[#bd1616]/30 hover:shadow-lg hover:shadow-[#bd1616]/40 transition-all duration-200 active:scale-95 border border-[#9e1212] cursor-pointer"
                id="header-book-btn"
              >
                <span>BOOK A SHOOT</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              {/* Circular White Menu Toggle Button with 2 Bold Black Horizontal Bars (=) - Mobile/Tablet only */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="flex lg:hidden h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white hover:bg-zinc-100 active:bg-zinc-200 text-black shadow-md border border-zinc-200 transition-all duration-200 active:scale-95 cursor-pointer shrink-0"
                aria-label="Open Menu"
                id="header-menu-toggle-btn"
              >
                <div className="flex flex-col gap-1.5 items-center justify-center" aria-hidden="true">
                  <span className="w-4 h-[2.5px] bg-black rounded-full block" />
                  <span className="w-4 h-[2.5px] bg-black rounded-full block" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MOBILE MENU MODAL                                                         */}
      {/* ========================================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-3.5 sm:p-5 pt-3 sm:pt-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          {/* Backdrop Click to Close */}
          <div
            className="fixed inset-0 -z-10"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Black Transparent Rounded Card (matching Header glassmorphic theme) */}
          <div
            className="relative w-full max-w-md sm:max-w-lg bg-black/95 text-white rounded-[32px] sm:rounded-[36px] shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-6 sm:p-8 border border-zinc-800/90 backdrop-blur-md animate-in zoom-in-95 duration-200 flex flex-col justify-between"
            id="reference-mobile-menu-card"
          >
            {/* Top Bar: Brand Logo on Left & Dark Circular 'X' on Right */}
            <div className="flex items-center justify-between mb-6 pb-2">
              <div
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (location.pathname === '/') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    navigate('/');
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }
                }}
                className="cursor-pointer"
              >
                <img
                  src={logoPng || '/assets/logo.png'}
                  onError={(e) => {
                    const el = e.currentTarget;
                    if (!el.src.endsWith('/assets/logo.png')) {
                      el.src = '/assets/logo.png';
                    } else if (!el.src.endsWith('/logo.png')) {
                      el.src = '/logo.png';
                    }
                  }}
                  alt="Snap Shots"
                  width={160}
                  height={36}
                  style={{ aspectRatio: '1382/310', minWidth: '120px' }}
                  className="h-8 sm:h-9 w-auto max-h-[40px] object-contain block"
                  loading="eager"
                  decoding="sync"
                />
              </div>

              {/* Dark Circular Close Button with White X */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900/90 hover:bg-[#bd1616] text-white border border-zinc-700/80 hover:border-[#bd1616] shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
                aria-label="Close Menu"
              >
                <X className="w-5 h-5 text-white stroke-[2.5]" />
              </button>
            </div>

            {/* Navigation Links List */}
            <nav className="flex flex-col space-y-1 my-1">
              {navLinks.map((link) => {
                const isActive = link.isPage && location.pathname === link.path;
                return (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => handleNavClick(link)}
                    className={`text-left font-semibold text-sm sm:text-[15px] transition-all px-2.5 py-1.5 rounded-xl cursor-pointer flex items-center justify-between group ${
                      isActive
                        ? 'text-[#bd1616] bg-[#bd1616]/10 font-bold'
                        : 'text-zinc-200 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{link.label}</span>
                    <span className="text-zinc-500 group-hover:text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      &rarr;
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Bottom Actions Cluster */}
            <div className="mt-4 pt-3.5 border-t border-zinc-800/90 flex flex-col gap-2.5">
              {/* Primary Action Button: "Book Now ↗" */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onBookClick();
                }}
                className="w-full h-11 sm:h-12 rounded-full bg-[#bd1616] hover:bg-[#9e1212] active:bg-[#750d0d] text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#bd1616]/30 active:scale-98 transition-all cursor-pointer border border-[#9e1212]"
                id="menu-book-now-btn"
              >
                <span>Book Now</span>
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>

              {/* Secondary Action Button: "Become a Creator" */}
              <button
                type="button"
                onClick={handleBecomeCreator}
                className="w-full h-11 sm:h-12 rounded-full bg-zinc-900/90 hover:bg-zinc-800 active:bg-zinc-850 border border-zinc-700/80 hover:border-zinc-600 text-zinc-200 hover:text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all cursor-pointer"
                id="menu-become-creator-btn"
              >
                <UserPlus className="w-3.5 h-3.5 text-zinc-300" />
                <span>Become a Creator</span>
              </button>

              {/* Direct WhatsApp Quick Chat Link */}
              <div className="pt-2 text-center">
                <a
                  href={`https://wa.me/${siteConfig.business.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    siteConfig.business.whatsappMessage
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#ffc800]" />
                  <span>Need help? Chat with our team on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
