import React from 'react';
import {
  Instagram,
  Youtube,
  Facebook,
  Phone,
  Mail,
  MapPin,
  ArrowUp,
  MessageSquare,
  Clock,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { siteConfig } from '../config/siteConfig';
import { BrandLogo } from './BrandLogo';

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { label: 'Home', path: '/', isPage: true },
    { label: 'Services', path: '/services', isPage: true },
    { label: 'Our Work', path: '/#work', hash: 'work' },
    { label: 'Packages & Pricing', path: '/#pricing', hash: 'pricing' },
    { label: 'How It Works', path: '/#process', hash: 'process' },
    { label: 'Client Reviews', path: '/#testimonials', hash: 'testimonials' },
    { label: 'FAQs', path: '/faqs', isPage: true },
    { label: 'Contact Us', path: '/contact', isPage: true },
  ];

  const handleNavClick = (link: typeof navLinks[0]) => {
    if (link.isPage) {
      if (location.pathname === link.path) {
        scrollToTop();
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

  const specialties = [
    { name: 'Wedding & Sangeet Reels', desc: 'Candid emotions, rituals & trending audio sync' },
    { name: 'Birthdays & Private Parties', desc: 'High-energy celebration recaps & portraits' },
    { name: 'Corporate Summits & Launches', desc: 'Brand story recaps & founder interviews' },
    { name: 'Restaurants, Cafes & Food', desc: 'Mouthwatering closeups & aesthetic ambience' },
    { name: 'Fashion & Lifestyle Creators', desc: 'Batch content, trending hooks & lookbooks' },
    { name: 'Fitness & Athlete Workouts', desc: 'Dynamic 4K motion, gym PRs & trainer reels' },
  ];

  return (
    <footer className="bg-black/90 backdrop-blur-md text-white pt-12 pb-24 sm:pb-12 border-t border-zinc-800/80 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ========================================================================= */}
        {/* 1. LOGO TOP (Prominently featured at the top of the footer)               */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pb-8 border-b border-zinc-800/80">
          <div>
            <div
              onClick={() => {
                if (location.pathname === '/') {
                  scrollToTop();
                } else {
                  navigate('/');
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }
              }}
              className="cursor-pointer inline-block"
              id="footer-brand-logo"
            >
              <BrandLogo variant="footer" allowUpload={false} />
            </div>
            <p className="text-[11px] sm:text-xs font-bold tracking-[0.22em] text-[#bd1616] uppercase mt-2.5">
              your moments &bull; our snaps
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            <a
              href={siteConfig.business.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-[#bd1616] hover:border-[#bd1616] transition-all hover:scale-105"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href={siteConfig.business.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-[#bd1616] hover:border-[#bd1616] transition-all hover:scale-105"
              aria-label="YouTube"
            >
              <Youtube className="w-4 h-4" />
            </a>
            <a
              href={siteConfig.business.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-[#bd1616] hover:border-[#bd1616] transition-all hover:scale-105"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href={`https://wa.me/${siteConfig.business.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                siteConfig.business.whatsappMessage
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-emerald-400 hover:text-white hover:bg-emerald-600 hover:border-emerald-600 transition-all hover:scale-105"
              aria-label="WhatsApp"
            >
              <MessageSquare className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. TOP TIER: CONTENT AND NAVIGATION SIDE BY SIDE                          */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 py-10 border-b border-zinc-800/80">
          {/* CONTENT (Left Column) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#bd1616]/15 border border-[#bd1616]/30 text-[#bd1616] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>About Snap Shots</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
              Turn Your Moments Into High-Retention Reels &amp; Visual Stories.
            </h3>

            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed max-w-2xl font-normal">
              Snap Shots is an on-demand creator network providing certified Reel Makers and videographers
              equipped with high-end cinema and iPhone rigs. We capture dynamic vertical content for weddings,
              milestone birthdays, culinary dining, and corporate brands across Telangana &amp; USA — delivering
              edited, beat-synced reels in as fast as 2 to 4 hours.
            </p>

            {/* Value Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
              <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs">
                <div className="font-bold text-white text-sm text-[#ffc800]">2–4 Hours</div>
                <div className="text-zinc-400 text-[11px] mt-0.5">Express delivery</div>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs">
                <div className="font-bold text-white text-sm text-[#ffc800]">4K 60fps</div>
                <div className="text-zinc-400 text-[11px] mt-0.5">Full RAW clips access</div>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs col-span-2 sm:col-span-1">
                <div className="font-bold text-white text-sm text-[#ffc800]">4.9 ★ Rating</div>
                <div className="text-zinc-400 text-[11px] mt-0.5">500+ shoots delivered</div>
              </div>
            </div>
          </div>

          {/* NAVIGATION (Right Column - Side by Side) */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4 pb-2 border-b border-zinc-850">
              Quick Navigation
            </h4>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {navLinks.map((l) => (
                <button
                  key={l.label}
                  type="button"
                  onClick={() => handleNavClick(l)}
                  className="flex items-center justify-between text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white hover:translate-x-1 transition-all py-1 cursor-pointer text-left group"
                >
                  <span className="group-hover:text-[#bd1616] transition-colors">{l.label}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-[#bd1616] transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. DOWN TIER: SPECIALTIES AND CONTACT SIDE BY SIDE                        */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 py-10 border-b border-zinc-800/80">
          {/* SPECIALTIES (Left Column) */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 pb-2 border-b border-zinc-850 flex items-center justify-between">
              <span>Our Specialties</span>
              <span className="text-[#bd1616] text-[10px] font-bold">4K Video &amp; Stills</span>
            </h4>

            <p className="text-xs text-zinc-400">
              Tailored on-ground video production crafted for specific occasions and visual styles:
            </p>

            <div className="space-y-2.5">
              {specialties.map((spec) => (
                <div
                  key={spec.name}
                  onClick={() => {
                    navigate('/services');
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }}
                  className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-850 hover:border-[#bd1616]/60 transition-all cursor-pointer group flex items-start gap-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#bd1616] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-white group-hover:text-[#ffc800] transition-colors">
                      {spec.name}
                    </div>
                    <div className="text-[11px] text-zinc-400">{spec.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CONTACT (Right Column - Side by Side) */}
          <div className="space-y-4 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 pb-2 border-b border-zinc-850 flex items-center justify-between">
                <span>Contact &amp; Bookings</span>
                <span className="text-emerald-400 text-[10px] font-bold">Live Support</span>
              </h4>

              <p className="text-xs text-zinc-400 mt-3">
                Have questions or need a custom quote? Reach our coordination desk instantly:
              </p>

              <div className="space-y-3 mt-4">
                {/* WhatsApp */}
                <a
                  href={`https://wa.me/${siteConfig.business.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    siteConfig.business.whatsappMessage
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-850 hover:border-emerald-500/60 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                        WhatsApp Booking Desk
                      </div>
                      <div className="text-[11px] text-zinc-400">+91 90143 19818</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/80">
                    Fast Reply
                  </span>
                </a>

                {/* Email */}
                <a
                  href={`mailto:${siteConfig.business.email}`}
                  className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-850 hover:border-[#bd1616]/60 transition-all flex items-center gap-3 group"
                >
                  <div className="p-2 rounded-xl bg-[#bd1616]/10 text-[#bd1616]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-[#bd1616] transition-colors">
                      Email Inquiries
                    </div>
                    <div className="text-[11px] text-zinc-400">{siteConfig.business.email}</div>
                  </div>
                </a>

                {/* Location */}
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-850 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#bd1616]/10 text-[#bd1616]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Coverage Locations</div>
                    <div className="text-[11px] text-zinc-400">Telangana, India &bull; USA</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct CTA Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  navigate('/contact');
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                className="w-full h-12 rounded-2xl bg-[#bd1616] hover:bg-[#9e1212] active:bg-[#750d0d] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#bd1616]/30 active:scale-98 transition-all border border-[#9e1212] cursor-pointer"
                id="footer-book-cta-btn"
              >
                <span>BOOK A SHOOT NOW</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. BOTTOM BAR: COPYRIGHT, FAQS, BACK TO TOP & ADMIN                       */}
        {/* ========================================================================= */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p className="text-center sm:text-left">
            &copy; {new Date().getFullYear()} {siteConfig.business.name}. All rights reserved.
          </p>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <button
              onClick={() => {
                navigate('/faqs');
                window.scrollTo({ top: 0, behavior: 'instant' });
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              FAQs
            </button>
            <span>&bull;</span>
            <button
              onClick={() => {
                navigate('/contact');
                window.scrollTo({ top: 0, behavior: 'instant' });
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Contact Desk
            </button>
            <span>&bull;</span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
              aria-label="Back to top"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
