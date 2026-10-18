import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageSquare } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { FaqItem } from '../types';

export const FAQ: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(siteConfig.faqs[0].id);

  const toggleFaq = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="bg-transparent py-10 sm:py-14 relative overflow-hidden border-t border-zinc-900/80">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header (Matches ReelOnGo hierarchy) */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <p className="uppercase text-[#bd1616] font-bold text-xs sm:text-sm tracking-widest">FAQS</p>
          <h2
            className="mt-2 text-center text-white font-extrabold text-3xl sm:text-5xl tracking-tight leading-tight"
            id="faq-title"
          >
            Answers to Your Most Common Questions
          </h2>
          <p className="mt-3 text-center text-zinc-300 font-normal text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Explore our FAQ section to find clear and concise answers about our services, booking process, deliverables, and speed.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5 max-w-3xl mx-auto" id="faq-accordion">
          {siteConfig.faqs.map((faq: FaqItem) => {
            const isOpen = openId === faq.id;

            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-zinc-950 border-zinc-700 shadow-lg shadow-black/40'
                    : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full py-4 sm:py-5 px-5 sm:px-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                    {faq.question}
                  </span>
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full bg-[#bd1616] text-white transition-transform duration-200 flex-shrink-0 shadow-xs ${
                      isOpen ? 'rotate-180 bg-[#9e1212]' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-zinc-800 animate-in fade-in duration-200">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still Have Questions Box */}
        <div className="mt-12 text-center">
          <p className="text-xs text-zinc-400">
            Still have questions? We&apos;re here to help anytime.
          </p>
          <a
            href={`https://wa.me/${siteConfig.business.whatsapp.replace(/[^0-9]/g, '')}?text=Hi%20Snap%20Shots%2C%20I%20have%20a%20question%20about%20your%20services.`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#bd1616] hover:bg-[#9e1212] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-colors border border-[#9e1212]"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat directly with a Shoot Producer</span>
          </a>
        </div>
      </div>
    </section>
  );
};
