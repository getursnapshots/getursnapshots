import React, { useState, useMemo } from 'react';
import { ChevronDown, Search, HelpCircle, MessageSquare, Phone, Mail, Sparkles, ArrowUpRight } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { FaqItem } from '../types';

interface FaqsPageProps {
  onOpenBooking: () => void;
}

export const FaqsPage: React.FC<FaqsPageProps> = ({ onOpenBooking }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [openId, setOpenId] = useState<string | null>(siteConfig.faqs[0]?.id || null);

  const categories = ['All', 'Booking & Pricing', 'Delivery & Edits', 'Gear & Creators', 'Rights & Footage'];

  // Categorize or enhance FAQs
  const allFaqs: (FaqItem & { faqCategory: string })[] = useMemo(() => {
    return [
      ...siteConfig.faqs.map((f, idx) => ({
        ...f,
        faqCategory:
          idx % 4 === 0
            ? 'Booking & Pricing'
            : idx % 4 === 1
            ? 'Delivery & Edits'
            : idx % 4 === 2
            ? 'Gear & Creators'
            : 'Rights & Footage',
      })),
      {
        id: 'faq-extra-1',
        question: 'Can I choose the music and audio track for my reels?',
        answer:
          'Yes, absolutely! You can send us preferred trending audio tracks, Spotify links, or specific songs. Our editors will beat-sync the cuts to match the rhythm perfectly. If you are unsure, our team selects high-engagement, trending Instagram tracks suitable for your occasion.',
        faqCategory: 'Delivery & Edits',
      },
      {
        id: 'faq-extra-2',
        question: 'What happens if my event runs late or extends beyond the booked time?',
        answer:
          'Our creator can extend the shoot on-ground subject to schedule availability. Extension rates are transparent and billed on a per-hour basis. Simply coordinate directly with your assigned Reel Maker or ping our live WhatsApp desk.',
        faqCategory: 'Booking & Pricing',
      },
      {
        id: 'faq-extra-3',
        question: 'Do you shoot outside Telangana and the USA?',
        answer:
          'Yes, our team frequently travels for destination weddings, multi-city brand tours, and music festivals. Travel and accommodation can be included directly in a single transparent package quote.',
        faqCategory: 'Booking & Pricing',
      },
      {
        id: 'faq-extra-4',
        question: 'How do I receive my high-resolution 4K raw footage?',
        answer:
          'All raw 4K clips are uploaded to a private high-speed cloud drive (Google Drive / Dropbox) immediately following the shoot. You will receive a permanent, secure download link with full unrestricted personal and commercial usage rights.',
        faqCategory: 'Rights & Footage',
      },
    ];
  }, []);

  const filteredFaqs = useMemo(() => {
    return allFaqs.filter((faq) => {
      const matchesCat =
        selectedCategory === 'All' || faq.faqCategory.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [allFaqs, selectedCategory, searchQuery]);

  const toggleFaq = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="pt-24 sm:pt-28 pb-20 bg-transparent min-h-screen text-white">
      {/* Background Ambient Glow */}
      <div
        className="absolute pointer-events-none top-24 left-1/2 -translate-x-1/2"
        style={{
          width: '750px',
          height: '420px',
          opacity: 0.15,
          borderRadius: '500px',
          background: 'radial-gradient(circle, #bd1616 0%, #200000 60%, transparent 80%)',
          filter: 'blur(110px)',
          zIndex: 0,
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#bd1616]/15 border border-[#bd1616]/30 mb-4 shadow-xs">
            <HelpCircle className="w-3.5 h-3.5 text-[#bd1616]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#bd1616]">
              FREQUENTLY ASKED QUESTIONS
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Everything You Need To Know Before Your Shoot
          </h1>

          <p className="mt-3 text-base text-zinc-300 leading-relaxed font-normal">
            Find immediate answers on our same-day delivery, certified creators, transparent pricing, and 4K raw clips access.
          </p>
        </div>

        {/* Real-Time Search Bar */}
        <div className="relative max-w-xl mx-auto mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions (e.g. raw clips, delivery, pricing, iPhone)..."
            className="w-full h-12 pl-11 pr-4 rounded-full bg-zinc-950/90 border border-zinc-800 focus:border-[#bd1616] focus:ring-2 focus:ring-[#bd1616]/20 text-white placeholder-zinc-500 text-sm outline-none transition-all shadow-lg"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar py-1 px-2 -mx-4 sm:mx-0 sm:px-0 sm:flex-wrap gap-2 w-full touch-pan-y">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#bd1616] text-white shadow-md shadow-[#bd1616]/30 font-bold scale-105'
                    : 'bg-zinc-900/90 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQs Accordion List */}
        <div className="space-y-3.5 mb-14" id="faqs-page-accordion">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = openId === faq.id;

              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'bg-zinc-950 border-zinc-700 shadow-xl shadow-black/60'
                      : 'bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                    className="w-full py-4 sm:py-5 px-5 sm:px-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                        {faq.question}
                      </span>
                    </div>

                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full bg-[#bd1616] text-white transition-transform duration-200 flex-shrink-0 shadow-xs ${
                        isOpen ? 'rotate-180 bg-[#9e1212]' : ''
                      }`}
                    >
                      <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-zinc-800/80 animate-in fade-in duration-200">
                      <p>{faq.answer}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-900 text-zinc-400 border border-zinc-800">
                          Category: {faq.faqCategory}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center bg-zinc-950/60 rounded-2xl border border-zinc-800">
              <p className="text-zinc-400 text-sm">No questions matched &quot;{searchQuery}&quot;.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="mt-3 text-xs text-[#bd1616] font-bold underline cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>

        {/* Still Have Questions Box */}
        <div className="p-8 sm:p-10 rounded-3xl bg-zinc-950 border border-zinc-800 text-center shadow-2xl relative overflow-hidden">
          <div className="h-14 w-14 rounded-full bg-[#bd1616]/20 border border-[#bd1616]/30 flex items-center justify-center text-[#bd1616] mx-auto mb-4">
            <MessageSquare className="w-7 h-7" />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-white">Still have a specific question?</h3>
          <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
            Our team is available 7 days a week on WhatsApp and phone for instant answers, custom quotes, and creator checks.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href={`https://wa.me/${siteConfig.business.whatsapp.replace(/[^0-9]/g, '')}?text=Hi%20Snap%20Shots%2C%20I%20have%20a%20question.`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full bg-[#bd1616] hover:bg-[#9e1212] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#bd1616]/30 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>CHAT ON WHATSAPP</span>
            </a>

            <button
              onClick={onOpenBooking}
              className="px-6 py-3 rounded-full border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span>BOOK A SHOOT NOW</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
